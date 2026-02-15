
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
    "@AICodeKing",
    "@mreflow",
  /*  @AICodeKing, @mreflow, @matthew_berman, @codedigiptbiplab, @theAIsearch, @WesRoth, @engineerprompt, @MervinPraison, @1littlecoder, @AstroKJ, @TheoreticallyMedia, @futurepedia_io, @realrobtheaiguy, @CreatorMagicAI, @AISeeKing, @intheworldofai, @Corbin_Brown, @SkillLeapAI, @aiexplained-official, @graceleungyl, @TheAIAutomators, @airevolutionx, @suryakunju, @DavidOndrej, @webdoze, @AlexFinnOfficial


  */
  ],
  defaultLookbackDays: 5,
  defaultAutoRefreshHours: 1,
  defaultTheme: 'dark',
  defaultDebugLogging: true,
  defaultMaxResults: 20,
  defaultMinDuration: 90 // Filter out videos shorter than 90 seconds (YouTube Shorts)
};
