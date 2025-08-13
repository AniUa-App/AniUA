import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import SettingsStorage from "../Storage/SettingsStorage";
import appConfig from "../../app.config";

const appUrl = "https://aniua.yuzka.site";
const appUri = "aniua://";
const supportBotUrl = "example_bot";
const dubbingsUrl = `${appUrl}/dubbings`;
const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.aniua";
const telegramChannelUrl = "https://t.me/example_channel";

// Функція для безпечного отримання значень з fallback
const getSafeValue = (value, fallback = "Unknown") => {
  return value || fallback;
};

// Функція для безпечного отримання версії
const getSafeVersion = () => {
  try {
    const version = appConfig.expo.version;
    return String(version).replace("alpha ", "a");
  } catch (error) {
    console.warn("Error getting version:", error);
    return "1.0.0";
  }
};

// Безпечне отримання build-time extra (з Expo/`app.config.js`)
const getBuildExtra = () => {
  try {
    const extraFromConstants = Constants?.expoConfig?.extra || {};
    const extraFromAppConfig = appConfig?.expo?.extra || {};
    return { ...extraFromAppConfig, ...extraFromConstants };
  } catch (_e) {
    return {};
  }
};

const buildExtra = getBuildExtra();

export default {
  players: ["Вбудований плеєр", "moon", "ashdi"],
  urls: {
    appUrl,
    appUri,
    supportBotUrl,
    dubbingsUrl,
    googlePlayUrl,
    telegramChannelUrl,
  },
  devInfo: {
    version: getSafeVersion(),
    buildId: appConfig.expo.android.versionCode,
    gitShortHash:
      buildExtra.commitHashShort ||
      buildExtra.commitHash ||
      process.env.GIT_SHORT_HASH ||
      process.env.GIT_HASH ||
      "unknown",
    gitHash:
      buildExtra.commitHash ||
      process.env.GIT_HASH ||
      process.env.COMMIT_HASH ||
      "unknown",
    buildDate: buildExtra.buildDate || process.env.BUILD_DATE || "unknown",
    deviceId: "unknown", // Буде оновлено асинхронно
    deviceName: getSafeValue(Device.deviceName, "Unknown Device"),
    systemVersion: getSafeValue(Device.osVersion, "Unknown"),
    systemName: getSafeValue(Device.osName, "Unknown"),
    bundleId: getSafeValue(Application.applicationId, "unknown"),
    manufacturer: getSafeValue(Device.manufacturer, "Unknown"),
    model: getSafeValue(Device.modelName || Device.designName, "Unknown"),
    getUniqueId: () => Promise.resolve("unknown"), // Заглушка
    packageName: appConfig.expo.android.package,
  },
  partners: {
    hikka: {
      url: "https://hikka.io/",
      name: "Hikka",
    },
    hikkaFeatures: {
      url: "https://github.com/rosset-nocpes/hikka-features",
      name: "Hikka Features",
    },
    moonanime: {
      url: "",
      name: "Moonanime",
    },
  },
  debug: {
    isDebug: false,
    isErrorBoundary: false, // Явно встановлюємо false
  },
  telegramBotArgs: {
    reportBug: "report_bug",
  },
  localVideoPlayer: {
    isChromeCast: false,
    chromeCast: {},
  },
  // Функція для ініціалізації асинхронних значень
  initAsync: async function () {
    try {
      // Генеруємо простий унікальний ID
      const randomBytes = await Crypto.getRandomBytesAsync(8);
      this.devInfo.deviceId = Array.from(randomBytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
    } catch (error) {
      console.warn("Failed to initialize device ID:", error);
      this.devInfo.deviceId = "unknown";
    }

    // Ініціалізуємо debug параметри з storage
    try {
      const savedErrorBoundary =
        SettingsStorage.getParameter("isErrorBoundary");
      this.debug.isErrorBoundary = Boolean(savedErrorBoundary);
    } catch (error) {
      console.warn("Failed to initialize debug settings:", error);
      this.debug.isErrorBoundary = false;
    }
  },
};
