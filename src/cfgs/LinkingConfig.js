import MainConfig from "./MainConfig";
import Logger from "../Logger/Logger";

const config = {
  screens: {
    MainTabs: {
      screens: {
        Home: "home",
        Liked: "liked",
        Download: "downloads",
        Settings: "settings",
      },
    },
    HiddenStack: {
      screens: {
        AnimePreview: {
          path: "anime/:slug",
          parse: {
            slug: (slug) => slug,
          },
        },
        AnimeWatch: {
          path: "anime/:slug/watch",
          parse: {
            slug: (slug) => slug,
            episode: (episode) => parseInt(episode, 10) || 1,
            studio: (studio) => decodeURIComponent(studio || ""),
            provider: (provider) => provider || "moon",
            time: (time) => parseInt(time, 10) || 0,
            build_in: (build_in) => build_in === "true",
          },
        },
        CharacterScreen: {
          path: "characters/:slug",
          parse: {
            slug: (slug) => slug,
          },
        },
        SecretScreen: "no-ads",
        AddDeviceScreen: {
          path: "login/:qrData",
          parse: {
            qrData: (qrData) => qrData,
          },
        },
      },
    },
  },
};

// Фільтруємо валідні URL prefixes
const validPrefixes = [MainConfig.urls.appUri, MainConfig.urls.appUrl].filter(
  (prefix) => prefix && typeof prefix === "string" && prefix.trim() !== "",
);

// Якщо немає валідних префіксів, використовуємо дефолтні
const finalPrefixes =
  validPrefixes.length > 0
    ? [...validPrefixes, "https://aniua.app/"]
    : ["aniua://", "https://aniua.app/"];

export default {
  prefixes: finalPrefixes,
  config,
  // Додаємо обробник для фільтрації невалідних URL
  getStateFromPath: (path, options) => {
    Logger.debug("LinkingConfig", "Отримано deep link", { path, options });

    // Перевіряємо чи path валідний
    if (!path || typeof path !== "string") {
      Logger.warn("LinkingConfig", "Невалідний path", { path });
      return undefined;
    }

    // Нормалізуємо path - додаємо слеш на початку якщо його немає
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    Logger.debug("LinkingConfig", "Нормалізований path", { normalizedPath });

    // Дозволяємо шляхи /anime/*, /characters/*, /hikka-callback (для OAuth) та /login/* (QR авторизація)
    const isAnimeUrl =
      normalizedPath.startsWith("/anime/") || normalizedPath === "/anime";
    const isCharacterUrl =
      normalizedPath.startsWith("/characters/") ||
      normalizedPath === "/characters";
    const isOAuthCallback =
      normalizedPath.startsWith("/hikka-callback") ||
      normalizedPath === "hikka-callback";
    const isLoginUrl = normalizedPath.startsWith("/login/");

    if (!isAnimeUrl && !isCharacterUrl && !isOAuthCallback && !isLoginUrl) {
      Logger.warn(
        "LinkingConfig",
        "Only /anime/{slug}, /characters/{slug}, /hikka-callback and /login/{data} URLs are allowed. Ignored:",
        path,
      );
      return undefined;
    }

    Logger.debug("LinkingConfig", "URL пройшов валідацію", {
      isAnimeUrl,
      isCharacterUrl,
      isOAuthCallback,
      isLoginUrl,
    });

    // Викликаємо стандартну функцію React Navigation
    const {
      getStateFromPath: defaultGetStateFromPath,
    } = require("@react-navigation/native");

    try {
      const state = defaultGetStateFromPath(normalizedPath, options);
      Logger.debug("LinkingConfig", "Створено navigation state", {
        state: JSON.stringify(state),
      });
      return state;
    } catch (error) {
      Logger.warn("LinkingConfig", "Invalid URL path ignored:", {
        path: normalizedPath,
        error,
      });
      // Navigate to a friendly InvalidLink screen when the path can't be parsed
      return {
        routes: [
          {
            name: "HiddenStack",
            state: {
              routes: [
                {
                  name: "InvalidLink",
                  params: { slug: path, code: 400, message: "Invalid URL" },
                },
              ],
            },
          },
        ],
      };
    }
  },
};
