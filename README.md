# AniUA - Anime with Ukrainian Dubbing 🇺🇦

[Українська версія](README.uk.md) | English

**AniUA** is an Android mobile application built with React Native (Expo) that allows you to watch and download anime with Ukrainian dubbing.

## Screenshots

| Home Screen | Anime Preview |
|-------------|---------------|
| ![Home](assets/Home.jpg) | ![Preview](assets/Preview.jpg) |

| Liked Anime | Settings |
|-------------|----------|
| ![Liked](assets/Liked.jpg) | ![Settings](assets/Settings.jpg) |

## Features

- 📺 Watch anime with Ukrainian dubbing
- 💾 Download episodes for offline viewing
- ❤️ Favorites list
- 🔍 Search anime by title
- 🎨 Interface customization
- 📱 PiP (Picture-in-Picture) support
- 🌙 Dark theme

## Data Sources

- **Hikka API** — anime metadata, genres, episode information
- **Moon** — video provider
- **Ashdi** — alternative video provider

## Tech Stack

- React Native (Expo)
- React Navigation
- MMKV for data storage
- expo-video for video playback
- FFmpeg for video processing
- Supabase for backend

## Development

### Install Dependencies

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
# APK for alpha channel
npx eas build --profile alpha

# App Bundle for alpha channel
npx eas build --profile aab-alpha

# OTA update
npm run update-alpha
```

### Environment Setup

Create a `.env.local` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_key
EXPO_PUBLIC_MOON_KEY=your_moon_key
APP_URI=aniua://
```

## Project Structure

```plaintext
src/
├── Screens/          # Application screens
├── Widgets/          # Reusable UI components
├── Sources/          # API integrations (Hikka, Moon, Ashdi)
├── Storage/          # MMKV storage classes
├── Global/           # Global contexts and hooks
├── cfgs/             # Configuration (MainConfig)
└── Notifications/    # Download system and notifications
```

## Contributing

We welcome your contributions! You can:

- 🐛 Report bugs via [Issues](../../issues)
- 💡 Suggest new features
- 🔧 Create Pull Requests with code improvements

**Important:** According to the project license, forks are not allowed. Please create Pull Requests directly to the main repository.

## License

This project has a restricted license. See [LICENSE](LICENSE) for details.

**Summary:**

- ✅ Allowed: improvements, bug reports, sharing links
- ❌ Not allowed: creating forks, commercial use without permission

## Links

- 🌐 Official website: <https://aniua.yuzka.site>
- 📱 Deep link: `aniua://`

## Acknowledgments

Thanks to everyone who supports Ukrainian anime dubbing! 🇺🇦

---

Made with ❤️ for the Ukrainian anime community
