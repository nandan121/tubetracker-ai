
import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ChannelManager } from './components/ChannelManager';
import { VideoList } from './components/VideoList';
import { fetchRecentVideos, searchChannel, resolveConfigChannels } from './services/geminiService';
import { Channel, SearchState, AppConfig } from './types';
import { Layout, Calendar, RefreshCw, LogOut, Zap } from 'lucide-react';
import { appConfig } from './config';

const STORAGE_KEY_CHANNELS = 'tubetracker_channels_v2';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [config, setConfig] = useState<AppConfig>({ daysBack: 1 });
  const [isResolvingConfig, setIsResolvingConfig] = useState(false);
  
  const [searchState, setSearchState] = useState<SearchState>({
    isLoading: false,
    error: null,
    lastUpdated: null,
    videos: []
  });

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

  // Handle Config File Processing
  useEffect(() => {
    const processConfig = async () => {
      // Only run if authenticated and not already running
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
        // We no longer pass an API key, the service handles it via headers/proxy
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
        // If it was an auth error (401), we might want to log out, but let's be gentle here
      } finally {
        setIsResolvingConfig(false);
      }
    };

    processConfig();
  }, [isAuthenticated]);

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
      // If error is authentication related, force logout
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

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={handleAuth} />;
  }

  const estimatedCost = channels.length;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">TubeTracker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden sm:block">
              {searchState.lastUpdated && (
                <span>Updated: {new Date(searchState.lastUpdated).toLocaleTimeString()}</span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
              title="Logout / Lock"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar / Controls */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            
            {/* Search Controls */}
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Range
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2 text-gray-300">
                  <span>Look back:</span>
                  <span className="font-bold text-red-400">{config.daysBack} Day{config.daysBack > 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30" 
                  value={config.daysBack}
                  onChange={(e) => setConfig({ ...config, daysBack: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  disabled={searchState.isLoading}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleScan}
                  disabled={searchState.isLoading || channels.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {searchState.isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {searchState.isLoading ? 'Scanning...' : 'Scan for Videos'}
                </button>
                
                {channels.length > 0 && (
                   <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                     <Zap className="w-3 h-3 text-yellow-500" />
                     <span>Est. Cost: <span className="text-gray-300 font-medium">{estimatedCost} units</span></span>
                   </div>
                )}
              </div>
            </div>

            {/* Config Loading State */}
            {isResolvingConfig && (
              <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex items-center gap-3 animate-pulse">
                 <div className="animate-spin text-blue-400"><RefreshCw className="w-4 h-4" /></div>
                 <div className="flex flex-col">
                   <span className="text-sm text-blue-200 font-medium">Syncing Config...</span>
                 </div>
              </div>
            )}

            {/* Channel List */}
            <div className="h-[400px] lg:h-[calc(100vh-24rem)]">
              <ChannelManager
                channels={channels}
                onAdd={handleAddChannel}
                onRemove={handleRemoveChannel}
                disabled={searchState.isLoading}
              />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-8 xl:col-span-9">
            {searchState.error && (
              <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-xl mb-6 flex items-start gap-3">
                <div className="mt-1">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Scan Error</h3>
                  <p className="text-sm opacity-90">{searchState.error}</p>
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Latest Uploads</h2>
              <div className="text-sm text-gray-500">
                Found {searchState.videos.length} videos
              </div>
            </div>

            <VideoList 
              videos={searchState.videos}
              isLoading={searchState.isLoading}
              hasSearched={searchState.lastUpdated !== null}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
