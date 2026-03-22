# AniUA — Anime with Ukrainian Dubbing 🇺🇦

[Українська версія](README.uk.md) | English

**AniUA** is an Android application built with React Native (Expo) for streaming and downloading anime with Ukrainian dubbing.

<p align="center">
  <img src="images/home.jpg" width="18%" />
  <img src="images/preview-anime.jpg" width="18%" />
  <img src="images/preview-anime-2.jpg" width="18%" />
  <img src="images/bookmarks.jpg" width="18%" />
  <img src="images/profile.jpg" width="18%" />
</p>

<p align="center">
  <img src="images/search-anime.jpg" width="18%" />
  <img src="images/search-character.jpg" width="18%" />
  <img src="images/search-dub-team.jpg" width="18%" />
  <img src="images/settings.jpg" width="18%" />
</p>

---

## What's new

- Improved user interface
- Notifications for new episode releases
- Account system
- Bookmarks
- Improved search — by title, character, dubbing team
- Improved anime info screen
- Cross-device sync
- Full Android TV and tablet support
- Reduced APK size

---

## Features

- Watch anime with Ukrainian dubbing
- Download episodes for offline viewing
- Bookmarks and favorites
- Account with cross-device sync
- Search by title, character, and dubbing team
- Anime info screen with full details
- Notifications about new episodes
- Interface customization
- PiP (Picture-in-Picture) support
- Full Android TV and tablet support

## Data Sources

- **AniUA API** — primary episode provider, dubbing teams, user auth, push notifications
- **Hikka API** — anime metadata, genres, episode info
- **Moon** — video provider (fallback)
- **Ashdi** — video provider (fallback)

## Tech Stack

- React Native (Expo)
- React Navigation
- MMKV for local storage
- expo-video for video playback
- FFmpeg for video processing
- Supabase for backend
- Notifee for notifications

---

## Development

### Install dependencies

```bash
npm install
```

### Run on Android

```bash
npm start
npm run android
```

### Build

```bash
# Local APK build (release)
npm run build-release

# OTA update
npm run update-release
```

### Environment setup

Create a `.env.local` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
EXPO_PUBLIC_MOON_KEY=your_moon_key
APP_URI=aniua://
EXPO_PUBLIC_HIKKA_CLIENT_ID=your_hikka_client_id
HIKKA_CLIENT_SECRET=your_hikka_secret
```

## Project Structure

```
src/
├── Screens/        # Application screens
├── Widgets/        # Reusable UI components
├── Sources/        # API integrations (Hikka, Moon, Ashdi)
├── Storage/        # MMKV storage classes
├── Global/         # Global contexts and hooks
├── cfgs/           # Configuration (MainConfig)
├── Api/            # AniUA backend API
├── Notifications/  # Download system and notifications
└── Services/       # Update checker and other services
```

---

## Links

- Website: <https://aniua.app>
- Deep link: `aniua://`

## License

Restricted license. See [LICENSE](LICENSE) for details.

- Allowed: improvements, bug reports, sharing links
- Not allowed: forks, commercial use without permission

---

Made with love for the Ukrainian anime community 🇺🇦
