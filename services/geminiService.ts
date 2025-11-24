
import { VideoResult, Channel } from "../types";

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper to handle API errors with better logging and parsing
const handleResponse = async (response: Response, context: string) => {
  if (!response.ok) {
    let errorDetails: any = {};
    try {
      errorDetails = await response.json();
    } catch (e) {
      // Fallback if response is not JSON
      errorDetails = { error: { message: response.statusText } };
    }

    // Log the full error object for debugging purposes
    console.error(`YouTube API Error (${context}):`, JSON.stringify(errorDetails, null, 2));

    const status = response.status;
    
    // deeply extract the error message
    let msg = response.statusText;
    if (typeof errorDetails?.error === 'string') {
        msg = errorDetails.error;
    } else if (errorDetails?.error?.message) {
        msg = errorDetails.error.message;
    }

    const reason = errorDetails?.error?.errors?.[0]?.reason;

    // Handle common YouTube API errors
    if (status === 400 && reason === 'API_KEY_INVALID') {
        throw new Error("Invalid API Key. Please check the key in the Auth screen.");
    }
    if (status === 403) {
      if (reason === 'quotaExceeded') {
        throw new Error("YouTube API Quota exceeded. Please try again tomorrow.");
      }
      if (reason === 'accessNotConfigured') {
        throw new Error("YouTube Data API v3 is not enabled. Please enable it in Google Cloud Console.");
      }
      throw new Error("Access forbidden. Please check your API Key restrictions.");
    }
    
    throw new Error(msg);
  }
  return response.json();
};

/**
 * Searches for a channel by name or resolves a direct Channel ID.
 * Optimization: If input looks like a Channel ID (starts with UC), it costs 1 unit.
 * Otherwise, it performs a search which costs 100 units.
 */
export const searchChannel = async (query: string, apiKey?: string): Promise<Channel> => {
  // Use provided key or fallback to env var. Clean the key to remove quotes/whitespace.
  const effectiveKey = (apiKey || process.env.API_KEY || '').replace(/["']/g, '').trim();
  
  if (!effectiveKey) throw new Error("API Key is missing. Please enter it in the Auth screen.");

  // Simple heuristic: YouTube Channel IDs are usually 24 chars starting with UC
  const isChannelId = query.startsWith('UC') && query.length > 18;
  
  let channelId = '';
  let channelName = '';
  let thumbnail = '';
  let uploadsPlaylistId = '';

  if (isChannelId) {
    // === DIRECT LOOKUP (Cost: 1 Unit) ===
    // We can get snippet and contentDetails in one go
    const url = `${BASE_URL}/channels?part=snippet,contentDetails&id=${query}&key=${effectiveKey}`;
    const data = await handleResponse(await fetch(url), 'getChannelDirect');

    if (!data.items || data.items.length === 0) {
      throw new Error(`No channel found with ID "${query}"`);
    }

    const item = data.items[0];
    channelId = item.id;
    channelName = item.snippet.title;
    thumbnail = item.snippet.thumbnails?.default?.url;
    uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;

  } else {
    // === SEARCH LOOKUP (Cost: ~102 Units) ===
    // 1. Search for the channel ID (Cost: 100 units)
    const searchUrl = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${effectiveKey}`;
    const searchData = await handleResponse(await fetch(searchUrl), 'searchChannel');

    if (!searchData.items || searchData.items.length === 0) {
      throw new Error(`No channel found for "${query}"`);
    }

    const snippet = searchData.items[0].snippet;
    channelId = snippet.channelId;
    channelName = snippet.title;
    thumbnail = snippet.thumbnails?.default?.url;

    // 2. Get the Uploads Playlist ID (Cost: 1 unit)
    const channelsUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${effectiveKey}`;
    const channelData = await handleResponse(await fetch(channelsUrl), 'getChannelDetails');

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

/**
 * Resolves a list of channel strings (names or IDs) from config.
 * It's resilient: it won't fail the whole batch if one fails.
 */
export const resolveConfigChannels = async (queries: string[], apiKey: string): Promise<Channel[]> => {
  const results: Channel[] = [];
  
  // Process sequentially to handle rate limits better, or promise.all for speed. 
  // Sequential is safer for quota errors visibility.
  for (const q of queries) {
    try {
      const channel = await searchChannel(q, apiKey);
      results.push(channel);
    } catch (e) {
      console.warn(`Config: Failed to resolve channel '${q}'`, e);
    }
  }
  
  return results;
};

/**
 * Fetches recent videos from the "Uploads" playlist of each channel.
 * Very efficient: Costs 1 unit per channel.
 */
export const fetchRecentVideos = async (
  channels: Channel[], 
  days: number,
  apiKey?: string
): Promise<VideoResult[]> => {
  if (channels.length === 0) return [];
  const effectiveKey = (apiKey || process.env.API_KEY || '').replace(/["']/g, '').trim();
  if (!effectiveKey) throw new Error("API Key is missing. Please enter it in the Auth screen.");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const allVideos: VideoResult[] = [];
  const errors: string[] = [];

  // Fetch concurrently
  const promises = channels.map(async (channel) => {
    try {
      // Fetch specifically from the uploads playlist (Cost: 1 unit)
      // MaxResults 20 to allow for high-frequency uploaders within the time window
      const url = `${BASE_URL}/playlistItems?part=snippet&playlistId=${channel.uploadsPlaylistId}&maxResults=20&key=${effectiveKey}`;
      const data = await handleResponse(await fetch(url), `fetchVideos-${channel.name}`);

      if (!data.items) return;

      data.items.forEach((item: any) => {
        const snippet = item.snippet;
        const publishedAt = new Date(snippet.publishedAt);

        if (publishedAt >= cutoffDate) {
          allVideos.push({
            id: snippet.resourceId.videoId,
            title: snippet.title,
            channelName: channel.name, // Use stored name for consistency
            channelId: snippet.channelId,
            url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`,
            publishedAt: snippet.publishedAt,
            // Try to get higher quality thumbnail, fall back to default
            thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            description: snippet.description
          });
        }
      });
    } catch (err: any) {
      console.warn(`Failed to fetch videos for ${channel.name}`, err);
      errors.push(`${channel.name}: ${err.message}`);
      // We don't throw here to allow other channels to succeed
    }
  });

  await Promise.all(promises);

  // If all channels failed, throw an error to alert the user
  if (allVideos.length === 0 && errors.length === channels.length) {
     throw new Error(`Failed to fetch videos. Errors: ${errors.join(', ')}`);
  }

  // Sort by date descending (newest first)
  return allVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
};
