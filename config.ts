
import { ConfigFile } from "./types";

/**
 * CONFIGURATION FILE
 * ------------------
 * 
 * SECURITY NOTE:
 * The API KEY and AUTH PIN are now managed entirely by the server (Vercel).
 * Do NOT put them in this file.
 * 
 * 1. Go to Vercel Project Settings > Environment Variables.
 * 2. Add 'API_KEY' (Your Google Cloud YouTube Data API Key).
 * 3. Add 'AUTH_PIN' (The PIN you want to use to unlock the app).
 * 
 * USEFUL LINKS (For your notes):
 * - Credentials: https://console.cloud.google.com/apis/credentials?project=foraiyoutubeaggeratorns
 * - Quotas: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas?project=foraiyoutubeaggeratorns
 */

export const appConfig: ConfigFile = {
  // CHANNELS
  // These are the default channels that load when you open the app.
  defaultChannels: [
    "UCpV_X0VrL8-jg3t6wYGS-1g",
    "UChpleBmo18P08aKCIgti38g",
    "UCWTyktbw5JYoSBduu8LsBgQ",
    "UC0m81bQuthaQZmFbXEY9QSw",
    "UCDq7SjbgRKty5TgGafW8Clg",
    "UCawZsQWqfGSbCI5yjkdVkTA",
    "UCpWS2Gmt0N31th-vdIizPJQ",
    "UCflFbG9kh5ZRcVl1TvzDCPw",
    "UCIgnGlGkVRhd4qNFcEwLL4A",
    "UCqcbQf6yw5KzRoDDcZ_wBSw",
    "UCfI2Wf-yji9reXIhn8U4jkQ",
    "UC0FBv8ckxw1hrZxbUm3G7hA",
    "UCwSozl89jl2zUDzQ4jGJD3g",
    "UC2WmuBuFq6gL08QYG-JjXKw",
	"UCYEHmQ-b1iC02-LMeseQsvw",
  ],
  defaultLookbackDays: 5,
  defaultAutoRefreshHours: 12,
  defaultTheme: 'dark',
  defaultDebugLogging: true
};
