import axios, { AxiosInstance, AxiosError } from "axios";
import Logger from "../Logger/Logger";

// ==================== TYPES ====================

/**
 * Статус команди озвучення
 */
export type TeamStatus =
  | "Активна"
  | "Малоактивна"
  | "Неактивна"
  | "Невідомо"
  | "Розформована"
  | "Припинено";

/**
 * Тип діяльності команди
 */
export type TeamActivity =
  | "аніме"
  | "манґа"
  | "дорами"
  | "серіали"
  | "фільми"
  | "різне";

/**
 * Команда озвучення
 */
export interface Team {
  /** Назва команди */
  name: string;
  /** Альтернативні назви команди */
  alt_names: string[];
  /** URL логотипу команди */
  logo: string | null;
  /** Чи верифікована команда */
  is_verified: boolean;
  /** Посилання на Telegram канал/групу */
  telegram: string | null;
  /** Список slug релізів аніме */
  releases: string[];
  /** Статус активності команди */
  status: TeamStatus;
  /** Типи діяльності команди */
  type_activity: TeamActivity[];
}

/**
 * Параметри фільтрації команд
 */
export interface TeamsFilterParams {
  /** Пошуковий запит по імені або альтернативному імені */
  query?: string;
  /** Фільтр по статусу верифікації */
  is_verified?: boolean;
  /** Фільтр по статусах команд */
  status?: TeamStatus | TeamStatus[];
  /** Фільтр по типах активності */
  type_activity?: TeamActivity | TeamActivity[];
  /** Фільтр по наявності Telegram */
  has_telegram?: boolean;
  /** Фільтр по мінімальній кількості релізів */
  min_releases?: number;
  /** Сортування */
  sort_by?: "name" | "releases_count" | "status";
  /** Порядок сортування */
  sort_order?: "asc" | "desc";
  /** Номер сторінки (починаючи з 1) */
  page?: number;
  /** Кількість елементів на сторінці */
  size?: number;
}

/**
 * Результат пагінованого запиту
 */
export interface PaginatedTeamsResult {
  /** Список команд */
  list: Team[];
  /** Інформація про пагінацію */
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

/**
 * Статистика по командах
 */
export interface TeamsStatistics {
  /** Загальна кількість команд */
  total: number;
  /** Кількість верифікованих команд */
  verified: number;
  /** Розподіл по статусах */
  by_status: Record<TeamStatus, number>;
  /** Розподіл по типах активності */
  by_activity: Record<string, number>;
  /** Загальна кількість релізів */
  total_releases: number;
  /** Команди з найбільшою кількістю релізів (топ 5) */
  top_teams_by_releases: Array<{ name: string; count: number }>;
}

/**
 * Конфігурація API
 */
export interface AniuaApiConfig {
  /** Базова URL API */
  baseUrl: string;
  /** Час життя кешу в мілісекундах */
  cacheTtl?: number;
  /** Таймаут запитів в мілісекундах */
  timeout?: number;
}

// ==================== API CLASS ====================

/**
 * Професійний API клас для роботи з AniUA API
 * Надає доступ до бази даних українських команд озвучення
 *
 * @example
 * ```typescript
 * // Ініціалізація з продакшен URL
 * AniuaApi.configure({ baseUrl: "https://api.aniua.example.com" });
 *
 * // Отримати всі верифіковані команди
 * const teams = await AniuaApi.getVerifiedTeams();
 *
 * // Пошук команди
 * const team = await AniuaApi.getTeamByName("Glass Moon");
 *
 * // Отримати релізи команди
 * const releases = await AniuaApi.getTeamReleases("Didko Studio");
 * ```
 */
export class AniuaApi {
  // ==================== CONFIGURATION ====================

  private static baseUrl: string = "http://192.168.178.22:8080";
  private static cacheTtl: number = 5 * 60 * 1000; // 5 хвилин
  private static timeout: number = 15000;

  private static cache: {
    teams: { data: Team[] | null; timestamp: number };
    byName: Map<string, { data: Team | null; timestamp: number }>;
  } = {
    teams: { data: null, timestamp: 0 },
    byName: new Map(),
  };

