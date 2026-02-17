# TubeTracker AI

TubeTracker AI is a modern, privacy-focused web application that tracks recent video uploads from your favorite YouTube channels. It provides a clean, unified feed of the latest content without the distractions of the YouTube algorithm.

Thanks to [Google AI Studio - Gemini 3 Pro](https://aistudio.google.com/apps/drive/1BoaR3XG4WFupbOeEqHPMQSDnfYQtAboV)

<div align="center">
<img width="1125" alt="image" src="https://github.com/user-attachments/assets/63f76f46-2aad-4075-aba2-c4d43825ee5a" />

<img width="1125" alt="image" src="https://github.com/user-attachments/assets/ed59b2f2-48e0-4c31-8a19-24e9a75d5954" />


</div>

## 🎯 What is TubeTracker AI?

TubeTracker AI solves the problem of staying updated with your favorite YouTube creators without getting lost in YouTube's recommendation algorithm. Instead of scrolling through endless feeds, you get a clean, chronological view of the latest uploads from channels you actually care about.

**Key Benefits:**
- **Algorithm-Free**: See exactly what your favorite channels upload, when they upload it
- **Time-Saving**: One unified feed instead of checking multiple channels manually  
- **Customizable**: Track exactly the channels you want, for any time period
- **Private**: Your data stays with you - no accounts, no tracking, no data collection

## ✨ Features

### 📺 Core Functionality
*   **Multi-Profile Support**: Create separate channel feeds for different interests (e.g., AI & Coding, Finance, Gaming) with independent settings
*   **Profile Switching**: Instantly switch between profiles to view different channel collections
*   **Unified Video Feed**: View the latest videos from all your tracked channels in one clean, responsive grid layout
*   **Smart Search**: Instantly filter videos by title, description, or channel name with real-time results
*   **Customizable Lookback Period**: Choose how many days back to scan for new videos (1-30 days, default: 5 days)
*   **Auto-Scan**: Automatically checks for new videos based on your preferred interval (1-48 hours, default: 12 hours)
*   **Manual Scan**: "Scan Now" button for on-demand updates when you need immediate results
*   **Smart Notifications**: Visual alerts when you add/remove channels, prompting you to scan for updates

### 🎨 User Experience  
*   **Dark & Light Mode**: Fully themed interface with seamless theme switching
*   **Responsive Design**: Optimized for desktop, tablet, and mobile devices
*   **Loading States**: Visual feedback during API calls with progress indicators
*   **Error Handling**: Graceful error messages with recovery suggestions
*   **Cost Estimation**: Shows estimated API costs based on your channel count
*   **PIN Validation**: Real-time PIN validation with clear error display and retry functionality

### 🔒 Security & Privacy
*   **PIN-Based Authentication**: Simple but effective access control without complex user accounts
*   **Server-Side API Security**: Your YouTube API key is never exposed to the browser
*   **Local Data Storage**: Your channels and settings are saved locally in your browser
*   **No Data Collection**: Zero tracking, analytics, or user behavior monitoring

### ⚙️ Advanced Settings
*   **Profile Management**: Create, switch, and delete profiles to organize channels by topic or purpose
*   **Channel Management**: Add/remove YouTube channels using handles (e.g., @channelname) with batch input support
*   **Improved Duplicate Handling**: Smart detection and feedback when adding duplicate channels
*   **Debug Logging**: Toggle detailed server-side API logs for troubleshooting
*   **Persistent Settings**: All preferences automatically saved and restored
*   **Config File Support**: Pre-configure default profiles and channels for quick setup

## 👥 Multi-Profile System

TubeTracker AI now supports multiple profiles, allowing you to organize your YouTube channels into separate feeds based on topics, interests, or purposes.

### Profile Features
*   **Independent Channel Lists**: Each profile maintains its own set of tracked channels
*   **Separate Video Feeds**: Videos are scoped to the active profile, showing only channels from that profile
*   **Profile Switching**: Quick dropdown selector in the main interface to switch between profiles
*   **Profile Management**: Create, rename, and delete profiles from the Settings panel
*   **Data Migration**: Existing single-profile users are automatically migrated to a "Default" profile
*   **Per-Profile Settings**: Lookback period and other settings apply globally, but channels and videos are profile-specific

### Using Profiles
1. **Create a Profile**: Go to Settings → Profile Management → Click "New Profile"
2. **Name Your Profile**: Give it a descriptive name (e.g., "AI & Coding", "Finance", "Gaming")
3. **Add Channels**: With the profile active, add channels specific to that profile's focus
4. **Switch Profiles**: Use the profile dropdown in the main header to switch between different feeds
5. **Delete Unneeded Profiles**: Remove profiles you no longer need (requires at least 2 profiles)

### Migration from Single-Profile
If you're upgrading from an older version:
- Your existing channels are automatically migrated to a new "Default" profile
- No manual migration needed - everything works seamlessly
- You can create additional profiles and organize your channels as desired

## 🛠️ Tech Stack

### Frontend Architecture
*   **React 19**: Modern React with hooks and functional components
*   **TypeScript**: Full type safety for robust development
*   **Vite**: Lightning-fast build tool and development server
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development
*   **Lucide React**: Beautiful, customizable icons

### Backend & API
*   **Vercel Serverless Functions**: Scalable, global API endpoints
*   **YouTube Data API v3**: Official YouTube API for video and channel data
*   **Secure API Proxy**: Server-side API key management and request sanitization
*   **Google Cloud Platform**: YouTube API access and quota management

### Development Tools
*   **ESLint**: Code quality and consistency
*   **PostCSS**: Advanced CSS processing
*   **Hot Module Replacement**: Instant development feedback

## 🚀 Quick Start Guide

### Prerequisites
*   Node.js (v16 or higher)
*   Google Cloud Project with YouTube Data API v3 enabled
*   Vercel account (for deployment)

### 1. Get YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Note your API key for later use

### 2. Local Development Setup

#### Install Dependencies
```bash
npm install
```

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Configure Environment Variables
Create a `.env` file in the project root:
```bash
API_KEY=your_youtube_api_key_here
AUTH_PIN=your_secure_pin_here
```

> **Security Note**: The API key and PIN are now managed by the server (Vercel). For local development, the `.env` file works with `vercel dev --no-link`. For deployment, use Vercel's Environment Variables settings instead.

#### Start Development Server
```bash
vercel dev
```

The application will be available at `http://localhost:3000`

### 3. First Run Experience
1. **Enter your PIN**: Use the authentication PIN you configured
2. **Understand Profiles**: The app starts with a "Default" profile. You can create additional profiles in Settings
3. **Add Channels**: Use the Settings panel to add YouTube channels to the active profile (must use handles like `@channelname`)
4. **Scan for Videos**: Click "Scan Now" to fetch recent videos for the active profile
5. **Customize**: Adjust lookback period, auto-refresh settings, and theme to your preference
6. **Create Additional Profiles**: Use the profile management in Settings to organize channels by topic

### Data Migration
If you're upgrading from an older version:
- Your existing channels are automatically migrated to a "Default" profile
- No manual migration required
- You can immediately start creating new profiles and organizing your channels

## 🔧 Configuration

### Default Profiles (Recommended)
Edit `config.ts` to pre-define multiple profiles with their own channel sets:
```typescript
export const appConfig: ConfigFile = {
  defaultProfiles: [
    {
      name: "AI & Coding",
      channels: ["@AICodeKing", "@mreflow", "@matthew_berman"]
    },
    {
      name: "Finance",
      channels: ["@JosephCarlsonShow", "@EverythingMoney"]
    }
  ],
  defaultLookbackDays: 5,
  defaultAutoRefreshHours: 12,
  defaultTheme: 'dark',
  defaultDebugLogging: true
};
```

### Legacy Default Channels
For backward compatibility, `defaultChannels` still works and will populate the "Default" profile if no profiles are defined:
```typescript
export const appConfig: ConfigFile = {
  defaultChannels: [
    "@matthew_berman",
    "@mreflow",
    // Add more channels here
  ],
  // ... other settings
};
```

### Environment Variables (Vercel Deployment)
*   `API_KEY`: Your Google Cloud YouTube Data API Key
*   `AUTH_PIN`: The PIN for accessing the application

## 📱 Usage Guide

### Getting Started with Profiles
1. **First Run**: The app creates a "Default" profile automatically
2. **Access Profile Selector**: Use the profile dropdown in the main interface to switch profiles
3. **Create New Profile**: Go to Settings → Profile Management → "New Profile"
4. **Delete Profile**: Select a profile and click "Delete" (only available when you have more than one profile)
5. **Add Channels to Profile**: In Settings, the channel manager adds channels to the currently active profile

### Adding Channels
1. Navigate to Settings (gear icon in top-right)
2. In the "Tracked Channels" section, enter channel handles
3. Use comma separation to add multiple channels at once (e.g., `@channel1,@channel2`)
4. Click the + button to add
5. **Important**: Click "Scan Now" to update your video feed
6. **Duplicate Handling**: The app will notify you if you try to add channels that already exist in the current profile

### Managing Your Feed
*   **Search**: Use the search bar to filter videos by title, description, or channel
*   **Lookback**: Adjust the slider to see videos from different time periods
*   **Auto-Refresh**: Set how often the app automatically checks for new videos
*   **Manual Refresh**: Click "Scan Now" for immediate updates

### Understanding Notifications
*   **Blue Alert**: Appears when you add/remove channels, reminding you to scan
*   **Green Success**: Confirms successful channel additions
*   **Red Error**: Shows when API calls fail with helpful error messages
*   **Cost Indicator**: Shows estimated API costs based on your channel count
*   **PIN Error Display**: Clear error messages when authentication fails, allowing immediate retry

## 🔒 Security & Privacy

### How Your Data is Protected
*   **No User Accounts**: No registration, email, or personal information required
*   **Local Storage**: Your channels and preferences stay in your browser
*   **API Key Security**: YouTube API keys are stored server-side, never in your browser
*   **PIN Protection**: Simple but effective access control

### What Data is Collected
*   **Zero Personal Data**: No tracking, analytics, or user behavior monitoring
*   **Local Only**: All your data remains on your device
*   **No Cookies**: No tracking cookies or persistent user identification

### API Usage
*   **YouTube API**: Used only to fetch public video and channel information
*   **Rate Limits**: Respects YouTube's API quotas and rate limits
*   **Efficient Calls**: Optimized to minimize API usage and costs

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1.  **Push to GitHub**: Upload this repository to your GitHub account
2.  **Import to Vercel**: 
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard)
    *   Click "New Project"
    *   Import your GitHub repository
