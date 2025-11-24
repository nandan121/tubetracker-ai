import { ConfigFile } from "./types";

/**
 * CONFIGURATION FILE
 * ------------------
 * 
 * USEFUL LINKS (For your notes):
 * - Credentials: https://console.cloud.google.com/apis/credentials?project=foraiyoutubeaggeratorns
 * - Quotas: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas?project=foraiyoutubeaggeratorns
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. PUBLIC REPO (Vercel/Netlify):
 *    - Leave 'apiKey' and 'authPin' as empty strings below.
 *    - Go to your Vercel Project Settings > Environment Variables.
 *    - Add 'API_KEY' with your Google Key.
 *    - Add 'AUTH_PIN' with your desired numeric pin (e.g. "1234").
 * 
 * 2. LOCAL DEV / PRIVATE REPO:
 *    - You can hardcode the strings below if you want.
 */

export const appConfig: ConfigFile = {
  // 1. API KEY
  // Uses Environment Variable first. If missing, checks the hardcoded string.
  apiKey: process.env.API_KEY || "", 
  
  // 2. PIN SETTINGS
  requirePin: true, 
  
  // 3. AUTH PIN
  // Uses Environment Variable first. If missing, checks the hardcoded string.
  // If BOTH are empty, the app defaults to "Browser Setup Mode" (User creates PIN in browser).
  authPin: process.env.AUTH_PIN || "", 
  
  // 4. CHANNELS
  defaultChannels: [
    "UCpV_X0VrL8-jg3t6wYGS-1g",
    "UChpleBmo18P08aKCIgti38g",
    "UCWTyktbw5JYoSBduu8LsBgQ",
    "UC0m81bQuthaQZmFbXEY9QSw",
    "UCDq7SjbgRKty5TgGafW8Clg",
    "UCawZsQWqfGSbCI5yjkdVkTA",
    "UCpWS2Gmt0N31th-vdIizPJQ",
  ]
};