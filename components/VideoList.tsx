
import React from 'react';
import { ExternalLink, PlayCircle, Clock, Calendar } from 'lucide-react';
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
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return Math.floor(seconds) + " seconds ago";
};

export const VideoList: React.FC<VideoListProps> = ({ videos, isLoading, hasSearched }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="animate-pulse">Fetching latest videos from YouTube...</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <PlayCircle className="w-16 h-16 mb-4 opacity-20" />
        <p>Add channels and click "Scan for Videos" to begin.</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
        <p>No new videos found in the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {videos.map((video) => (
        <a
          key={video.id}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-900/20"
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-video bg-gray-900 overflow-hidden">
             {video.thumbnail ? (
               <img 
                 src={video.thumbnail} 
                 alt={video.title}
                 className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                 loading="lazy"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-gray-800">
                 <PlayCircle className="w-12 h-12 text-gray-700" />
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent opacity-60"></div>
             
             {/* Date Badge */}
             <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
               <Clock className="w-3 h-3 text-red-400" />
               {timeAgo(video.publishedAt)}
             </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-white font-semibold leading-snug mb-2 group-hover:text-red-400 transition-colors line-clamp-2" title={video.title}>
              {video.title}
            </h3>
            
            <div className="mt-auto pt-3 border-t border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                 <span className="font-medium truncate max-w-[150px]">{video.channelName}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};
