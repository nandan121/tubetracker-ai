import React from 'react';
import { ChannelManager } from './ChannelManager';
import { Channel, AppConfig } from '../types';
import { Calendar, Clock, Moon, Sun, ArrowLeft } from 'lucide-react';

interface SettingsProps {
    config: AppConfig;
    onConfigChange: (newConfig: AppConfig) => void;
    channels: Channel[];
    onAddChannel: (name: string) => Promise<void>;
    onRemoveChannel: (id: string) => void;
    isLoading: boolean;
    onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
    config,
    onConfigChange,
    channels,
    onAddChannel,
    onRemoveChannel,
    isLoading,
    onBack
}) => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-300" />
                </button>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Preferences */}
                <div className="space-y-6">

                    {/* Lookback Settings */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-red-500" />
                            Lookback Period
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-300">
                            <span>Days to scan:</span>
                            <span className="font-bold text-red-400">{config.daysBack} Day{config.daysBack > 1 ? 's' : ''}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={config.daysBack}
                            onChange={(e) => onConfigChange({ ...config, daysBack: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            How many days back to check for new videos.
                        </p>
                    </div>

                    {/* Auto Refresh Settings */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Auto Refresh
                        </h3>
                        <div className="mb-2 flex justify-between text-sm text-gray-300">
                            <span>Refresh every:</span>
                            <span className="font-bold text-blue-400">{config.autoRefreshHours} Hours</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="48"
                            value={config.autoRefreshHours}
                            onChange={(e) => onConfigChange({ ...config, autoRefreshHours: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Automatically scan for new videos if the last update was more than this many hours ago.
                        </p>
                    </div>

                    {/* Theme Settings */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            {config.theme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                            Appearance
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onConfigChange({ ...config, theme: 'dark' })}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${config.theme === 'dark'
                                        ? 'bg-gray-700 border-purple-500 text-white shadow-md'
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                            >
                                <Moon className="w-4 h-4" /> Dark
                            </button>
                            <button
                                onClick={() => onConfigChange({ ...config, theme: 'light' })}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${config.theme === 'light'
                                        ? 'bg-gray-100 border-yellow-500 text-gray-900 shadow-md'
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800'
                                    }`}
                            >
                                <Sun className="w-4 h-4" /> Light
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Channel Manager */}
                <div>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm h-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Managed Channels</h3>
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
