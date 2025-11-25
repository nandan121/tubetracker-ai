
import { VideoResult, Channel } from "../types";

// We now point to our own Vercel API route, not Google directly
const API_PROXY_URL = '/api/youtube';

const getAuthHeaders = () => {
  const pin = localStorage.getItem('tubetracker_auth_pin') || '';
  return {
    'x-auth-pin': pin,
    'Content-Type': 'application/json'
  };
};

// Helper to handle API errors
const handleResponse = async (response: Response, context: string) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response isn't JSON (e.g. 404 HTML page from Vercel if route wrong)
    throw new Error(`Connection Error: ${response.statusText}`);
  }

  if (!response.ok) {
    console.error(`API Error (${context}):`, data);
    
    // Handle specific errors passed from our proxy or Vercel
    if (response.status === 401) {
      throw new Error("Invalid PIN. Please re-enter your PIN.");
    }
    
    // Extract YouTube specific error message if passed through
    const msg = data?.error?.message || data?.error || "Unknown Error";
    throw new Error(msg);
  }
  return data;
};

/**
 * Searches for a channel by name or ID via the Server Proxy.
 */
export const searchChannel = async (query: string): Promise<Channel> => {
  const isChannelId = query.startsWith('UC') && query.length > 18;
  
  let channelId = '';
  let channelName = '';
  let thumbnail = '';
  let uploadsPlaylistId = '';

  if (isChannelId) {
    // === DIRECT LOOKUP ===
    const params = new URLSearchParams({
      endpoint: 'channels',
      part: 'snippet,contentDetails',
      id: query
    });

    const data = await handleResponse(
      await fetch(`${API_PROXY_URL}?${params.toString()}`, { headers: getAuthHeaders() }), 
      'getChannelDirect'
    );

    if (!data.items || data.items.length === 0) {
      throw new Error(`No channel found with ID "${query}"`);
    }

    const item = data.items[0];
    channelId = item.id;
    channelName = item.snippet.title;
    thumbnail = item.snippet.thumbnails?.default?.url;
    uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;

  } else {
    // === SEARCH LOOKUP ===
    // 1. Search for ID
    const searchParams = new URLSearchParams({
      endpoint: 'search',
      part: 'snippet',
      type: 'channel',
      q: query,
      maxResults: '1'
    });

    const searchData = await handleResponse(
      await fetch(`${API_PROXY_URL}?${searchParams.toString()}`, { headers: getAuthHeaders() }), 
      'searchChannel'
    );

    if (!searchData.items || searchData.items.length === 0) {
      throw new Error(`No channel found for "${query}"`);
    }

    const snippet = searchData.items[0].snippet;
    channelId = snippet.channelId;
    channelName = snippet.title;
    thumbnail = snippet.thumbnails?.default?.url;

    // 2. Get Details
    const detailsParams = new URLSearchParams({
      endpoint: 'channels',
      part: 'contentDetails',
      id: channelId
    });

    const channelData = await handleResponse(
      await fetch(`${API_PROXY_URL}?${detailsParams.toString()}`, { headers: getAuthHeaders() }), 
      'getChannelDetails'
    );

    uploadsPlaylistId = channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  }

  if (!uploadsPlaylistId) {
    throw new Error("Could not find uploads playlist for this channel.");
  }

  return {
    id: channelId,
    name: channelName,
    thumbnail,
    uploadsPlaylistId
  };
};

export const resolveConfigChannels = async (queries: string[]): Promise<Channel[]> => {
  const results: Channel[] = [];
  for (const q of queries) {
    try {
      const channel = await searchChannel(q);
      results.push(channel);
    } catch (e) {
      console.warn(`Config: Failed to resolve channel '${q}'`, e);
    }
  }
  return results;
};

export const fetchRecentVideos = async (
  channels: Channel[], 
  days: number
): Promise<VideoResult[]> => {
  if (channels.length === 0) return [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const allVideos: VideoResult[] = [];
  const errors: string[] = [];

  const promises = channels.map(async (channel) => {
    try {
      const params = new URLSearchParams({
        endpoint: 'playlistItems',
        part: 'snippet',
        playlistId: channel.uploadsPlaylistId,
        maxResults: '20'
      });

      const data = await handleResponse(
        await fetch(`${API_PROXY_URL}?${params.toString()}`, { headers: getAuthHeaders() }), 
        `fetchVideos-${channel.name}`
      );

      if (!data.items) return;

      data.items.forEach((item: any) => {
        const snippet = item.snippet;
        const publishedAt = new Date(snippet.publishedAt);

        if (publishedAt >= cutoffDate) {
          allVideos.push({
            id: snippet.resourceId.videoId,
            title: snippet.title,
            channelName: channel.name,
            channelId: snippet.channelId,
            url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
            publishedAt: snippet.publishedAt,
            thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            description: snippet.description
          });
        }
      });
    } catch (err: any) {
      console.warn(`Failed to fetch videos for ${channel.name}`, err);
      errors.push(`${channel.name}: ${err.message}`);
    }
  });

  await Promise.all(promises);

  // Fetch duration and view counts for all found videos
  // We do this in batches of 50 to minimize API calls
  const videoIds = allVideos.map(v => v.id);
  
  if (videoIds.length > 0) {
    const stats: Record<string, { duration: string, viewCount: string }> = {};
    
    // Chunk into 50s
    for (let i = 0; i < videoIds.length; i += 50) {
      const chunk = videoIds.slice(i, i + 50);
      
      try {
        const params = new URLSearchParams({
          endpoint: 'videos',
          part: 'contentDetails,statistics',
          id: chunk.join(',')
        });

        const data = await handleResponse(
          await fetch(`${API_PROXY_URL}?${params.toString()}`, { headers: getAuthHeaders() }),
          'fetchVideoStats'
        );

        if (data.items) {
          data.items.forEach((item: any) => {
            stats[item.id] = {
              duration: item.contentDetails?.duration,
              viewCount: item.statistics?.viewCount
            };
          });
        }
      } catch (e) {
        console.warn("Failed to fetch video stats chunk", e);
      }
    }

    // Merge stats into video objects
    allVideos.forEach(v => {
      if (stats[v.id]) {
        v.duration = stats[v.id].duration;
        v.viewCount = stats[v.id].viewCount;
      }
    });
  }

  if (allVideos.length === 0 && errors.length === channels.length) {
     // Check if it's an auth error (likely first error)
     if (errors[0].includes("Invalid PIN")) {
       throw new Error("Invalid PIN. Please logout and try again.");
     }
     throw new Error(`Failed to fetch videos. Errors: ${errors.join(', ')}`);
  }

  return allVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};