3.  **Configure Environment Variables**:
    *   Go to Project Settings → Environment Variables
    *   Add `API_KEY`: Your Google Cloud YouTube Data API Key
    *   Add `AUTH_PIN`: Your desired access PIN
    *   Set Environment: Production, Preview, and Development
4.  **Deploy**: Click "Deploy" - Vercel will automatically build and deploy

### Environment Variables Setup

### Alternative Deployment Options
*   **Netlify**: Supports serverless functions, similar setup process
*   **Railway**: Full-stack deployment with built-in environment management
*   **Self-Hosted**: Deploy on your own server with Node.js runtime

## 🔧 Development

### Project Structure
```
tubetracker-ai/
├── api/
│   └── youtube.js          # Serverless API proxy
├── components/
│   ├── AuthScreen.tsx      # PIN authentication
│   ├── ChannelManager.tsx  # Channel add/remove interface
│   ├── Settings.tsx        # Settings and preferences (includes profile management UI)
│   └── VideoList.tsx       # Video display grid
├── services/
│   └── geminiService.ts    # API communication layer
├── types.ts                # TypeScript type definitions (Profile, AppConfig, etc.)
├── config.ts               # Default configuration (defaultProfiles, settings)
├── App.tsx                 # Main application component (profile state, profile selector UI)
└── package.json            # Dependencies and scripts
```

