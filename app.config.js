export default {
  expo: {
    name: "AniUA",
    slug: "AniUA",
    version: "a0.0.1",
    orientation: "portrait",
    icon: "./assets/AniUA-Logo-Icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    extra: {
      hermes: true,
      eas: {
        projectId: "3f3ecbe1-45c1-4952-ae08-3eb5c59781b2",
      },
    },
    splash: {
      image: "./assets/AniUA-Logo.png",
      resizeMode: "contain",
      backgroundColor: "#181c14",
      light: {
        image: "./assets/AniUA-Logo.png",
        backgroundColor: "#181c14",
      },
      dark: {
        image: "./assets/AniUA-Logo.png",
        backgroundColor: "#181c14",
      },
    },
    android: {
      package: "com.aniua",
      versionCode: 1,
      buildType: "apk",
      adaptiveIcon: {
        foregroundImage: "./assets/AniUA-Logo-Icon.png",
        backgroundColor: "#181c14",
        monochromeImage: "./assets/AniUA-Logo-Icon.png",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.SYSTEM_ALERT_WINDOW",
        "android.permission.VIBRATE",
        "android.permission.POST_NOTIFICATIONS",
      ],
      // Використовуємо requestLegacyExternalStorage для сумісності зі старими версіями
      requestLegacyExternalStorage: true,
    },
    assetBundlePatterns: ["**/*"],
    plugins: [
      [
        "./ffmpeg-kit-plugin.js",
        {
          iosUrl:
            "https://github.com/NooruddinLakhani/ffmpeg-kit-ios-full-gpl/archive/refs/tags/latest.zip",
          androidUrl:
            "https://github.com/NooruddinLakhani/ffmpeg-kit-full-gpl/releases/download/v1.0.0/ffmpeg-kit-full-gpl.aar",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            extraMavenRepos: [
              "../../node_modules/@notifee/react-native/android/libs",
            ],
            compileSdkVersion: 34,
            targetSdkVersion: 33,
          },
        },
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
    ],
  },
};
