import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Updates from "expo-updates";
import SettingsStorage from "../Storage/SettingsStorage";
import { G } from "react-native-svg";
import Logger from "../Logger/Logger";

// Безпечне отримання build-time extra (з Expo runtime config або манніфесту OTA)
export const getBuildExtra = () => {
  try {
    const extraFromConstants = Constants?.expoConfig?.extra || {};
    const extraFromManifest = Updates?.manifest?.extra || {};
    // Перевага віддається runtime-даним OTA (маніфест), потім expoConfig
    if (__DEV__) {
      Logger.debug("MainConfig", "Build extra", {
        extraFromConstants,
        extraFromManifest,
      });
    }
    return { ...extraFromConstants, ...extraFromManifest };
  } catch (_e) {
    return {};
  }
};

export const buildExtra = getBuildExtra();

const appUri = buildExtra.appUri || "";

// Функція для безпечного отримання значень з fallback
const getSafeValue = (value, fallback = "Unknown") => {
  return value || fallback;
};

// Функція для безпечного отримання версії
const getSafeVersion = () => {
  try {
    const version = Constants?.expoConfig?.version;
    return String(version ?? "0.0.1");
  } catch (error) {
    Logger.error("MainConfig", "Error getting version", error);
    return "1.0.0";
  }
};

// Приводимо значення до безпечного рядка
const toSafeString = (v, fallback = "unknown") => {
  try {
    if (v === undefined || v === null) return fallback;
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      return String(v);
    }
    // ISO date string inside object or timestamp
    if (typeof v === "object") {
      if (v instanceof Date) return v.toISOString();
      if (Array.isArray(v)) return v.join(", ");
      if (
        "value" in v &&
        (typeof v.value === "string" || typeof v.value === "number")
      ) {
        return String(v.value);
      }
      if (
        "toString" in v &&
        typeof v.toString === "function" &&
        v.toString !== Object.prototype.toString
      ) {
        const s = v.toString();
        if (s && s !== "[object Object]") return s;
      }
    }
    if (v instanceof Date) return v.toISOString();
    // Уникаємо [object Object]
    return fallback;
  } catch (_e) {
    return fallback;
  }
};

export default {
  players: ["Вбудований плеєр", "moon", "ashdi"],
  api: {
    url: toSafeString(buildExtra.expoPublickSupabaseUrl || null),
    key: toSafeString(buildExtra.expoPublickSupabaseKey || null),
  },
  partnerStudios: {
    "Glass Moon": "https://t.me/gwean_maslinka",
    GlassMoon: "https://t.me/gwean_maslinka",
    "Didko Studio": "https://t.me/didko_studio",
  },
  urls: {
    appUrl: "https://aniua.yuzka.site/",
    appUri: appUri || "aniua://",
    dubbingsUrl: "",
    telegramChannelUrl: "",
    donateUrl: "",
    supportTelegramBotUrl: "",
    github: "",
  },
  devInfo: {
    version: getSafeVersion(),
    buildId: toSafeString(Constants?.expoConfig?.android?.versionCode),
    gitShortHash: toSafeString(
      buildExtra.commitHashShort || buildExtra.commitHash
    ),
    uniqueAccountId: "",
    gitHash: toSafeString(buildExtra.commitHash || process.env.GIT_HASH),
    buildDate: toSafeString(buildExtra.buildDate || process.env.BUILD_DATE),
    deviceId: "unknown",
    deviceName: getSafeValue(Device.deviceName, "Unknown Device"),
    systemVersion: getSafeValue(Device.osVersion, "Unknown"),
    systemName: getSafeValue(Device.osName, "Unknown"),
    bundleId: getSafeValue(Application.applicationId, "unknown"),
    manufacturer: getSafeValue(Device.manufacturer, "Unknown"),
    model: getSafeValue(Device.modelName || Device.designName, "Unknown"),
    getUniqueId: () => Application.getAndroidId(),
    packageName: toSafeString(Constants?.expoConfig?.android?.package),
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
  initAsync: function () {
    try {
      // Визначаємо стабільний ID пристрою та кешуємо
      const resolvedId = Application.getAndroidId();
      this.devInfo.deviceId = resolvedId;
    } catch (error) {
      Logger.error("MainConfig", "Failed to initialize device ID", error);
      this.devInfo.deviceId = "unknown";
    }

    // Ініціалізуємо debug параметри з storage
    try {
      const savedErrorBoundary =
        SettingsStorage.getParameter("isErrorBoundary");
      this.debug.isErrorBoundary = Boolean(savedErrorBoundary);
    } catch (error) {
      Logger.error("MainConfig", "Failed to initialize debug settings", error);
      this.debug.isErrorBoundary = false;
    }
  },
};