### Key Components

#### `App.tsx`
Main application component handling:
- Authentication state management
- Profile state management (profiles, active profile, switching)
- Video data persistence per profile
- Auto-refresh logic and manual scanning
- Settings synchronization
- Data migration from legacy single-profile format

#### `ChannelManager.tsx`
Channel management interface with:
- Batch channel addition via comma-separated handles
- Visual channel cards with thumbnails
- Remove functionality with hover interactions
- Input validation and error handling
- Duplicate detection and user feedback

#### `Settings.tsx`
Settings and profile management component:
- Profile management UI (create, switch, delete profiles)
- Channel management integration (ChannelManager)
- App preferences (lookback, auto-refresh, theme, debug logging)
- Organized in two-column layout (preferences + channel manager)

#### `geminiService.ts`
API communication layer providing:
- Secure server-side API proxy calls
- Channel search and resolution
- Video fetching with metadata enrichment
- Error handling and retry logic

#### `youtube.js` (Serverless Function)
Backend API proxy handling:
- PIN-based authentication validation
- YouTube API requests with secure key injection
- Request sanitization and endpoint whitelisting
- Debug logging and error forwarding

### Available Scripts
```bash
# Development
vercel dev                 # Start development server with API
npm run dev               # Frontend only (no API)

# Production
npm run build             # Build for production
npm run preview           # Preview production build locally

# Deployment
vercel --prod             # Deploy to production
```

