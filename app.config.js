import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
const CHANNEL = process.env.CHANNEL || "GRelease";
export default {
  expo: {
    name: CHANNEL !== "GRelease" ? `AniUA ${CHANNEL}` : "AniUA",
    slug: "AniUA",
    version: "0.1.0",
    orientation: "default",
    icon: "./assets/AniUA-Logo-Icon.png",
    userInterfaceStyle: "dark",
    scheme: "aniua",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/3f3ecbe1-45c1-4952-ae08-3eb5c59781b2",
      enabled: true,
      checkAutomatically: "ON_LOAD",
      channel: "GRelease",
    },
    ios: {
      infoPlist: {
        EXUpdatesEnabled: false,
      },
    },
    runtimeVersion: `0.1.0-${CHANNEL}`,
    extra: {
      hermes: true,
      eas: {
        projectId: "3f3ecbe1-45c1-4952-ae08-3eb5c59781b2",
      },
      commitHash: process.env.COMMIT_HASH || null,
      commitHashShort: process.env.COMMIT_HASH_SHORT || null,
      buildDate: process.env.BUILD_DATE || null,
      expoPublickSupabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || null,
      expoPublickSupabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || null,
      expoPrivateMoonApiKey: process.env.EXPO_PUBLIC_MOON_KEY || null,
      appUri: process.env.APP_URI || null,
      hikkaClientId: process.env.EXPO_PUBLIC_HIKKA_CLIENT_ID || null,
      hikkaClientSecret: process.env.HIKKA_CLIENT_SECRET || null,
      hikkaRedirectUrl:
        process.env.EXPO_PUBLIC_HIKKA_REDIRECT_URL || "aniua://hikka-callback",
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
      versionCode: 1,
      package:
        CHANNEL === "GRelease"
          ? "aniua.yuzka.site"
          : `aniua.yuzka.site.${CHANNEL}`,
      googleServicesFile: "./google-services.json",
      buildType: "apk",
      bundle: {
        languageSplit: false,
      },
      tvBanner: "./assets/AniUA-Logo(TV).jpg",
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
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
        "android.permission.CAMERA",
        "android.permission.ACCESS_WIFI_STATE",
        "android.permission.CHANGE_WIFI_MULTICAST_STATE",
      ],
      requestLegacyExternalStorage: true,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "aniua.yuzka.site",
              pathPrefix: "/anime",
            },
            {
              scheme: "https",
              host: "aniua.yuzka.site",
              pathPattern: "/anime/.*/watch",
            },
            {
              scheme: "https",
              host: "aniua.app",
              pathPrefix: "/anime",
            },
            {
              scheme: "https",
              host: "aniua.app",
              pathPattern: "/anime/.*/watch",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "aniua.yuzka.site",
              pathPrefix: "/characters",
            },
            {
              scheme: "https",
              host: "aniua.app",
              pathPrefix: "/characters",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "aniua.yuzka.site",
              pathPrefix: "/login",
            },
            {
              scheme: "https",
              host: "aniua.app",
              pathPrefix: "/login",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          data: [
            {
              scheme: "aniua",
              host: "hikka-callback",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    assetBundlePatterns: ["**/*"],
    plugins: [
      "@react-native-firebase/app",
      ["./expo-plugin-remove-permissions.js"],
      ["@react-native-tvos/config-tv"],
      ["./expo-plugin-tv-support.js"],
      [
        "./expo-plugin-architectures.js",
        ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"],
      ],
      ["./expo-plugin-notification-icon.js"],
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
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            packagingOptions: {
              excludes: [
                "**/libhermes-executor-debug.so",
                "**/libhermes-inspector.so",
                "META-INF/DEPENDENCIES",
                "META-INF/LICENSE",
                "META-INF/LICENSE.txt",
                "META-INF/NOTICE",
                "META-INF/NOTICE.txt",
                "META-INF/*.kotlin_module",
              ],
            },
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
      "expo-web-browser",
      "expo-font",
      [
        "react-native-vision-camera",
        {
          cameraPermissionText:
            "Для сканування QR-коду потрібен доступ до камери",
          enableCodeScanner: true,
        },
      ],
    ],
  },
};
