
export interface Channel {
  id: string; // YouTube Channel ID (e.g., UC...)
  name: string;
  thumbnail?: string;
  uploadsPlaylistId: string; // The playlist ID for the channel's uploads (e.g., UU...)
}

export interface VideoResult {
  id: string;
  title: string;
  channelName: string;
  channelId: string;
  url: string;
  publishedAt: string; // ISO string
  thumbnail: string;
  description: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  videos: VideoResult[];
}

export interface AppConfig {
  daysBack: number;
}

export interface ConfigFile {
  apiKey: string;
  requirePin: boolean; 
  authPin?: string; // Optional hardcoded PIN for private deployments
  defaultChannels: string[];
}
