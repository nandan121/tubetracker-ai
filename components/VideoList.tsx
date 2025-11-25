
import React from 'react';
import { ExternalLink, PlayCircle, Clock, Calendar, Eye } from 'lucide-react';
import { VideoResult } from '../types';

interface VideoListProps {
  videos: VideoResult[];
  isLoading: boolean;
  hasSearched: boolean;
}

// Helper for "2 hours ago" format
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval >= 1) {
    const value = Math.floor(interval);
    return value + (value === 1 ? " year ago" : " years ago");
  }

  interval = seconds / 2592000;
  if (interval >= 1) {
    const value = Math.floor(interval);
    return value + (value === 1 ? " month ago" : " months ago");
  }

  interval = seconds / 86400;
  if (interval >= 1) {
    const value = Math.floor(interval);
    return value + (value === 1 ? " day ago" : " days ago");
  }

  interval = seconds / 3600;
  if (interval >= 1) {
    const value = Math.floor(interval);
    return value + (value === 1 ? " hour ago" : " hours ago");
  }

  interval = seconds / 60;
  if (interval >= 1) {
    const value = Math.floor(interval);
    return value + (value === 1 ? " minute ago" : " minutes ago");
  }

  const value = Math.floor(seconds);
  return value + (value === 1 ? " second ago" : " seconds ago");
};

// Parse ISO 8601 duration (e.g. PT15M33S -> 15:33)
const parseDuration = (duration?: string): string | null => {
  if (!duration) return null;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format view count (e.g. 1234567 -> 1.2M)
const formatViewCount = (count?: string): string | null => {
  if (!count) return null;

  const num = parseInt(count);
  if (isNaN(num)) return null;

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const VideoList: React.FC<VideoListProps> = ({ videos, isLoading, hasSearched }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="animate-pulse">Fetching latest videos from YouTube...</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
        <p>Add channels and click "Scan for Videos" to begin.</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <p>No new videos found in the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="-mx-2">
      {videos.map((video) => (
        <div key={video.id} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 inline-block align-top p-2 mb-5">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-900/20 h-full"
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <PlayCircle className="w-12 h-12 text-gray-400 dark:text-gray-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-60"></div>

              {/* Duration Badge (bottom-left) */}
              {parseDuration(video.duration) && (
                <div className="absolute bottom-2 left-2 bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded backdrop-blur-sm">
                  {parseDuration(video.duration)}
                </div>
              )}

              {/* Date Badge (bottom-right) */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                <Clock className="w-3 h-3 text-red-400" />
                {timeAgo(video.publishedAt)}
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-gray-900 dark:text-white font-semibold leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 min-h-11" title={video.title}>
                {video.title}
              </h3>

              <div className="mt-auto pt-1 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{video.channelName}</span>
                  <div className="flex items-center gap-3">
                    {formatViewCount(video.viewCount) && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="w-3 h-3" />
                        <span>{formatViewCount(video.viewCount)} views</span>
                      </div>
                    )}
                    <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
};
