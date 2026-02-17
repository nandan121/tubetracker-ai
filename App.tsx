import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Settings } from './components/Settings';
import { VideoList } from './components/VideoList';
import { fetchRecentVideos, searchChannel, resolveConfigChannels } from './services/geminiService';
import { Channel, SearchState, AppConfig, Profile, VideoResult } from './types';
import { Layout, Calendar, RefreshCw, LogOut, Zap, Settings as SettingsIcon, Search, AlertCircle, UserCircle } from 'lucide-react';
import { appConfig } from './config';

const STORAGE_KEY_PROFILES = 'tubetracker_profiles_v1';
const STORAGE_KEY_ACTIVE_PROFILE = 'tubetracker_active_profile_v1';
// Keep old keys for migration
const STORAGE_KEY_CHANNELS_OLD = 'tubetracker_channels_v3';
const STORAGE_KEY_SEARCH_STATE_OLD = 'tubetracker_search_state_v1';

const STORAGE_KEY_CONFIG = 'tubetracker_config_v2';
const DATA_VERSION = '4'; // Increment for Profiles
const STORAGE_KEY_CONFIG_LOADED = 'tubetracker_config_loaded_v3';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Profiles State
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [dataLoaded, setDataLoaded] = useState(false);

  // Global UI State
  const [isResolvingConfig, setIsResolvingConfig] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Config State
  const [config, setConfig] = useState<AppConfig>({
    daysBack: appConfig.defaultLookbackDays || 5,
    autoRefreshHours: appConfig.defaultAutoRefreshHours || 12,
    theme: appConfig.defaultTheme || 'dark',
    debugLogging: appConfig.defaultDebugLogging ?? true,
    maxResults: appConfig.defaultMaxResults || 20,
    minDuration: appConfig.defaultMinDuration ?? 90
  });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [channelsModified, setChannelsModified] = useState(false);

  // Clear old cached data if structure has changed
  useEffect(() => {
    const savedVersion = localStorage.getItem('tubetracker_data_version');
    if (savedVersion !== DATA_VERSION) {
      console.log('Data structure updated - clearing old cached videos');
      // If version changed, we might want to be careful. 
      // For v3->v4, we want to Keep data to migrate it. 
      // So only clear specific things if entirely incompatible.
      // But here we rely on the migration logic below.
      localStorage.setItem('tubetracker_data_version', DATA_VERSION);
    }
  }, []);

  // Check if we have a PIN stored already
  useEffect(() => {
    const pin = localStorage.getItem('tubetracker_auth_pin');
    if (pin) {
      setIsAuthenticated(true);
    }
  }, []);

  // Load Profiles & Migration Logic
  useEffect(() => {
    const loadData = () => {
      const savedProfiles = localStorage.getItem(STORAGE_KEY_PROFILES);
      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);

      if (savedProfiles) {
        try {
          const parsedProfiles = JSON.parse(savedProfiles);
          setProfiles(parsedProfiles);
          if (savedActiveId && parsedProfiles.some((p: Profile) => p.id === savedActiveId)) {
            setActiveProfileId(savedActiveId);
          } else if (parsedProfiles.length > 0) {
            setActiveProfileId(parsedProfiles[0].id);
          }
        } catch (e) {
          console.error("Failed to parse saved profiles");
          // Fallback to default
          setProfiles([{ id: 'default', name: 'Default', channels: [], searchState: { isLoading: false, error: null, lastUpdated: null, videos: [] } }]);
        }
      } else {
        // MIGRATION: Attempt to Read Old Data
        console.log("No profiles found. Attempting migration from v3...");
        const oldChannelsStr = localStorage.getItem(STORAGE_KEY_CHANNELS_OLD);
        const oldSearchStateStr = localStorage.getItem(STORAGE_KEY_SEARCH_STATE_OLD);

        const oldChannels = oldChannelsStr ? JSON.parse(oldChannelsStr) : [];
        const oldSearchState = oldSearchStateStr ? JSON.parse(oldSearchStateStr) : null;

        const defaultProfile: Profile = {
          id: 'default',
          name: 'Default',
          channels: oldChannels,
          searchState: oldSearchState || {
            isLoading: false,
            error: null,
            lastUpdated: null,
            videos: []
          }
        };

        setProfiles([defaultProfile]);
        setActiveProfileId('default');
      }
      setDataLoaded(true);
    };

    loadData();
  }, []);

  // Save Profiles to Local Storage
  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, activeProfileId);
    }
  }, [profiles, activeProfileId, dataLoaded]);

  // Load config from local storage
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
    setConfigLoaded(true);
  }, []);

  // Save config to local storage
  useEffect(() => {
    if (configLoaded) {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }
  }, [config, configLoaded]);

  // Apply Theme
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // Helper to get active profile
  const getActiveProfile = () => profiles.find(p => p.id === activeProfileId) || profiles[0] || { id: 'default', name: 'Wait...', channels: [], searchState: { videos: [], isLoading: false, error: null, lastUpdated: null } };
  const activeProfile = getActiveProfile();

  // Handle Config File Processing (Initial Channel Load for Default Profiles)
  useEffect(() => {
    const processConfig = async () => {
      console.log("🔧 [Config Sync] Starting processConfig check...");

      if (!isAuthenticated || !dataLoaded) return;
      if (isResolvingConfig) return;

      // 1. Check if we have already processed config for this version
      const configAlreadyLoaded = localStorage.getItem(STORAGE_KEY_CONFIG_LOADED);
      if (configAlreadyLoaded === 'true') return;

      // 2. Determine what to load
      const profilesToInitialize = appConfig.defaultProfiles || (appConfig.defaultChannels.length > 0 ? [{ name: 'Default', channels: appConfig.defaultChannels }] : []);

      if (profilesToInitialize.length === 0) {
        localStorage.setItem(STORAGE_KEY_CONFIG_LOADED, 'true');
        return;
      }

      // 3. Check if we already have these profiles with channels
      // If we have ANY profile with channels, we assume user has set up their own.
      if (profiles.some(p => p.channels.length > 0)) {
        console.log("🔧 [Config Sync] Profiles already have channels. Skipping config sync.");
        localStorage.setItem(STORAGE_KEY_CONFIG_LOADED, 'true');
        return;
      }

      console.log(`🔧 [Config Sync] Resolving ${profilesToInitialize.length} default profiles...`);
      setIsResolvingConfig(true);

      try {
        const newProfiles: Profile[] = [];

        for (const pConfig of profilesToInitialize) {
          console.log(`🔧 [Config Sync] Resolving ${pConfig.channels.length} channels for profile: ${pConfig.name}`);
          const resolved = await resolveConfigChannels(pConfig.channels, config.debugLogging);

          newProfiles.push({
            id: pConfig.name === 'Default' ? 'default' : crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
            name: pConfig.name,
            channels: resolved,
            searchState: { isLoading: false, error: null, lastUpdated: null, videos: [] }
          });
        }

        if (newProfiles.length > 0) {
          setProfiles(newProfiles);
          setActiveProfileId(newProfiles[0].id);
        }

      } catch (e: any) {
        console.error("🔧 [Config Sync] Error processing config profiles", e);
        if (e.message && e.message.includes("Invalid PIN")) {
          setScanError("Invalid PIN. Please logout and try again.");
        }
      } finally {
        localStorage.setItem(STORAGE_KEY_CONFIG_LOADED, 'true');
        setIsResolvingConfig(false);
      }
    };

    if (profiles.length >= 0) {
      processConfig();
    }
  }, [isAuthenticated, dataLoaded, profiles]);

  // Handle Channel Actions
  const handleAddChannel = async (name: string) => {
    // Check against active profile
    if (activeProfile.channels.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Channel already added");
    }
    const newChannel = await searchChannel(name, config.debugLogging);

    // Re-check after fetch
    if (activeProfile.channels.some(c => c.id === newChannel.id)) {
      throw new Error("Channel already added");
    }

    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, channels: [...p.channels, newChannel] };
      }
      return p;
    }));
    setChannelsModified(true);
  };

  const handleRemoveChannel = (id: string) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return { ...p, channels: p.channels.filter(c => c.id !== id) };
      }
      return p;
    }));
    setChannelsModified(true);
  };

  // Profile Management
  const handleCreateProfile = () => {
    const name = prompt("Enter new profile name:");
    if (!name) return;

    const newProfile: Profile = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: name,
      channels: [],
      searchState: { isLoading: false, error: null, lastUpdated: null, videos: [] }
    };

    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert("Cannot delete the last profile.");
      return;
    }
    if (!confirm("Are you sure you want to delete this profile?")) return;

    const newProfiles = profiles.filter(p => p.id !== id);
    setProfiles(newProfiles);
    if (activeProfileId === id) {
      setActiveProfileId(newProfiles[0].id);
    }
  };

  // Scanning Logic - Scans ALL profiles
  const handleScan = async () => {
    const profilesToScan = profiles.filter(p => p.channels.length > 0);
    if (profilesToScan.length === 0) return;

    setIsScanning(true);
    setScanError(null);
    setChannelsModified(false);

    const updatedProfiles = [...profiles];
    let hasError = false;
    let errorMsg = "";

    try {
      // Execute sequentially to avoid rate limits or too many parallel requests?
      // Or parallel? Let's do sequential for safety with API limits if they exist, 
      // though Gemini/YouTube API usually handles parallel ok.
      // Parallel for speed.

      await Promise.all(updatedProfiles.map(async (profile, index) => {
        if (profile.channels.length === 0) return;

        try {
          const videos = await fetchRecentVideos(profile.channels, config.daysBack, config.debugLogging, config.maxResults);
          updatedProfiles[index] = {
            ...profile,
            searchState: {
              isLoading: false,
              error: null,
              lastUpdated: Date.now(),
              videos: videos
            }
          };
        } catch (err: any) {
          console.error(`Error scanning profile ${profile.name}:`, err);
          updatedProfiles[index] = {
            ...profile,
            searchState: {
              ...profile.searchState, // Keep old videos on error?
              isLoading: false,
              error: err.message
            }
          };
          hasError = true;
          errorMsg = err.message;
        }
      }));

      setProfiles(updatedProfiles);

      if (hasError) {
        setScanError(errorMsg.includes("Invalid PIN") ? "Invalid PIN. Please logout." : "Some profiles failed to update.");
      }

    } catch (err: any) {
      setScanError(err.message || "Unknown error during scan");
    } finally {
      setIsScanning(false);
    }
  };

  // Auto Refresh Logic
  useEffect(() => {
    if (!isAuthenticated || isScanning || !dataLoaded) return;

    // Check if ACTIVE profile needs update? Or any?
    // User expects "Scan Now" to update all.
    // Auto-refresh should probably update all too.

    // Check if the current profile has ever been updated
    if (!activeProfile.searchState.lastUpdated && activeProfile.channels.length > 0) {
      console.log("Active profile has no data. Auto-scanning...");
      handleScan();
      return;
    }

    // Check time since last update (of active profile, as proxy?)
    // Let's check active profile's timestamp
    const lastUpdate = activeProfile.searchState.lastUpdated;
    if (lastUpdate) {
      const hoursSince = (Date.now() - lastUpdate) / (1000 * 60 * 60);
      if (hoursSince > config.autoRefreshHours) {
        console.log(`Auto-refresh needed (${hoursSince.toFixed(1)}h > ${config.autoRefreshHours}h)`);
        handleScan();
      }
    }
  }, [isAuthenticated, activeProfile, config.autoRefreshHours, dataLoaded]);


  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tubetracker_auth_pin');
    setIsAuthenticated(false);
    // Clear in-memory state if desired, or just auth flag
  };

  // Helper function to convert ISO 8601 duration to seconds
  const durationToSeconds = (duration?: string): number | null => {
    if (!duration) return null;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Filter videos (Active Profile)
  const filteredVideos = (activeProfile.searchState?.videos || []).filter(video => {
    if (config.minDuration && config.minDuration > 0) {
      const videoDuration = durationToSeconds(video.duration);
      if (videoDuration !== null && videoDuration < config.minDuration) {
        return false;
      }
    }
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.channelName.toLowerCase().includes(query)
    );
  });

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuth} />;
  }

  const estimatedCost = activeProfile.channels.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setShowSettings(false)}>
            <div className="bg-red-600 p-2 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block leading-none">TubeTracker</h1>
              {profiles.length > 1 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{activeProfile.name}</span>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {!showSettings && (
            <div className="flex-1 max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${filteredVideos.length} videos...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
              />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
              {activeProfile.searchState.lastUpdated && (
                <span>Updated: {new Date(activeProfile.searchState.lastUpdated).toLocaleTimeString()}</span>
              )}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'}`}
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              title="Logout / Lock"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings ? (
          <Settings
            config={config}
            onConfigChange={setConfig}
            // Pass Profile Data
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSwitchProfile={setActiveProfileId}
            onCreateProfile={handleCreateProfile}
            onDeleteProfile={handleDeleteProfile}
            // Legacy Props (mapped to active profile)
            channels={activeProfile.channels}
            onAddChannel={handleAddChannel}
            onRemoveChannel={handleRemoveChannel}
            isLoading={isScanning}
            onBack={() => setShowSettings(false)}
          />
        ) : (
          <div className="space-y-6">

            {/* Top Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">

              {/* Lookback Control */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Look back:</span>
                </div>
                <div className="flex items-center gap-3 flex-1 md:flex-none">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={config.daysBack}
                    onChange={(e) => setConfig({ ...config, daysBack: parseInt(e.target.value) })}
                    className="w-full md:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                    disabled={isScanning}
                  />
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 w-12">{config.daysBack}d</span>
                </div>
              </div>

              {/* Profile Selector (Only if multiple profiles) */}
              {profiles.length > 1 && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <UserCircle className="w-5 h-5 text-gray-400" />
                  <select
                    value={activeProfileId}
                    onChange={(e) => setActiveProfileId(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full md:w-48 p-2.5"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scan Button */}
              <div className="flex items-center gap-4 w-full md:w-auto ml-auto md:ml-0">
                {activeProfile.channels.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Est. Cost: {estimatedCost}</span>
                  </div>
                )}
                <button
                  onClick={handleScan}
                  disabled={isScanning || activeProfile.channels.length === 0}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isScanning ? 'Scanning...' : 'Scan Now'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(scanError || activeProfile.searchState.error) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-xl flex items-start gap-3">
                <div className="mt-1">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Scan Error</h3>
                  <p className="text-sm opacity-90">{scanError || activeProfile.searchState.error}</p>
                </div>
              </div>
            )}

            {/* Channels Modified Notification */}
            {channelsModified && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 p-4 rounded-xl flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Channels Updated</h3>
                  <p className="text-sm opacity-90">Your tracked channels have changed. Click "Scan Now" to update the video list.</p>
                </div>
              </div>
            )}

            {/* Config Loading State */}
            {isResolvingConfig && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg flex items-center gap-3 animate-pulse">
                <div className="animate-spin text-blue-500 dark:text-blue-400"><RefreshCw className="w-4 h-4" /></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-700 dark:text-blue-200 font-medium">Syncing Config...</span>
                </div>
              </div>
            )}

            {/* Video List Header */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {searchQuery ? `Search Results (${filteredVideos.length})` :
                  activeProfile.name === 'Default' ? 'Latest Uploads' : `${activeProfile.name} Feed`}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
              </div>
            </div>

            <VideoList
              videos={filteredVideos}
              isLoading={isScanning} // Use global scanning state to show loaders
              hasSearched={activeProfile.searchState.lastUpdated !== null}
            />
          </div>
        )}
      </main>
    </div>
  );
}
