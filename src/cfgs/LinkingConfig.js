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
        CharacterScreen: {
          path: "characters/:slug",
          parse: {
            slug: (slug) => slug,
          },
        },
        SecretScreen: "no-ads",
      },
    },
  },
};

// Фільтруємо валідні URL prefixes
const validPrefixes = [MainConfig.urls.appUri, MainConfig.urls.appUrl].filter(
  (prefix) => prefix && typeof prefix === "string" && prefix.trim() !== ""
);

// Якщо немає валідних префіксів, використовуємо дефолтні
const finalPrefixes =
  validPrefixes.length > 0 ? validPrefixes : ["aniua://", "https://aniua.yuzka.site"];

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

    // Дозволяємо шляхи /anime/*, /characters/* та /hikka-callback (для OAuth)
    const isAnimeUrl = normalizedPath.startsWith("/anime/") || normalizedPath === "/anime";
    const isCharacterUrl = normalizedPath.startsWith("/characters/") || normalizedPath === "/characters";
    const isOAuthCallback = normalizedPath.startsWith("/hikka-callback") || normalizedPath === "hikka-callback";

    if (!isAnimeUrl && !isCharacterUrl && !isOAuthCallback) {
      Logger.warn("LinkingConfig", "Only /anime/{slug}, /characters/{slug} and /hikka-callback URLs are allowed. Ignored:", path);
      return undefined;
    }

    Logger.debug("LinkingConfig", "URL пройшов валідацію", { isAnimeUrl, isCharacterUrl, isOAuthCallback });

    // Викликаємо стандартну функцію React Navigation
    const {
      getStateFromPath: defaultGetStateFromPath,
    } = require("@react-navigation/native");

    try {
      const state = defaultGetStateFromPath(normalizedPath, options);
      Logger.debug("LinkingConfig", "Створено navigation state", { state: JSON.stringify(state) });
      return state;
    } catch (error) {
      Logger.warn("LinkingConfig", "Invalid URL path ignored:", { path: normalizedPath, error });
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
