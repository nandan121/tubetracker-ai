# TubeTracker AI

TubeTracker AI is a modern, privacy-focused web application that tracks recent video uploads from your favorite YouTube channels. It provides a clean, unified feed of the latest content without the distractions of the YouTube algorithm.

Thanks to [Google AI Studio - Gemini 3 Pro](https://aistudio.google.com/apps/drive/1BoaR3XG4WFupbOeEqHPMQSDnfYQtAboV)

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Features

*   **Unified Video Feed**: View the latest videos from all your tracked channels in one place.
*   **Smart Search**: Instantly filter videos by title, description, or channel name.
*   **Customizable Lookback**: Choose how many days back to scan for new videos (default: 5 days).
*   **Auto-Scan**: Automatically checks for new videos if you haven't visited in a while (default: 12 hours).
*   **Dark & Light Mode**: Fully themed interface to match your preference.
*   **Secure Access**: Simple PIN-based authentication to keep your feed private.
*   **Local Storage**: Your channels and settings are saved locally in your browser.

## Tech Stack

*   **Frontend**: React 19, Vite, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **API**: YouTube Data API v3 (via Google Cloud)

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the app:
    ```bash
    npm run dev
    ```

## Get Channel IDs

To get the Channel ID from a YouTube handle (e.g., `@1littlecoder`), run the following command in your terminal:

```bash
echo 1littlecoder | xargs -I {} curl -s https://www.youtube.com/@{} | grep -o 'channel_id=[^"]*' | head -n 1 | sed 's/channel_id=//'
```

## Deploy to Vercel

To deploy this app on Vercel:

1.  Upload this repository to GitHub.
2.  Import the project in Vercel.
3.  Add the following **Environment Variables** in the Vercel Project Settings:
    *   `API_KEY`: Your Google Cloud YouTube Data API Key.
    *   `AUTH_PIN`: The PIN you want to use to unlock the app.

<img width="1567" height="929" alt="image" src="https://github.com/user-attachments/assets/aed5dcf9-3f04-4ace-91d5-4c73c6923cc0" />
