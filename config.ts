
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
  // DEFAULT CHANNELS (Deprecated - Use defaultProfiles instead for better organization)
  // These load into the "Default" profile if no profiles exist.
  defaultChannels: [
    "@AICodeKing",
    "@mreflow",
  ],
  
  // DEFAULT PROFILES
  // You can pre-define multiple profiles here. Each will have its own independent feed.
  
  defaultProfiles: [
    {
        name: "AI & Coding",
        channels: ["@AICodeKing", "@mreflow", "@matthew_berman"]
        /*  
        list so that I can copy and paste in UI
        @AICodeKing, @mreflow, @matthew_berman, @codedigiptbiplab, @theAIsearch, @WesRoth, @engineerprompt, @MervinPraison, @1littlecoder, @AstroKJ, @TheoreticallyMedia, @futurepedia_io, @realrobtheaiguy, @CreatorMagicAI, @AISeeKing, @intheworldofai, @Corbin_Brown, @SkillLeapAI, @aiexplained-official, @graceleungyl, @TheAIAutomators, @airevolutionx, @suryakunju, @DavidOndrej, @webdoze, @AlexFinnOfficial
        */
    },
    {
        name: "Finance",
        channels: ["@JosephCarlsonShow", "@EverythingMoney"]
    }
  ],
  /*
  backup of current Sept 2026


x='\n    {\n'+JSON.parse(localStorage.getItem('tubetracker_profiles_v1')||'[]').map(p=>`        name: "${p.name}",\n        channels: [${p.channels.map(c=>`"${c.handle}"`).join(', ')}]`).join('\n    },\n    {')+'\n    }\n';t=document.createElement('textarea');t.value=x;document.body.append(t);t.select();document.execCommand('copy');t.remove();console.log('%c✅ COPIED TO CLIPBOARD — PASTE NOW','background:#0a0;color:#fff;font-size:18px;font-weight:bold;padding:8px')


    {
        name: "AI",
        channels: ["@aicodeking", "@engineerprompt", "@mervinpraison", "@1littlecoder", "@astrokj", "@theoreticallymedia", "@futurepedia_io", "@realrobtheaiguy", "@creatormagicai", "@aiseeking", "@intheworldofai", "@corbin_brown", "@skillleapai", "@aiexplained-official", "@graceleungyl", "@theaiautomators", "@airevolutionx", "@suryakunju", "@davidondrej", "@webdoze", "@alexfinnofficial", "@codedigiptbiplab", "@theaisearch", "@wesroth", "@mreflow", "@matthew_berman", "@vaibhavsisinty", "@bulbdigital", "@rezadorrani", "@websitelearners", "@thiojoe", "@manuagi", "@datascienceinyourpocket", "@aiphyox"]
    },
    {        name: "Spiritual",
        channels: ["@amaravatibuddhistmonastery", "@hillsidehermitage", "@samanadipahermitage", "@samanerijayasara"]
    },
    {        name: "Finance",
        channels: ["@jamesshack", "@pensioncraft", "@keerthisfinfonri", "@nrimoneywithalok", "@meaningfulmoney", "@damientalksmoney", "@taxationwithcasahiljain", "@nrimoneyclinic", "@nickcrease", "@newmoneyyoutube", "@kirankaurfinance", "@becleverwithyourcash", "@edmundbaileyuk", "@creativeplanning", "@wealthyretirementuk", "@principlespersonalfinance", "@chrisbourne-retirementplanner"]
    }


  
  
  */
  
  defaultLookbackDays: 5,
  defaultAutoRefreshHours: 1,
  defaultTheme: 'dark',
  defaultDebugLogging: true,
  defaultMaxResults: 20,
  defaultMinDuration: 90 // Filter out videos shorter than 90 seconds (YouTube Shorts)
};
