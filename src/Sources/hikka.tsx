import axios from "axios";
import { TransformToCompactJson } from "../Global/Functions";

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
      HikkaApi.apiCache[cacheKey] = {
        data: result,
        timestamp: now,
      };
      return result;
    } catch (error: any) {
      console.error(`Помилка у запиті ${cacheKey}:`, error?.message || error);
      throw error;
    }
  }

  public static async getGenres() {
    const cacheKey = `genres`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.get(
        `${HikkaApi.apiUrl}genres`
      );
      return response.data.list;
    });
  }

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

  public static async getAnimeDetails(slug: string) {
    const cacheKey = `anime_details_${slug}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.get(
        `${HikkaApi.apiUrl}anime/${slug}`
      );
      return response.data;
    }).catch(() => null);
  }

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
          console.error(
            "Помилка при завантаженні франшизи:",
            error?.message || error
          );
          return [];
        }
      }
    }).catch(() => []);
  }

  public static async getEpisodes(slug: string) {
    const cacheKey = `episodes_${slug}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      try {
        const response = await HikkaApi.axiosInstance.get(
          `${HikkaApi.apiEpisodesUrl}watch/${slug}`
        );
        const { type, ...rest } = response.data;
        return { data: rest, code: response.status };
      } catch (error: any) {
        console.error(
          "Помилка при завантаженні епізодів:",
          error?.message || error
        );
        return {
          data: [],
          code: error?.response?.status || 500,
        };
      }
    });
  }

  public static async searchAnime(query: string) {
    const cacheKey = `search_${query}`;
    return HikkaApi.cachedRequest(cacheKey, async () => {
      const response = await HikkaApi.axiosInstance.post(
        `${HikkaApi.apiUrl}anime?size=20`,
        {
          query: query,
          only_translated: true,
        }
      );
      return response.data.list;
    }).catch(() => []);
  }

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

  public static getApiUrl() {
    return `${HikkaApi.apiUrl}`;
  }
}