  private static axiosInstance: AxiosInstance = axios.create({
    timeout: AniuaApi.timeout,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // ==================== CONFIGURATION METHODS ====================

  /**
   * Конфігурує API з новими налаштуваннями
   * @param config - Конфігурація API
   *
   * @example
   * ```typescript
   * AniuaApi.configure({
   *   baseUrl: "https://api.aniua.yuzka.site",
   *   cacheTtl: 10 * 60 * 1000, // 10 хвилин
   *   timeout: 20000
   * });
   * ```
   */
  public static configure(config: AniuaApiConfig): void {
    if (config.baseUrl) {
      AniuaApi.baseUrl = config.baseUrl.replace(/\/$/, "");
    }
    if (config.cacheTtl !== undefined) {
      AniuaApi.cacheTtl = config.cacheTtl;
    }
    if (config.timeout !== undefined) {
      AniuaApi.timeout = config.timeout;
      AniuaApi.axiosInstance.defaults.timeout = config.timeout;
    }

    Logger.debug("AniuaApi", "API сконфігуровано", {
      baseUrl: AniuaApi.baseUrl,
      cacheTtl: AniuaApi.cacheTtl,
      timeout: AniuaApi.timeout,
    });
  }

  /**
   * Повертає поточну базову URL API
   */
  public static getBaseUrl(): string {
    return AniuaApi.baseUrl;
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Перевіряє чи кеш ще валідний
   */
  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < AniuaApi.cacheTtl;
  }

  /**
   * Очищає весь кеш
   */
  public static clearCache(): void {
    AniuaApi.cache = {
      teams: { data: null, timestamp: 0 },
      byName: new Map(),
    };
    Logger.debug("AniuaApi", "Кеш очищено");
  }

  /**
   * Встановлює новий TTL для кешу
   * @param ttl - Час життя кешу в мілісекундах
   */
  public static setCacheTtl(ttl: number): void {
    AniuaApi.cacheTtl = ttl;
  }

  // ==================== ERROR HANDLING ====================

  /**
   * Обробляє помилки API запитів
   */
  private static handleError(
    error: AxiosError | Error,
    context: string
  ): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message;

      Logger.error("AniuaApi", `${context}: HTTP ${status}`, {
        status,
        message,
        url: error.config?.url,
      });

      if (status === 404) {
        throw new Error(`Ресурс не знайдено: ${context}`);
      }
      if (status === 500) {
        throw new Error(`Помилка сервера: ${context}`);
      }
      if (error.code === "ECONNABORTED") {
        throw new Error(`Таймаут запиту: ${context}`);
      }
      if (error.code === "ERR_NETWORK") {
        throw new Error(`Помилка мережі: ${context}`);
      }

      throw new Error(`Помилка API: ${message}`);
    }

    Logger.error("AniuaApi", context, error);
    throw error;
  }

  // ==================== CORE API METHODS ====================

  /**
   * Отримує всі команди з API (з кешуванням)
   * @returns Масив всіх команд
   *
   * @example
   * ```typescript
   * const allTeams = await AniuaApi.getAllTeams();
   * console.log(`Знайдено ${allTeams.length} команд`);
   * ```
   */
  public static async getAllTeams(): Promise<Team[]> {
    // Перевіряємо кеш
    if (
      AniuaApi.cache.teams.data &&
      AniuaApi.isCacheValid(AniuaApi.cache.teams.timestamp)
    ) {
      Logger.debug("AniuaApi", "Повернуто дані з кешу");
      return AniuaApi.cache.teams.data;
    }

    try {
      Logger.debug("AniuaApi", "Завантаження команд з API");

      const response = await AniuaApi.axiosInstance.get<Team[]>(
        `${AniuaApi.baseUrl}/teams`
      );

      const teams = response.data;

      // Зберігаємо в кеш
      AniuaApi.cache.teams = {
        data: teams,
        timestamp: Date.now(),
      };

      Logger.debug("AniuaApi", `Завантажено ${teams.length} команд`);
      return teams;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Помилка завантаження команд"
      );
    }
  }