### Debug Logging
Enable detailed server-side logging:
1. Go to Settings → Server Debug Logging
2. Toggle the switch to ON
3. Check Vercel Function Logs for detailed API request information

### Adding New Features
The codebase is designed for extensibility:
- **New Settings**: Add to `AppConfig` interface and `Settings.tsx`
- **UI Components**: Follow existing patterns in `components/`
- **API Endpoints**: Extend `youtube.js` with new YouTube API calls
- **Themes**: Customize in `tailwind.config.js` and component styles

## 🐛 Troubleshooting

### Common Issues

#### "Invalid PIN" Error
*   **Cause**: PIN mismatch between frontend and server
*   **Solution**: Ensure `AUTH_PIN` environment variable matches your entered PIN

#### "API Key Missing" Error
*   **Cause**: Environment variable not set or not accessible
*   **Solution**: Verify `API_KEY` is set in Vercel project settings

#### Channels Not Loading
*   **Cause**: Invalid channel handles or API quota exceeded
*   **Solution**: Ensure channels use handles (e.g., `@channelname`), check YouTube API quotas

#### No Videos Showing
*   **Cause**: Lookback period too short or no new videos in timeframe
*   **Solution**: Increase lookback days in settings, try manual scan

### Performance Optimization
*   **API Costs**: Monitor YouTube API quotas in Google Cloud Console
*   **Loading Times**: Large channel lists may take longer to scan
*   **Storage**: Browser localStorage has size limits (usually 5-10MB)

## 📊 API Usage & Costs

### YouTube Data API v3 Costs
*   **Channel Search**: 100 units per request
*   **Playlist Items**: 1 unit per request  
*   **Video Details**: 1 unit per request
*   **Daily Quota**: 10,000 units (approximately 100 channel scans per day)

### Cost Estimation
The app shows estimated costs based on your channel count:
*   **1-5 channels**: ~500-1,000 units per scan
*   **6-10 channels**: ~1,000-2,000 units per scan
*   **10+ channels**: Consider increasing scan interval to manage costs

### Optimization Tips
*   **Batch Operations**: Add multiple channels at once to minimize API calls
*   **Reasonable Intervals**: Don't set auto-refresh too frequently
*   **Smart Lookback**: Use shorter lookback periods for faster scanning

## 🤝 Contributing

### How to Contribute
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
*   **TypeScript**: Maintain full type safety across all new code
*   **Components**: Follow existing component patterns and styling
*   **Testing**: Test new features thoroughly with various channel types
*   **Documentation**: Update README for any new features or configuration options

### Code Style
*   Use **functional components** with React hooks
*   Follow **existing naming conventions** and file structure
*   Maintain **consistent error handling** patterns
*   Add **appropriate TypeScript types** for all new interfaces

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

*   **Google AI Studio - Gemini 3 Pro**: For AI-powered features and inspiration
*   **YouTube Data API**: For providing access to public video and channel data
*   **Vercel**: For seamless serverless deployment and hosting
*   **React Community**: For the amazing ecosystem and tools
*   **Tailwind CSS**: For rapid, consistent UI development

## 📞 Support & Contact

### Getting Help
*   **Documentation**: Check this README and inline code comments
*   **Issues**: Open a GitHub issue for bugs or feature requests
*   **Discussions**: Use GitHub Discussions for questions and ideas

### Reporting Bugs
When reporting bugs, please include:
*   **Browser and version**
*   **Steps to reproduce**
*   **Expected vs actual behavior**
*   **Console error messages** (if any)
*   **Screenshots** (if relevant)

---

**Made with ❤️ for the YouTube creator community**

*TubeTracker AI - Never miss your favorite creators' content again.*
