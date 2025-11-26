
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
  duration?: string; // ISO 8601 duration (e.g. PT15M33S)
  viewCount?: string;
}

export interface SearchState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  videos: VideoResult[];
}

export interface AppConfig {
  daysBack: number;
  autoRefreshHours: number;
  theme: 'dark' | 'light';
  debugLogging?: boolean;
}

export interface ConfigFile {
  defaultChannels: string[];
  defaultLookbackDays: number;
  defaultAutoRefreshHours: number;
  defaultTheme: 'dark' | 'light';
  defaultDebugLogging?: boolean;
}
