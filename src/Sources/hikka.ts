import axios from "axios";
import { TransformToCompactJson } from "../Global/Functions";
import Logger from "../Logger/Logger";
import EpisodesCacheStorage from "../Storage/EpisodesCacheStorage";

/**
 * API клас для роботи з Hikka API (api.hikka.io)
 * Надає методи для отримання аніме, пошуку, фільтрації та роботи з епізодами
 * Всі запити кешуються на 5 хвилин для оптимізації продуктивності
 */
export class HikkaApi {
  protected static apiUrl = "https://api.hikka.io/";
  protected static apiEpisodesUrl = "https://api.hikka-features.pp.ua/";
  protected static apiCache: Record<string, { data: any; timestamp: number }> =
    {};
  protected static CACHE_TTL = 5 * 60 * 1000;
  protected static currentYear = new Date().getFullYear();
  protected static axiosInstance = axios.create({
    timeout: 10000,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  /**
   * Виконує запит з кешуванням результату
   * @param {string} cacheKey - Унікальний ключ для кешу
   * @param {Function} requestFn - Функція що виконує запит
   * @param {number} [ttl] - Час життя кешу в мс (за замовчуванням 5 хвилин)
   * @returns {Promise<any>} Результат запиту з кешу або з сервера
   */
  protected static async cachedRequest(
    cacheKey: string,
    requestFn: () => Promise<any>,
    ttl: number = HikkaApi.CACHE_TTL
  ) {
    const cachedData = HikkaApi.apiCache[cacheKey];
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < ttl) {
      return cachedData.data;
    }

    try {
      const result = await requestFn();
      if (result.code === 404) {
        return { data: [], code: 404 };
      }
      HikkaApi.apiCache[cacheKey] = {
        data: result,
        timestamp: now,
      };
      return result;
    } catch (error: any) {
      Logger.error("HikkaApi", `Помилка у запиті ${cacheKey}`, error);
      throw error;
    }
  }

  /**
   * Отримує список всіх жанрів аніме
   * @returns {Promise<Array>} Масив об'єктів жанрів
   */
  public static async getGenres() {
    const cacheKey = `genres`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.get(
        `${HikkaApi.apiUrl}genres`
      );
      return response.data.list;
    });
  }

  /**
   * Отримує найпопулярніші аніме поточного року (2025)
   * @param {number} [page=1] - Номер сторінки
   * @param {number} [size=1] - Кількість елементів на сторінці
   * @returns {Promise<Array>} Масив аніме відсортованих за популярністю
   */
  public static async getMostPopularAnimeOfTheYear(
    page: number = 1,
    size: number = 1
  ) {
    const cacheKey = `popular_year_${page}_${size}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.post(
        `${HikkaApi.apiUrl}anime?page=${page}&size=${size}`,
        {
          years: [2025, 2025],
          include_multiseason: false,
          only_translated: true,
          score: [8, 10],
          sort: ["scored_by:desc"],
        }
      );
      return response.data.list;
    }).catch(() => []);
  }

  /**
   * Отримує детальну інформацію про аніме за slug
   * @param {string} slug - Унікальний slug аніме
   * @returns {Promise<Object|null>} Об'єкт з деталями аніме або null
   */
  public static async getAnimeDetails(slug: string) {
    const cacheKey = `anime_details_${slug}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.get(
        `${HikkaApi.apiUrl}anime/${slug}`
      );
      return response.data;
    }).catch(() => null);
  }

  /**
   * Отримує найпопулярніші аніме з 2020 по 2025 рік
   * @param {number} [page=1] - Номер сторінки
   * @param {number} [size=1] - Кількість елементів
   * @returns {Promise<Array>} Масив популярних аніме
   */
  public static async getMostPopularAnime(page: number = 1, size: number = 1) {
    const cacheKey = `popular_${page}_${size}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.post(
        `${HikkaApi.apiUrl}anime?page=${page}&size=${size}`,
        {
          years: [2020, 2025],
          include_multiseason: false,
          only_translated: true,
          score: [8, 10],
          sort: ["scored_by:desc"],
        }
      );
      return response.data.list;
    }).catch(() => []);
  }

  /**
   * Отримує франшизу (пов'язані аніме) за slug
   * @param {string} slug - Slug аніме
   * @param {string} [filter=""] - Фільтр для результатів
   * @returns {Promise<Array>} Масив аніме з франшизи, відсортованих за роком
   */
  public static async getAnimeFranchiseByFilter(
    slug: string,
    filter: string = ""
  ) {
    const cacheKey = `franchise_${slug}_${filter}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      try {
        const response = await HikkaApi.axiosInstance.get(
          `${HikkaApi.apiUrl}anime/${slug}/franchise?page=1&size=15`
        );
        return response.data.list
          .filter((item: any) => item.media_type === "tv")
          .sort((a: any, b: any) => (a.year ?? 0) - (b.year ?? 0));
      } catch (error: any) {
        if (error?.response?.status === 400) {
          return [];
        } else {
          Logger.error("HikkaApi", "Помилка при завантаженні франшизи", error);
          return [];
        }
      }
    }).catch(() => []);
  }

  /**
   * Отримує список епізодів аніме з озвучками від різних провайдерів
   * @param {string} slug - Slug аніме
   * @returns {Promise<Object>} Об'єкт з епізодами по озвучкам та провайдерам або помилкою
   */
  public static async getEpisodes(slug: string) {
    const cacheKey = `hikka_episodes_${slug}`;

    // Спочатку перевіряємо персистентний кеш (10 хв навіть після перезапуску)
    const persistentCached = EpisodesCacheStorage.get(cacheKey);
    if (persistentCached) {
      Logger.debug("HikkaApi", `Епізоди для ${slug} з персистентного кешу`);
      // Оновлюємо in-memory кеш
      HikkaApi.apiCache[cacheKey] = {
        data: persistentCached,
        timestamp: Date.now(),
      };
      return persistentCached;
    }

    return HikkaApi.cachedRequest(cacheKey, async () => {
      try {
        Logger.debug("HikkaApi", "Завантаження епізодів для slug", slug);

        const response = await HikkaApi.axiosInstance.get(
          `${HikkaApi.apiEpisodesUrl}watch/${slug}`
        );

        Logger.debug("HikkaApi", "Отримано епізоди", response.data);

        const { type, ...rest } = response.data;
        const result = { data: rest, code: response.status };

        // Зберігаємо в персистентний кеш (10 хв)
        EpisodesCacheStorage.set(cacheKey, result);

        return result;
      } catch (error: any) {
        Logger.error("HikkaApi", "Помилка при завантаженні епізодів", error);
        return {
          data: [],
          code: error?.response?.status || 500,
        };
      }
    });
  }

  /**
   * Пошук аніме за текстовим запитом
   * @param {string} query - Текст пошуку
   * @returns {Promise<Array>} Масив знайдених аніме (до 30 елементів)
   */
  public static async searchAnime(query: string) {
    const cacheKey = `search_${query}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.post(
        `${HikkaApi.apiUrl}anime?page=1&size=30`,
        {
          query: query,
        }
      );
      return response.data.list;
    }).catch(() => []);
  }

  /**
   * Отримує повну інформацію про аніме (деталі + франшиза + епізоди)
   * @param {string} slug - Slug аніме
   * @returns {Promise<Object>} Об'єкт з повною інформацією про аніме
   */
  public static async getAnimeFullInfo(slug: string) {
    const cacheKey = `full_info_${slug}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const [details, franchise, episodes] = await Promise.all([
        HikkaApi.getAnimeDetails(slug),
        HikkaApi.getAnimeFranchiseByFilter(slug),
        HikkaApi.getEpisodes(slug),
      ]);

      return {
        details,
        franchise,
        episodes,
      };
    }).catch(() => ({
      details: null,
      franchise: [],
      episodes: { data: [], code: 500 },
    }));
  }

  /**
   * Повертає базову URL для Hikka API
   * @returns {string} Базова URL API
   */
  public static getApiUrl() {
    return `${HikkaApi.apiUrl}`;
  }
}
