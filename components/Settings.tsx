import React, { useState } from 'react';
import { ChannelManager } from './ChannelManager';
import { Channel, AppConfig, Profile } from '../types';
import { Calendar, Clock, Moon, Sun, ArrowLeft, Info, List, Play, User, Plus, Trash2, Users } from 'lucide-react';

interface SettingsProps {
    config: AppConfig;
    onConfigChange: (newConfig: AppConfig) => void;
    // Profile Props
    profiles: Profile[];
    activeProfileId: string;
    onSwitchProfile: (id: string) => void;
    onCreateProfile: () => void;
    onDeleteProfile: (id: string) => void;
    // Channel Props (Active Profile)
    channels: Channel[];
    onAddChannel: (name: string) => Promise<void>;
    onRemoveChannel: (id: string) => void;
    isLoading: boolean;
    onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    config,
    onConfigChange,
    profiles,
    activeProfileId,
    onSwitchProfile,
    onCreateProfile,
    onDeleteProfile,
    channels,
    onAddChannel,
    onRemoveChannel,
    isLoading,
    onBack
}) => {
    // Local state for confirmation if needed, but App handles most logic.

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-gray-300" />
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            </div>

            {/* Profile Management Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Profile Management
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full md:w-auto">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Active Profile
                        </label>
                        <select
                            value={activeProfileId}
                            onChange={(e) => onSwitchProfile(e.target.value)}
                            disabled={isLoading}
                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border"
                        >
                            {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name} ({profile.channels.length} channels)
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Switching profiles will load its tracked channels and video feed.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button
                            onClick={onCreateProfile}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex-1 md:flex-none"
                        >
                            <Plus className="w-4 h-4" />
                            New Profile
                        </button>

                        {profiles.length > 1 && (
                            <button
                                onClick={() => onDeleteProfile(activeProfileId)}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-200 dark:border-red-800 flex-1 md:flex-none"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Preferences */}
                <div className="space-y-6">

                    {/* Lookback Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-red-500" />
                            Lookback Period
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Days to scan:</span>
                            <span className="font-bold text-red-400">{config.daysBack} Day{config.daysBack > 1 ? 's' : ''}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={config.daysBack}
                            onChange={(e) => onConfigChange({ ...config, daysBack: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            How many days back to check for new videos.
                        </p>
                    </div>

                    {/* Max Results Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <List className="w-5 h-5 text-green-500" />
                            Max Results
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Results per channel:</span>
                            <span className="font-bold text-green-400">{config.maxResults || 20}</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            value={config.maxResults || 20}
                            onChange={(e) => onConfigChange({ ...config, maxResults: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                            disabled={isLoading}
                        />
                        <div className="flex items-center gap-2 mt-2">
                            <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <p className="text-xs text-gray-500">
                                Maximum number of videos to fetch from each channel's uploads playlist per scan.
                            </p>
                        </div>
                    </div>

                    {/* Minimum Duration Filter Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-red-500" />
                            Filter Short Videos
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Minimum duration:</span>
                            <span className="font-bold text-red-400">
                                {config.minDuration && config.minDuration > 0 ? `${config.minDuration}s` : 'Disabled'}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="300"
                            step="15"
                            value={config.minDuration || 0}
                            onChange={(e) => onConfigChange({ ...config, minDuration: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                            disabled={isLoading}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-xs text-gray-500">
                                    Filter out videos shorter than the specified duration (0 to disable).
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Set to 90s to filter out YouTube Shorts. Videos without duration info won't be filtered.
                        </p>
                    </div>

                    {/* Auto Refresh Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Auto Refresh
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-300">
                            <span>Refresh every:</span>
                            <span className="font-bold text-blue-400">{config.autoRefreshHours} Hours</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="48"
                            value={config.autoRefreshHours}
                            onChange={(e) => onConfigChange({ ...config, autoRefreshHours: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Automatically scan for new videos if the last update was more than this many hours ago.
                        </p>
                    </div>

                    {/* Theme Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            {config.theme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                            Appearance
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onConfigChange({ ...config, theme: 'dark' })}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${config.theme === 'dark'
                                    ? 'bg-gray-700 border-purple-500 text-white shadow-md'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Moon className="w-4 h-4" /> Dark
                            </button>
                            <button
                                onClick={() => onConfigChange({ ...config, theme: 'light' })}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${config.theme === 'light'
                                    ? 'bg-gray-100 border-yellow-500 text-gray-900 shadow-md'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <Sun className="w-4 h-4" /> Light
                            </button>
                        </div>
                    </div>

                    {/* Debug Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center">🐛</div>
                            Server Debug Logging
                        </h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Enable verbose API logging</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.debugLogging || false}
                                    onChange={(e) => onConfigChange({ ...config, debugLogging: e.target.checked })}
                                    disabled={isLoading}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            When enabled, API calls will log details to the Vercel/Server console (not the browser console).
                        </p>
                    </div>

                </div>

                {/* Right Column: Channel Manager */}
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                            <span>Managed Channels</span>
                            <span className="text-xs font-normal text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                {profiles.find(p => p.id === activeProfileId)?.name}
                            </span>
                        </h3>
                        <div className="h-[500px]">
                            <ChannelManager
                                channels={channels}
                                onAdd={onAddChannel}
                                onRemove={onRemoveChannel}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
