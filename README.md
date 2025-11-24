# TubeTracker AI

TubeTracker AI is a web application that tracks recent video uploads from your favorite YouTube channels. It allows you to manage a list of channels and view their latest videos in a unified feed, with options to filter by date range. It uses a secure PIN-based authentication system.
Thanks to [Google AI Studio - Gemini 3 Pro](https://aistudio.google.com/apps/drive/1BoaR3XG4WFupbOeEqHPMQSDnfYQtAboV)


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Get Channel IDs

To get the Channel ID from a YouTube handle (e.g., `@1littlecoder`), run the following command in your terminal:

```bash
echo 1littlecoder | xargs -I {} curl -s https://www.youtube.com/@{} | grep -o 'channel_id=[^"]*' | head -n 1 | sed 's/channel_id=//'
```

## Deploy to Vercel

To deploy this app on Vercel:

1. Upload this repository to GitHub.
2. Import the project in Vercel.
3. Add the following **Environment Variables** (see `config.ts` for details):
   - `API_KEY`: Your Google Cloud YouTube Data API Key.
   - `AUTH_PIN`: The PIN you want to use to unlock the app.
  
<img width="1567" height="929" alt="image" src="https://github.com/user-attachments/assets/aed5dcf9-3f04-4ace-91d5-4c73c6923cc0" />

