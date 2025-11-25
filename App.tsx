import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Settings } from './components/Settings';
import { VideoList } from './components/VideoList';
import { fetchRecentVideos, searchChannel, resolveConfigChannels } from './services/geminiService';
import { Channel, SearchState, AppConfig } from './types';
import { Layout, Calendar, RefreshCw, LogOut, Zap, Settings as SettingsIcon, Search } from 'lucide-react';
import { appConfig } from './config';

const STORAGE_KEY_CHANNELS = 'tubetracker_channels_v2';
const STORAGE_KEY_SEARCH_STATE = 'tubetracker_search_state_v1';
const STORAGE_KEY_CONFIG = 'tubetracker_config_v2';
const DATA_VERSION = '2'; // Increment when VideoResult structure changes

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isResolvingConfig, setIsResolvingConfig] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Config State
  const [config, setConfig] = useState<AppConfig>({
    daysBack: appConfig.defaultLookbackDays || 5,
    autoRefreshHours: appConfig.defaultAutoRefreshHours || 12,
    theme: appConfig.defaultTheme || 'dark'
  });

  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    videos: []
  });

  // Clear old cached data if structure has changed
  useEffect(() => {
    const savedVersion = localStorage.getItem('tubetracker_data_version');
    if (savedVersion !== DATA_VERSION) {
      console.log('Data structure updated - clearing old cached videos');
      localStorage.removeItem(STORAGE_KEY_SEARCH_STATE);
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

  // Load channels from local storage on mount
  useEffect(() => {
    const savedChannels = localStorage.getItem(STORAGE_KEY_CHANNELS);
    if (savedChannels) {
      try {
        setChannels(JSON.parse(savedChannels));
      } catch (e) {
        console.error("Failed to parse saved channels");
      }
    }
  }, []);

  // Save channels to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHANNELS, JSON.stringify(channels));
  }, [channels]);

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
  }, []);

  // Save config to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  // Apply Theme
  useEffect(() => {
    if (config.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [config.theme]);

  // Load search state from local storage on mount
  useEffect(() => {
    const savedSearchState = localStorage.getItem(STORAGE_KEY_SEARCH_STATE);
    if (savedSearchState) {
      try {
        const parsed = JSON.parse(savedSearchState);
        setSearchState(prev => ({
          ...prev,
          lastUpdated: parsed.lastUpdated,
          videos: parsed.videos
        }));
      } catch (e) {
        console.error("Failed to parse saved search state");
      }
    }
  }, []);

  // Save search state to local storage
  useEffect(() => {
    if (searchState.lastUpdated) {
      const stateToSave = {
        lastUpdated: searchState.lastUpdated,
        videos: searchState.videos
      };
      localStorage.setItem(STORAGE_KEY_SEARCH_STATE, JSON.stringify(stateToSave));
    }
  }, [searchState.lastUpdated, searchState.videos]);

  // Handle Config File Processing (Initial Channel Load)
  useEffect(() => {
    const processConfig = async () => {
      if (!isAuthenticated || isResolvingConfig) return;
      if (appConfig.defaultChannels.length === 0) return;

      const missingChannels = appConfig.defaultChannels.filter(configItem => {
        return !channels.some(c => c.id === configItem || c.name.toLowerCase() === configItem.toLowerCase());
      });

      if (missingChannels.length === 0) return;

      const configLoaded = localStorage.getItem('tubetracker_config_loaded_v2');
      if (configLoaded === 'true' && missingChannels.length === 0) {
        return;
      }

      setIsResolvingConfig(true);
      try {
        const resolved = await resolveConfigChannels(missingChannels);
        setChannels(prev => {
          const newSet = [...prev];
          resolved.forEach(r => {
            if (!newSet.some(existing => existing.id === r.id)) {
              newSet.push(r);
            }
          });
          return newSet;
        });
        localStorage.setItem('tubetracker_config_loaded_v2', 'true');
      } catch (e) {
        console.error("Error processing config channels", e);
      } finally {
        setIsResolvingConfig(false);
      }
    };

    processConfig();
  }, [isAuthenticated]);

  // Auto Refresh Logic
  useEffect(() => {
    if (!isAuthenticated || searchState.isLoading || channels.length === 0) return;

    const performScan = () => {
      console.log("Auto-refreshing...");
      handleScan();
    };

    if (!searchState.lastUpdated) {
      // New browser case / fresh start: Always update
      console.log("Fresh start detected. Auto-scanning...");
      performScan();
      return;
    }

    const now = Date.now();
    const msSinceUpdate = now - searchState.lastUpdated;
    const hoursSinceUpdate = msSinceUpdate / (1000 * 60 * 60);

    if (hoursSinceUpdate > config.autoRefreshHours) {
      console.log(`Auto-refreshing: Last updated ${hoursSinceUpdate.toFixed(1)} hours ago (Limit: ${config.autoRefreshHours})`);
      performScan();
    }
  }, [isAuthenticated, searchState.lastUpdated, config.autoRefreshHours, channels.length]); // Intentionally omitting handleScan to avoid loops

  const handleAddChannel = async (name: string) => {
    if (channels.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("Channel already added");
    }
    const newChannel = await searchChannel(name);
    if (channels.some(c => c.id === newChannel.id)) {
      throw new Error("Channel already added");
    }
    setChannels(prev => [...prev, newChannel]);
  };

  const handleRemoveChannel = (id: string) => {
    setChannels(channels.filter(c => c.id !== id));
  };

  const handleScan = async () => {
    if (channels.length === 0) return;

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const videos = await fetchRecentVideos(channels, config.daysBack);

      setSearchState({
        isLoading: false,
        error: null,
        lastUpdated: Date.now(),
        videos: videos
      });
    } catch (err: any) {
      if (err.message.includes("Invalid PIN")) {
        handleLogout();
      }
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "An unknown error occurred"
      }));
    }
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tubetracker_auth_pin');
    setIsAuthenticated(false);
    setSearchState({
      isLoading: false,
      error: null,
      lastUpdated: null,
      videos: []
    });
  };

  // Filter videos based on search query
  const filteredVideos = searchState.videos.filter(video => {
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

  const estimatedCost = channels.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setShowSettings(false)}>
            <div className="bg-red-600 p-2 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">TubeTracker</h1>
          </div>

          {/* Search Bar */}
          {!showSettings && (
            <div className="flex-1 max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
              />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
              {searchState.lastUpdated && (
                <span>Updated: {new Date(searchState.lastUpdated).toLocaleTimeString()}</span>
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
            channels={channels}
            onAddChannel={handleAddChannel}
            onRemoveChannel={handleRemoveChannel}
            isLoading={searchState.isLoading}
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
                    disabled={searchState.isLoading}
                  />
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 w-12">{config.daysBack}d</span>
                </div>
              </div>

              {/* Scan Button */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                {channels.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Est. Cost: {estimatedCost}</span>
                  </div>
                )}
                <button
                  onClick={handleScan}
                  disabled={searchState.isLoading || channels.length === 0}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {searchState.isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {searchState.isLoading ? 'Scanning...' : 'Scan Now'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {searchState.error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-xl flex items-start gap-3">
                <div className="mt-1">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Scan Error</h3>
                  <p className="text-sm opacity-90">{searchState.error}</p>
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
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Uploads'}
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
              </div>
            </div>

            <VideoList
              videos={filteredVideos}
              isLoading={searchState.isLoading}
              hasSearched={searchState.lastUpdated !== null}
            />
          </div>
        )}
      </main>
    </div>
  );
}