  /**
   * Отримує тільки верифіковані команди
   * @returns Масив верифікованих команд
   *
   * @example
   * ```typescript
   * const verifiedTeams = await AniuaApi.getVerifiedTeams();
   * ```
   */
  public static async getVerifiedTeams(): Promise<Team[]> {
    try {
      const response = await AniuaApi.axiosInstance.get<Team[]>(
        `${AniuaApi.baseUrl}/teams`,
        {
          params: { is_verified: true },
        }
      );

      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Помилка завантаження верифікованих команд"
      );
    }
  }

  /**
   * Отримує команду за назвою (точний або частковий збіг)
   * @param name - Назва команди
   * @param exact - Точний збіг (за замовчуванням false)
   * @returns Команда або null якщо не знайдено
   *
   * @example
   * ```typescript
   * const team = await AniuaApi.getTeamByName("Glass Moon");
   * if (team) {
   *   console.log(`Знайдено: ${team.name}, релізів: ${team.releases.length}`);
   * }
   * ```
   */
  public static async getTeamByName(
    name: string,
    exact: boolean = false
  ): Promise<Team | null> {
    const cacheKey = `${name}_${exact}`;
    const cached = AniuaApi.cache.byName.get(cacheKey);

    if (cached && AniuaApi.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    const teams = await AniuaApi.getAllTeams();
    const lowerName = name.toLowerCase();

    const team =
      teams.find((t) => {
        if (exact) {
          return (
            t.name.toLowerCase() === lowerName ||
            t.alt_names.some((alt) => alt.toLowerCase() === lowerName)
          );
        }
        return (
          t.name.toLowerCase().includes(lowerName) ||
          t.alt_names.some((alt) => alt.toLowerCase().includes(lowerName))
        );
      }) || null;

    // Кешуємо результат
    AniuaApi.cache.byName.set(cacheKey, {
      data: team,
      timestamp: Date.now(),
    });

    return team;
  }

  /**
   * Пошук команд за запитом
   * @param query - Пошуковий запит
   * @returns Масив знайдених команд
   *
   * @example
   * ```typescript
   * const results = await AniuaApi.searchTeams("studio");
   * ```
   */
  public static async searchTeams(query: string): Promise<Team[]> {
    const teams = await AniuaApi.getAllTeams();
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return teams;
    }

    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(lowerQuery) ||
        team.alt_names.some((alt) => alt.toLowerCase().includes(lowerQuery))
    );
  }

  // ==================== FILTERED QUERIES ====================

  /**
   * Отримує команди з фільтрацією та пагінацією
   * @param params - Параметри фільтрації
   * @returns Пагінований результат з командами
   *
   * @example
   * ```typescript
   * const result = await AniuaApi.getTeams({
   *   is_verified: true,
   *   status: "Активна",
   *   sort_by: "releases_count",
   *   sort_order: "desc",
   *   page: 1,
   *   size: 10
   * });
   *
   * console.log(`Сторінка ${result.pagination.page} з ${result.pagination.pages}`);
   * result.list.forEach(team => console.log(team.name));
   * ```
   */
  public static async getTeams(
    params: TeamsFilterParams = {}
  ): Promise<PaginatedTeamsResult> {
    const {
      query,
      is_verified,
      status,
      type_activity,
      has_telegram,
      min_releases,
      sort_by = "name",
      sort_order = "asc",
      page = 1,
      size = 20,
    } = params;

    let teams = await AniuaApi.getAllTeams();

    // Фільтрація по запиту
    if (query) {
      const lowerQuery = query.toLowerCase().trim();
      teams = teams.filter(
        (team) =>
          team.name.toLowerCase().includes(lowerQuery) ||
          team.alt_names.some((alt) => alt.toLowerCase().includes(lowerQuery))
      );
    }

    // Фільтрація по верифікації
    if (is_verified !== undefined) {
      teams = teams.filter((team) => team.is_verified === is_verified);
    }

    // Фільтрація по статусу
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      teams = teams.filter((team) => statuses.includes(team.status));
    }

    // Фільтрація по типу активності
    if (type_activity) {
      const activities = Array.isArray(type_activity)
        ? type_activity
        : [type_activity];
      teams = teams.filter((team) =>
        team.type_activity.some((a) => activities.includes(a as TeamActivity))
      );
    }

    // Фільтрація по наявності Telegram
    if (has_telegram !== undefined) {
      teams = teams.filter(
        (team) =>
          (has_telegram && team.telegram !== null) ||
          (!has_telegram && team.telegram === null)
      );
    }

    // Фільтрація по мінімальній кількості релізів
    if (min_releases !== undefined) {
      teams = teams.filter((team) => team.releases.length >= min_releases);
    }

    // Сортування
    teams = [...teams].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;

      switch (sort_by) {
        case "releases_count":
          compareA = a.releases.length;
          compareB = b.releases.length;
          break;
        case "status":
          compareA = a.status;
          compareB = b.status;
          break;
        case "name":
        default:
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
      }

      if (sort_order === "desc") {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
      return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
    });

    // Пагінація
    const total = teams.length;
    const pages = Math.ceil(total / size);
    const startIndex = (page - 1) * size;
    const paginatedTeams = teams.slice(startIndex, startIndex + size);

    return {
      list: paginatedTeams,
      pagination: {
        page,
        size,
        total,
        pages,
      },
    };
  }

  /**
   * Отримує команди за статусом
   * @param status - Статус команди
   * @returns Масив команд з вказаним статусом
   */
  public static async getTeamsByStatus(status: TeamStatus): Promise<Team[]> {
    const teams = await AniuaApi.getAllTeams();
    return teams.filter((team) => team.status === status);
  }

  /**
   * Отримує активні команди
   * @returns Масив активних команд
   */
  public static async getActiveTeams(): Promise<Team[]> {
    return AniuaApi.getTeamsByStatus("Активна");
  }

  /**
   * Отримує команди за типом активності
   * @param activity - Тип активності
   * @returns Масив команд з вказаною активністю
   */
  public static async getTeamsByActivity(
    activity: TeamActivity
  ): Promise<Team[]> {
    const teams = await AniuaApi.getAllTeams();
    return teams.filter((team) => team.type_activity.includes(activity));
  }

  /**
   * Отримує аніме команди
   * @returns Масив команд які озвучують аніме
   */
  public static async getAnimeTeams(): Promise<Team[]> {
    return AniuaApi.getTeamsByActivity("аніме");
  }

  // ==================== RELEASES METHODS ====================

  /**
   * Отримує релізи конкретної команди
   * @param teamName - Назва команди
   * @returns Масив slug релізів або порожній масив
   *
   * @example
   * ```typescript
   * const releases = await AniuaApi.getTeamReleases("Didko Studio");
   * console.log(`У команди ${releases.length} релізів`);
   * ```
   */
  public static async getTeamReleases(teamName: string): Promise<string[]> {
    const team = await AniuaApi.getTeamByName(teamName, true);
    return team?.releases || [];
  }

  /**
   * Перевіряє чи команда озвучила конкретне аніме
   * @param teamName - Назва команди
   * @param animeSlug - Slug аніме
   * @returns true якщо команда озвучила це аніме
   *
   * @example
   * ```typescript
   * const hasDubbed = await AniuaApi.hasTeamDubbedAnime(
   *   "Glass Moon",
   *   "spy-x-family-season-3-21987e"
   * );
   * ```
   */
  public static async hasTeamDubbedAnime(
    teamName: string,
    animeSlug: string
  ): Promise<boolean> {
    const releases = await AniuaApi.getTeamReleases(teamName);
    return releases.includes(animeSlug);
  }

  /**
   * Знаходить всі команди які озвучили конкретне аніме
   * @param animeSlug - Slug аніме
   * @returns Масив команд які озвучили це аніме
   *
   * @example
   * ```typescript
   * const teams = await AniuaApi.getTeamsForAnime("gachiakuta-557581");
   * teams.forEach(team => console.log(team.name));
   * ```
   */
  public static async getTeamsForAnime(animeSlug: string): Promise<Team[]> {
    const teams = await AniuaApi.getAllTeams();
    return teams.filter((team) => team.releases.includes(animeSlug));
  }

  /**
   * Знаходить верифіковані команди які озвучили конкретне аніме
   * @param animeSlug - Slug аніме
   * @returns Масив верифікованих команд
   */
  public static async getVerifiedTeamsForAnime(
    animeSlug: string
  ): Promise<Team[]> {
    const teams = await AniuaApi.getTeamsForAnime(animeSlug);
    return teams.filter((team) => team.is_verified);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Перевіряє чи команда є партнерською (верифікованою)
   * @param teamName - Назва команди (або альтернативна назва)
   * @returns true якщо команда верифікована
   *
   * @example
   * ```typescript
   * const isPartner = await AniuaApi.isPartnerTeam("GlassMoon");
   * ```
   */
  public static async isPartnerTeam(teamName: string): Promise<boolean> {
    const team = await AniuaApi.getTeamByName(teamName);
    return team?.is_verified ?? false;
  }

  /**
   * Отримує посилання на Telegram команди
   * @param teamName - Назва команди
   * @returns URL Telegram або null
   */
  public static async getTeamTelegram(
    teamName: string
  ): Promise<string | null> {
    const team = await AniuaApi.getTeamByName(teamName);
    return team?.telegram ?? null;
  }

  /**
   * Отримує логотип команди
   * @param teamName - Назва команди
   * @returns URL логотипу або null
   */
  public static async getTeamLogo(teamName: string): Promise<string | null> {
    const team = await AniuaApi.getTeamByName(teamName);
    return team?.logo ?? null;
  }

  /**
   * Нормалізує назву команди до канонічної форми
   * @param name - Назва команди (може бути альтернативною)
   * @returns Канонічна назва або оригінальна якщо не знайдено
   *
   * @example
   * ```typescript
   * const canonical = await AniuaApi.normalizeTeamName("GlassMoon");
   * // Поверне "Glass Moon (GM)"
   * ```
   */
  public static async normalizeTeamName(name: string): Promise<string> {
    const team = await AniuaApi.getTeamByName(name);
    return team?.name ?? name;
  }

  // ==================== STATISTICS ====================

  /**
   * Отримує статистику по командах
   * @returns Об'єкт зі статистикою
   *
   * @example
   * ```typescript
   * const stats = await AniuaApi.getStatistics();
   * console.log(`Всього команд: ${stats.total}`);
   * console.log(`Верифікованих: ${stats.verified}`);
   * console.log(`Релізів: ${stats.total_releases}`);
   * ```
   */
  public static async getStatistics(): Promise<TeamsStatistics> {
    const teams = await AniuaApi.getAllTeams();

    const byStatus: Record<string, number> = {};
    const byActivity: Record<string, number> = {};
    let totalReleases = 0;
    let verifiedCount = 0;

    teams.forEach((team) => {
      // По верифікації
      if (team.is_verified) verifiedCount++;

      // По статусу
      byStatus[team.status] = (byStatus[team.status] || 0) + 1;

      // По активності
      team.type_activity.forEach((activity) => {
        byActivity[activity] = (byActivity[activity] || 0) + 1;
      });

      // Релізи
      totalReleases += team.releases.length;
    });

    // Топ команд по релізах
    const topTeams = [...teams]
      .sort((a, b) => b.releases.length - a.releases.length)
      .slice(0, 5)
      .map((team) => ({
        name: team.name,
        count: team.releases.length,
      }));

    return {
      total: teams.length,
      verified: verifiedCount,
      by_status: byStatus as Record<TeamStatus, number>,
      by_activity: byActivity,
      total_releases: totalReleases,
      top_teams_by_releases: topTeams,
    };
  }

  /**
   * Отримує всі унікальні статуси команд
   * @returns Масив унікальних статусів
   */
  public static async getAvailableStatuses(): Promise<TeamStatus[]> {
    const teams = await AniuaApi.getAllTeams();
    const statuses = new Set<TeamStatus>();
    teams.forEach((team) => statuses.add(team.status));
    return Array.from(statuses);
  }

  /**
   * Отримує всі унікальні типи активності
   * @returns Масив унікальних типів активності
   */
  public static async getAvailableActivities(): Promise<TeamActivity[]> {
    const teams = await AniuaApi.getAllTeams();
    const activities = new Set<TeamActivity>();
    teams.forEach((team) =>
      team.type_activity.forEach((a) => activities.add(a as TeamActivity))
    );
    return Array.from(activities);
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Перевіряє доступність API
   * @returns true якщо API доступне
   *
   * @example
   * ```typescript
   * const isAvailable = await AniuaApi.healthCheck();
   * if (!isAvailable) {
   *   console.log("API недоступне");
   * }
   * ```
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      await AniuaApi.axiosInstance.get(`${AniuaApi.baseUrl}/teams`, {
        timeout: 5000,
        params: { is_verified: true },
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Експорт для зворотної сумісності з TeamsDbApi
export { AniuaApi as TeamsDbApi };
export default AniuaApi;
