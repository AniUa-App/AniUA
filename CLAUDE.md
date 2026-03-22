# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AniUA is a React Native (Expo) Android application for streaming and downloading anime content with Ukrainian dubbing. The app fetches anime data from Hikka API and episode sources from multiple providers (ashdi, moon).

## Development Commands

### Build & Run

```bash
npm start                    # Start Expo development server
npm run android              # Build and run on Android device/emulator
npm run prebuild             # Clean prebuild for Android (runs setup scripts)
npm run setup-file-opener    # Setup custom file opener plugin
npm run setup-ffmpeg         # Download FFmpeg AAR for Android
```

### EAS Build & Updates

```bash
npm run update-release          # Push OTA update to release channel
npm run build-release           # Local APK build for release channel
npx eas build --profile release               # Remote EAS build APK for release channel
npx eas build --profile aab-release           # Remote EAS build app bundle for release channel
```

### Environment

- The app uses environment variables from `.env` and `.env.local` files
- Required env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_MOON_KEY`, `APP_URI`
- Hikka OAuth vars: `EXPO_PUBLIC_HIKKA_CLIENT_ID`, `HIKKA_CLIENT_SECRET`, `EXPO_PUBLIC_HIKKA_REDIRECT_URL`
- Build-time variables are injected via `app.config.js`

## Architecture

### Navigation Structure

The app uses React Navigation with a multi-layered structure:

- **MainTabs** (Tab Navigator): Home, Liked, Download, Settings
- **HiddenStack** (Stack Navigator): AnimeList, AnimePreview, VideoPlayers, etc.
- **RootStack** (Root Navigator): Contains MainTabs and HiddenStack as modal presentations

Entry point: `src/Screens/ScreenController/ScreenController.jsx`

### Data Sources

The app integrates with multiple anime content providers:

1. **Hikka API** (`src/Sources/hikka.ts`, `HikkaApi` class):
   - Main anime metadata source (https://api.hikka.io/)
   - Provides genres, search, anime details, franchise info
   - All API calls are cached with 30-minute TTL
   - `HikkaApiComplete` (`src/Sources/HikkaApiComplete.ts`) extends this for episode data from https://api.hikka-features.pp.ua/

2. **AniUA API** (`src/Api/AniuaApi.ts`, `AniuaApi` class):
   - Backend API for AniUA-specific features
   - Provides: episodes by slug, dubbing teams data, app versions, user auth, push notifications
   - JWT token authentication via `X-JWT-Token` header, Bearer token via `Authorization` header
   - Episode caching uses both in-memory cache (5min) and persistent `EpisodesCacheStorage` (10min)
   - Implements request deduplication to prevent duplicate concurrent requests
   - Handles Cloudflare 530 errors by blocking subsequent requests until app restart

3. **Episode Providers**:
   - `moon`: Moonanime video provider
   - `ashdi`: Alternative video provider
   - Episodes are returned from `/watch/:slug` endpoint containing both providers' data

### Storage System

The app uses MMKV (react-native-mmkv) for persistent storage:

- **SettingsStorage** (`src/Storage/SettingsStorage.js`): User preferences, configurations
- **AnimeStorage** (`src/Storage/AnimeStorage.js`): Liked/downloaded anime lists
- **AnimeHashStorage** (`src/Storage/AnimeHashStorage.js`): Watch history and progress
- **PersonalRecListStorage** (`src/Storage/PersonalRecListStorage.ts`): Personal recommendations

All storage classes extend the base `Storage` class (`src/Storage/Storage.js`) which provides MMKV interface.

### Configuration

**MainConfig** (`src/cfgs/MainConfig.js`) is the central configuration object:

- Contains API endpoints, player types, device info, partner URLs
- Reads build-time extras from Expo Constants
- Device ID is generated via `Application.getAndroidId()` and cached
- Must call `MainConfig.initAsync()` to initialize async values

### Theme System

- **ThemeContext** (`src/Global/ThemeContext.jsx`): Provides theme colors throughout app
- **useTheme** (`src/Global/useTheme.js`): Hook to access theme colors
- Supports dynamic theming with user customization
- Navigation bar has two styles: "Default" and "MD3" (Material Design 3)

### Video Playback

The app supports multiple video players:

- **WebVideoPlayer** (`src/Screens/WebVideoPlayer.jsx`): For streaming episodes
- **LocalVideoPlayerV2** (`src/Screens/LocalVideoPlayerV2.jsx`): For downloaded content
- Uses `expo-video` with background playback and PiP support
- FFmpeg integration via `ffmpeg-kit-react-native` for video processing

### Download System

- **VideoDownloader** (`src/Notifications/VideoDownloader.jsx`): Handles episode downloads
- **DownloadVideoNotification** (`src/Notifications/DownloadVideoNotification.jsx`): Shows progress
- Downloads are saved to device storage with path from SettingsStorage
- Uses `expo-file-system` and `expo-media-library`

### Event System

**EventBus** (`src/Global/EventBus.js`): Simple pub/sub for cross-component communication

- Used for theme changes, config updates, navigation events
- Subscribe with `EventBus.on(eventName, callback)`
- Emit with `EventBus.emit(eventName, data)`

### Logger System

**Logger** (`src/Logger/Logger.ts`): Centralized logging with Reactotron integration

- Levels: `DEBUG`, `INFO`, `WARN`, `ERROR`
- Auto-disabled in production (only WARN+ in production unless `MainConfig.debug.isDebug`)
- Usage: `Logger.debug(context, message, data?)`, `Logger.error(context, message, error?)`
- Integrates with Reactotron in dev mode for visual debugging

### Update System

**UpdateCheckerService** (`src/Services/UpdateCheckerService.ts`): Handles app updates

- Supports two update types: OTA (expo-updates) and APK (native binary updates)
- `checkForUpdates()` - checks for available updates with optional force check
- `downloadAndInstallAPK(url, onProgress)` - downloads and installs APK updates on Android
- `applyOTAUpdate()` - applies expo OTA updates and reloads the app

### Custom Plugins

The project includes custom Expo config plugins:

- `expo-plugin-notification-icon.js`: Configures notification icons
- `ffmpeg-kit-plugin.js`: Downloads and integrates FFmpeg AAR for Android
- Custom file opener plugin at `react-native-file-opener/`

## Code Patterns

### Screen Components

- All screens are in `src/Screens/`
- Most screens use `Header` widget from `src/Widgets/HeaderWidget.jsx`
- Navigation props are passed via React Navigation
- Screens that show anime lists take a `type` param (e.g., "Liked", "Downloaded")

### Widget Components

Reusable UI components in `src/Widgets/`:

- `AnimePreviewWidget`: Card displaying anime info
- `BigBannerWidget`: Large hero banner
- `LoaderWidget`: Loading states
- `Button.jsx`: Custom button implementations
- Bottom sheet widgets for episodes/dubbing selection

### API Data Flow

1. HikkaApi methods are called from screens/components
2. API responses are cached automatically (5min TTL)
3. Data is transformed and stored in Storage classes if needed
4. UI components consume data from Storage or direct API calls

### User Configuration

User preferences are stored in SettingsStorage under the `userConfig` key:

```javascript
{
  navbar: {
    style: "Default" | "MD3",
    placedAt: "Внизу" | "Праворуч" | "Ліворуч",
    isCustomisation: boolean,
    backgroundColor: string,
    borderRadius: number,
    bottomOffset: number,
    width: number,
    isBlurBackground: boolean,
    blurIntensity: number
  },
  recommendations: {
    isEnabled: boolean,
    isDefaultBigBanner: boolean
  }
}
```

Changes to userConfig trigger EventBus events that update the UI reactively.

## Important Notes

- The app is Android-only (Expo config only includes android settings)
- The default branch is `Alpha` (not main/master)
- Uses Expo's new architecture (`newArchEnabled: true`)
- Phones are locked to portrait, tablets allow rotation
- Deep linking is configured for `aniua://` and `https://aniua.app`
- The app requires notification, storage, and media library permissions
- Patch-package is used for npm package modifications
