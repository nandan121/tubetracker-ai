<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TubeTracker-AI

A small AI Studio web app. This repository contains everything needed to run the app locally and deploy it to Vercel.

## Summary
- Purpose: an AI-powered web app (built with Node.js / Next.js or similar).
- Note: This project may or may not require external API keys. Check your project files to confirm required environment variables.

## Quickly detect required env vars
Run these commands in the project root to locate any environment variables used by the code:
```bash
# find references to GEMINI or similar
grep -R --line-number -i "GEMINI" .

# list all uses of process.env
grep -R --line-number "process.env" .
```
If you find a variable (for example SOME_API_KEY) follow the local and Vercel steps below to provide it.

If you want, share config.ts or the files that reference process.env and I will update this README with the exact variables.

## Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node.js)

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` at the project root only if the project requires environment variables (see "Quickly detect required env vars" above). Example format:
   ```env
   # only add keys that the code actually uses, e.g.:
   SOME_API_KEY=your_value_here
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000` (or the port printed by the dev server).

## Production build (locally)
1. Build:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start
   ```

## Deploy to Vercel
1. Push repository to GitHub (or GitLab/Bitbucket).
2. In Vercel dashboard, click "New Project" → Import your repo.
3. Add any environment variables discovered earlier under Project Settings → Environment Variables (Production / Preview / Development).
4. Build & Output settings:
   - Build Command: `npm run build`
   - Output Directory: leave default for Next.js (Vercel auto-detects Next.js). Otherwise set your framework's output directory.
5. Node version:
   - Optionally pin Node version in `package.json` under "engines" or set it in Vercel Project Settings.
6. Deploy and review logs for any missing env vars or runtime errors.

## Troubleshooting
- Missing env var errors: run the grep commands above to find which keys are referenced and add them to `.env.local` (local) and Vercel env vars (remote).
- Build fails: check Vercel build logs for stack traces and missing dependencies or env vars.
- Runtime errors: inspect Vercel Function logs or server console output.

## Helpful tips
- Keep secrets out of the repo: use `.gitignore` and Vercel environment variables.
- If heavy work is done in serverless functions, consider offloading to an external service if you hit platform limits.

## Next step
If you want a definitive README update that lists exact env vars and example values, paste config.ts or any files that reference process.env and I will update this file accordingly.
