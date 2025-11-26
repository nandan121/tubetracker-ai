
import React, { useState } from 'react';
import { Plus, Trash2, Hash, Loader2 } from 'lucide-react';
import { Channel } from '../types';

interface ChannelManagerProps {
  channels: Channel[];
  onAdd: (name: string) => Promise<void>;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({ channels, onAdd, onRemove, disabled }) => {
  const [newChannel, setNewChannel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannel.trim()) {
      setIsAdding(true);
      setAddError(null);

      const handles = newChannel.split(',').map(h => h.trim()).filter(h => h.length > 0);
      const invalidHandles = handles.filter(h => !h.startsWith('@'));

      if (invalidHandles.length > 0) {
        setAddError(`All handles must start with @. Invalid: ${invalidHandles.join(', ')}`);
        setIsAdding(false);
        return;
      }

      try {
        for (const handle of handles) {
          await onAdd(handle);
        }
        setNewChannel('');
      } catch (err: any) {
        setAddError(err.message || "Failed to find channel");
      } finally {
        setIsAdding(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Hash className="w-5 h-5 text-red-500" />
        Tracked Channels
      </h2>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => {
              setNewChannel(e.target.value);
              setAddError(null);
            }}
            placeholder="Channel Handle starting with @ (comma separated)..."
            className={`flex-1 bg-gray-50 dark:bg-gray-900 border ${addError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-colors`}
            disabled={disabled || isAdding}
          />
          <button
            type="submit"
            disabled={!newChannel.trim() || disabled || isAdding}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-10 flex items-center justify-center"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        {addError && <p className="text-xs text-red-400 pl-1">{addError}</p>}
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {channels.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            No channels added yet.
          </div>
        ) : (
          channels.map((channel) => (
            <div
              key={channel.id}
              className="group flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {channel.thumbnail ? (
                  <img src={channel.thumbnail} alt="" className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 dark:text-gray-200">
                    {channel.name.charAt(0)}
                  </div>
                )}
                <span className="text-gray-700 dark:text-gray-200 text-sm truncate font-medium">{channel.name}</span>
              </div>
              <button
                onClick={() => onRemove(channel.id)}
                disabled={disabled}
                className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                aria-label="Remove channel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
