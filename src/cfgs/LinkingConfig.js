import MainConfig from './MainConfig';

const config = {
  screens: {
    MainTabs: {
      screens: {
        Home: 'home',
        Liked: 'liked',
        Download: 'downloads',
        Settings: 'settings',
      },
    },
    HiddenStack: {
      screens: {
        AnimePreview: {
          path: 'anime/:slug',
          parse: {
            slug: slug => slug,
          },
        },
        SecretScreen: 'no-ads',
      },
    },
  },
};

// Фільтруємо валідні URL prefixes
const validPrefixes = [MainConfig.urls.appUri, MainConfig.urls.appUrl].filter(
  prefix => prefix && typeof prefix === 'string' && prefix.trim() !== '',
);

export default {
  prefixes: validPrefixes.length > 0 ? validPrefixes : ['aniua://'],
  config,
  // Додаємо обробник для фільтрації невалідних URL
  getStateFromPath: (path, options) => {
    // Перевіряємо чи path валідний
    if (!path || typeof path !== 'string') {
      return undefined;
    }

    // Викликаємо стандартну функцію React Navigation
    const {
      getStateFromPath: defaultGetStateFromPath,
    } = require('@react-navigation/native');

    try {
      return defaultGetStateFromPath(path, options);
    } catch (error) {
      console.warn('LinkingConfig: Invalid URL path ignored:', path, error);
      return undefined;
    }
  },
};
