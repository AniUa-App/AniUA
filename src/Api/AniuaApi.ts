import axios, { AxiosInstance, AxiosError } from "axios";
import Logger from "../Logger/Logger";
import EpisodesCacheStorage from "../Storage/EpisodesCacheStorage";
import MainConfig, { buildExtra } from "../cfgs/MainConfig";

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
 * Епізод аніме
 */
export interface Episode {
  /** Унікальний ідентифікатор епізоду */
  id: number;
  /** Дата створення запису */
  created_at: string;
  /** Slug аніме */
  slug: string;
  /** IMDB ID */
  imdb_id: string | null;
  /** MAL ID */
  mal_id: string | null;
  /** Плеєр (moon, ashdi, etc.) */
  player: string;
  /** ID плеєра */
  player_id: string;
  /** Назва команди озвучення */
  team: string;
  /** Номер епізоду */
  episode: number;
  /** URL постера епізоду */
  poster: string | null;
  /** URL відео */
  video_url: string;
  /** Пряме посилання на m3u8 плейлист (може бути null) */
  m3u8?: string | null;
  /** Пряме посилання на відео (може бути null) */
  real_url?: string | null;
  /** Українська назва епізоду */
  name_ua: string | null;
  /** Англійська назва епізоду */
  name_en: string | null;
  /** Японська назва епізоду */
  name_jp: string | null;
  /** Українська назва аніме */
  title_ua?: string | null;
  /** Англійська назва аніме */
  title_en?: string | null;
  /** Японська назва аніме */
  title_jp?: string | null;
}

/**
 * Відповідь з епізодами аніме
 */
export interface EpisodesResponse {
  episodes: Episode[];
}

/**
 * Епізоди згруповані по плеєрах та командах
 * Структура: { "moon": { "Glass Moon": Episode[], ... }, "ashdi": { ... } }
 */
export type EpisodesByPlayerAndTeam = Record<string, Record<string, Episode[]>>;

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
}

/**
 * Результат пагінованого запиту
 */
export interface PaginatedTeamsResult {
  /** Список команд */
  list: Team[];

  total: number;
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

/**
 * Токени автентифікації для захищених endpoint-ів AniUA API
 */
export interface AniuaAuthHeaders {
  /** Authorization: Bearer <token> */
  bearerToken?: string;
  /** X-JWT-Token */
  jwtToken?: string;
}

/**
 * Тіло запиту на вхід
 */
export interface SigninRequest {
  reference: string;
  username: string;
  email: string;
}

/**
 * Тіло запиту на реєстрацію
 */
export interface SignupRequest extends SigninRequest {
  download_version: string;
  download_git_hash: string;
}

/**
 * Відповідь від Auth endpoint
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
}

/**
 * DTO версії застосунку
 */
export interface VersionInfo {
  slug: string;
  platform: string;
  name: string;
  created_at: string;
  git_hash: string;
  download_url: string;
  version: string;
  description?: string | null;
}

/**
 * Параметри для запиту версій
 */
export interface VersionsQueryParams {
  select?: string;
}

/**
 * DTO користувача
 */
export interface UserDetails {
  reference: string;
  avatar?: string | null;
  created?: string | null;
  description?: string | null;
  download_git_hash?: string | null;
  download_version?: string | null;
  font?: string | null;
  frame?: string | null;
  payment_date?: string | null;
  push_token?: string | null;
  role?: string | null;
  updated?: string | null;
}

/**
 * Тіло запиту на оновлення користувача
 */
export interface UpdateUserDetails {
  avatar?: string | null;
  description?: string | null;
  font?: string | null;
  frame?: string | null;
}

/**
 * Запит на реєстрацію push-токена
 */
export interface RegisterTokenRequest {
  token: string;
  slugs: string[];
}

/**
 * Запит на оновлення підписок
 */
export interface UpdateSubscriptionRequest {
  token: string;
  add_slugs?: string[];
  remove_slugs?: string[];
}

/**
 * Запит на видалення push-токена
 */
export interface UnregisterTokenRequest {
  token: string;
}

/**
 * Відповідь від notifications endpoint-ів
 */
export interface SubscriptionResponse {
  token: string;
  slugs: string[];
  message: string;
}

/**
 * Стандартна відповідь з повідомленням
 */
export interface SuccessResponse {
  message: string;
}

/**
 * Інформація про помилку API
 */
export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  context: string;
}

/**
 * Обгортка відповіді API з даними помилки
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
}

/**
 * Елемент метаданих (key-value пара)
 */
export interface MetadataItem {
  key: string;
  value: string;
}

/**
 * DTO метаданих застосунку (трансформовані з масиву)
 */
export interface MetadataResponse {
  /** URL веб-сайту */
  website_url?: string;
  /** URL Telegram каналу */
  telegram_channel?: string;
  /** URL для донатів */
  donation_url?: string;
  /** URL GitHub репозиторію */
  github?: string;
  /** URL Telegram бота підтримки */
  support_telegram_bot?: string;
  /** URL каналу для баг-репортів */
  telegram_bug_report_channel?: string;
  /** URL TikTok */
  tiktok?: string;
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

  private static baseUrl: string = "https://api-aniua.yuzka.site";
  private static jwtToken: string = MainConfig.devInfo.expoPublickSupabaseKey;
  private static authHeader: string | undefined;
  private static cacheTtl: number = 5 * 60 * 1000; // 5 хвилин
  private static timeout: number = 15000;

  private static cache: {
    teams: { data: Team[] | null; timestamp: number };
    byName: Map<string, { data: Team | null; timestamp: number }>;
    episodes: Map<string, { data: Episode[]; timestamp: number }>;
  } = {
    teams: { data: null, timestamp: 0 },
    byName: new Map(),
    episodes: new Map(),
  };

  private static axiosInstance: AxiosInstance = (() => {
    const instance = axios.create({
      timeout: AniuaApi.timeout,
    });
    // Встановлюємо headers явно через common щоб уникнути конфліктів
    instance.defaults.headers.common["Accept"] = "application/json";
    instance.defaults.headers.common["Content-Type"] = "application/json";
    if (AniuaApi.jwtToken) {
      instance.defaults.headers.common["X-JWT-Token"] = AniuaApi.jwtToken;
    }
    if (AniuaApi.authHeader) {
      instance.defaults.headers.common["Authorization"] = AniuaApi.authHeader;
    }
    return instance;
  })();

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

  public static getJwtToken(): string | undefined {
    return AniuaApi.jwtToken;
  }

  /**
   * Встановлює Authorization header для авторизованих запитів
   * @param header - Значення Authorization header (наприклад "Bearer token")
   */
  public static setAuthHeader(header: string | undefined): void {
    AniuaApi.authHeader = header;
    if (header) {
      AniuaApi.axiosInstance.defaults.headers.common["Authorization"] = header;
    } else {
      delete AniuaApi.axiosInstance.defaults.headers.common["Authorization"];
    }
    Logger.debug("AniuaApi", "Authorization header оновлено", {
      hasHeader: !!header,
    });
  }

  /**
   * Отримує поточний Authorization header
   */
  public static getAuthHeader(): string | undefined {
    return AniuaApi.authHeader;
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
      episodes: new Map(),
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
   * Обробляє помилки API запитів та повертає дані відповіді (для auth методів)
   */
  private static handleErrorWithResponse<T = any>(
    error: AxiosError | Error,
    context: string
  ): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data as any;
      // Сервер повертає помилку в response.data.error
      const errorData = responseData?.error || responseData;
      const message =
        typeof errorData === "string"
          ? errorData
          : errorData?.message || error.message;

      Logger.error("AniuaApi", `${context}: HTTP ${status}`, {
        status,
        message,
        url: error.config?.url,
        responseData,
      });

      return {
        success: false,
        data: responseData,
        error: {
          status,
          message,
          code: error.code,
          context,
        },
      };
    }

    Logger.error("AniuaApi", context, error);
    return {
      success: false,
      data: null as T,
      error: {
        message: error.message,
        context,
      },
    };
  }

  /**
   * Обробляє помилки API запитів (кидає помилку)
   */
  private static handleError(
    error: AxiosError | Error,
    context: string
  ): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data as any;
      const errorData = responseData?.error || responseData;
      const message =
        typeof errorData === "string"
          ? errorData
          : errorData?.message || error.message;

      Logger.error("AniuaApi", `${context}: HTTP ${status}`, {
        status,
        message,
        url: error.config?.url,
        responseData,
      });

      throw new Error(`${context}: ${message}`);
    }

    Logger.error("AniuaApi", context, error);
    throw error;
  }

  // ==================== AUTH METHODS ====================

  /**
   * Вхід користувача через AniUA API
   */
  public static async signin(
    payload: SigninRequest
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await AniuaApi.axiosInstance.post<AuthResponse>(
        `${AniuaApi.baseUrl}/v1/auth/signin`,
        payload
      );
      this.setAuthHeader(`Bearer ${response.data.access_token}`);
      return { success: true, data: response.data };
    } catch (error) {
      return AniuaApi.handleErrorWithResponse<AuthResponse>(
        error as AxiosError,
        "Помилка авторизації (signin)"
      );
    }
  }

  /**
   * Реєстрація користувача у сервісі AniUA
   */
  public static async signup(
    payload: SignupRequest
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await AniuaApi.axiosInstance.post<AuthResponse>(
        `${AniuaApi.baseUrl}/v1/auth/signup`,
        payload
      );
      this.setAuthHeader(`Bearer ${response.data.access_token}`);
      return { success: true, data: response.data };
    } catch (error) {
      return AniuaApi.handleErrorWithResponse<AuthResponse>(
        error as AxiosError,
        "Помилка реєстрації користувача"
      );
    }
  }

  // ==================== VERSIONS ====================

  /**
   * Отримує список версій застосунку
   */
  public static async getVersions(
    params: VersionsQueryParams = {}
  ): Promise<VersionInfo[]> {
    try {
      const response = await AniuaApi.axiosInstance.get<VersionInfo[]>(
        `${AniuaApi.baseUrl}/v1/versions`,
        { params }
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Помилка завантаження версій застосунку"
      );
    }
  }

  // ==================== METADATA ====================

  /**
   * Отримує метадані застосунку (URLs, контакти тощо)
   * API повертає масив key-value пар, який трансформується в об'єкт
   *
   * @example
   * ```typescript
   * const metadata = await AniuaApi.getMetadata();
   * console.log(metadata.website_url);
   * console.log(metadata.telegram_channel);
   * ```
   */
  public static async getMetadata(): Promise<MetadataResponse> {
    try {
      const response = await AniuaApi.axiosInstance.get<MetadataItem[]>(
        `${AniuaApi.baseUrl}/v1/metadata`
      );

      // Трансформуємо масив key-value пар у об'єкт
      const metadata: MetadataResponse = {};
      for (const item of response.data) {
        (metadata as Record<string, string>)[item.key] = item.value;
      }

      return metadata;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Помилка завантаження метаданих застосунку"
      );
    }
  }

  // ==================== USERS ====================

  /**
   * Отримує деталі користувача
   */
  public static async getUsers(): Promise<UserDetails[]> {
    try {
      const response = await AniuaApi.axiosInstance.get<UserDetails[]>(
        `${AniuaApi.baseUrl}/v1/users`
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Помилка завантаження профілю користувача"
      );
    }
  }

  /**
   * Оновлює профіль користувача
   */
  public static async updateUserDetails(
    payload: UpdateUserDetails
  ): Promise<UserDetails[]> {
    try {
      const response = await AniuaApi.axiosInstance.patch<UserDetails[]>(
        `${AniuaApi.baseUrl}/v1/users`,
        payload
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося оновити профіль користувача"
      );
    }
  }

  /**
   * Видаляє користувача за reference (самостійно)
   */
  public static async deleteUser(reference: string): Promise<void> {
    try {
      await AniuaApi.axiosInstance.delete(
        `${AniuaApi.baseUrl}/v1/users/${reference}`
      );
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося видалити користувача"
      );
    }
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Реєструє push-токен та підписки
   */
  public static async registerNotificationToken(
    payload: RegisterTokenRequest
  ): Promise<SubscriptionResponse> {
    try {
      const response = await AniuaApi.axiosInstance.post<SubscriptionResponse>(
        `${AniuaApi.baseUrl}/v1/notifications/register`,
        payload
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося зареєструвати push-токен"
      );
    }
  }

  /**
   * Оновлює підписки для push-токена
   */
  public static async updateNotificationSubscription(
    payload: UpdateSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    try {
      const response = await AniuaApi.axiosInstance.patch<SubscriptionResponse>(
        `${AniuaApi.baseUrl}/v1/notifications/subscribe`,
        payload
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося оновити підписки"
      );
    }
  }

  /**
   * Отримує поточні підписки за токеном
   */
  public static async getNotificationSubscriptions(
    token: string
  ): Promise<SubscriptionResponse> {
    try {
      const response = await AniuaApi.axiosInstance.get<SubscriptionResponse>(
        `${AniuaApi.baseUrl}/v1/notifications/subscriptions`,
        {
          params: { token },
        }
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося отримати список підписок"
      );
    }
  }

  /**
   * Видаляє push-токен та скасовує усі підписки
   */
  public static async unregisterNotificationToken(
    payload: UnregisterTokenRequest
  ): Promise<SuccessResponse> {
    try {
      const response = await AniuaApi.axiosInstance.delete<SuccessResponse>(
        `${AniuaApi.baseUrl}/v1/notifications/unregister`,
        {
          data: payload,
        }
      );
      return response.data;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        "Не вдалося видалити push-токен"
      );
    }
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
        `${AniuaApi.baseUrl}/v1/teams`
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
        `${AniuaApi.baseUrl}/v1/teams`,
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

    return {
      list: teams,
      total,
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
      await AniuaApi.axiosInstance.get(`${AniuaApi.baseUrl}/v1/teams`, {
        timeout: 5000,
        params: { is_verified: true },
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==================== EPISODES METHODS ====================

  /**
   * Перевіряє чи URL повертає 404
   * @param url - URL для перевірки
   * @returns true якщо URL валідний (не 404)
   */
  private static async isUrlValid(
    url: string | null | undefined
  ): Promise<boolean> {
    if (!url) return false;
    try {
      const response = await AniuaApi.axiosInstance.head(url, {
        timeout: 5000,
      });
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      // Для інших помилок (мережа, таймаут) - вважаємо що URL може бути валідним
      return true;
    }
  }

  /**
   * Оновлює епізоди через refresh endpoint
   * @param slug - Slug аніме
   * @returns Масив оновлених епізодів
   */
  public static async refreshEpisodes(slug: string): Promise<Episode[]> {
    try {
      Logger.debug("AniuaApi", `Оновлення епізодів для ${slug} через refresh`);
      const response = await AniuaApi.axiosInstance.get<EpisodesResponse>(
        `${AniuaApi.baseUrl}/v1/episodes/refresh?slug=${slug}`
      );
      return response.data.episodes || [];
    } catch (error) {
      Logger.warn("AniuaApi", `Помилка refresh епізодів для ${slug}`, error);
      return [];
    }
  }

  /**
   * Парсить video_url плеєра для отримання m3u8 та poster
   * @param videoUrl - URL плеєра
   * @returns Об'єкт з m3u8 та poster або null
   */
  private static async parseVideoUrl(
    videoUrl: string
  ): Promise<{ m3u8: string | null; poster: string | null } | null> {
    try {
      const response = await AniuaApi.axiosInstance.get(videoUrl, {
        headers: {
          "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
        },
      });

      const htmlContent = response.data;
      let m3u8: string | null = null;
      let poster: string | null = null;

      // Пошук file (m3u8)
      let fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
      if (!fileMatch) {
        fileMatch = htmlContent.match(/file:\s*'([^']+)'/);
      }
      if (!fileMatch) {
        fileMatch = htmlContent.match(/file:"([^"]+)"/);
      }

      if (fileMatch && fileMatch[1]) {
        const fileUrl = fileMatch[1];
        // Якщо це не webm формат з якостями, використовуємо як m3u8
        if (!fileUrl.includes("webm") && !fileUrl.includes("[")) {
          m3u8 = fileUrl;
        }
      }

      // Пошук poster
      const posterMatch = htmlContent.match(/poster:\s*"([^"]+)"/);
      if (posterMatch && posterMatch[1]) {
        poster = posterMatch[1];
      }

      return { m3u8, poster };
    } catch (error) {
      Logger.warn("AniuaApi", `Помилка парсингу video_url: ${videoUrl}`, error);
      return null;
    }
  }

  /**
   * Валідує та виправляє m3u8/poster для епізодів
   * Викликати при відкритті bottomsheet для перевірки актуальності URL
   * @param episodes - Масив епізодів
   * @param slug - Slug аніме для refresh
   * @returns Масив епізодів з валідними URL
   */
  public static async validateAndFixEpisodes(
    episodes: Episode[],
    slug: string
  ): Promise<Episode[]> {
    if (episodes.length === 0) return episodes;

    // Перевіряємо перший епізод як індикатор
    const firstEpisode = episodes[0];
    const [isM3u8Valid, isPosterValid] = await Promise.all([
      AniuaApi.isUrlValid(firstEpisode.m3u8),
      AniuaApi.isUrlValid(firstEpisode.poster),
    ]);

    // Якщо обидва валідні - повертаємо як є
    if (isM3u8Valid && isPosterValid) {
      Logger.debug("AniuaApi", `Епізоди для ${slug} валідні`);
      return episodes;
    }

    Logger.debug("AniuaApi", `Невалідні URL для ${slug}, спробуємо refresh`, {
      m3u8Valid: isM3u8Valid,
      posterValid: isPosterValid,
    });

    // Спробуємо refresh
    const refreshedEpisodes = await AniuaApi.refreshEpisodes(slug);
    if (refreshedEpisodes.length > 0) {
      const refreshedFirst = refreshedEpisodes[0];
      const [isRefreshedM3u8Valid, isRefreshedPosterValid] = await Promise.all([
        AniuaApi.isUrlValid(refreshedFirst.m3u8),
        AniuaApi.isUrlValid(refreshedFirst.poster),
      ]);

      if (isRefreshedM3u8Valid && isRefreshedPosterValid) {
        Logger.debug("AniuaApi", `Refresh успішний для ${slug}`);
        return refreshedEpisodes;
      }
    }

    Logger.debug(
      "AniuaApi",
      `Refresh не допоміг для ${slug}, парсимо video_url`
    );

    // Fallback: парсимо video_url для всіх епізодів без додаткових перевірок
    // (перший епізод вже показав що URL невалідні)
    const fixedEpisodes = await Promise.all(
      episodes.map(async (episode) => {
        const parsed = await AniuaApi.parseVideoUrl(episode.video_url);
        if (parsed) {
          return {
            ...episode,
            m3u8: parsed.m3u8 || episode.m3u8,
            poster: parsed.poster || episode.poster,
          };
        }
        return episode;
      })
    );

    return fixedEpisodes;
  }

  /**
   * Отримує список епізодів для аніме за slug
   * @param slug - Slug аніме
   * @returns Масив епізодів
   *
   * @example
   * ```typescript
   * const episodes = await AniuaApi.getAnimeEpisodes("sono-bisque-doll-wa-koi-wo-suru-zoku-hen-789ae8");
   * console.log(`Знайдено ${episodes.length} епізодів`);
   * ```
   */
  public static async getAnimeEpisodes(slug: string): Promise<Episode[]> {
    const cacheKey = `aniua_episodes_${slug}`;

    // Спочатку перевіряємо персистентний кеш (зберігається 10 хв навіть після перезапуску)
    const persistentCached = EpisodesCacheStorage.get(cacheKey);
    if (persistentCached) {
      Logger.debug("AniuaApi", `Епізоди для ${slug} з персистентного кешу`);
      // Оновлюємо in-memory кеш
      AniuaApi.cache.episodes.set(slug, {
        data: persistentCached,
        timestamp: Date.now(),
      });
      return persistentCached;
    }

    // Перевіряємо in-memory кеш
    const cached = AniuaApi.cache.episodes.get(slug);
    if (cached && AniuaApi.isCacheValid(cached.timestamp)) {
      Logger.debug("AniuaApi", `Епізоди для ${slug} з in-memory кешу`);
      return cached.data;
    }

    try {
      Logger.debug("AniuaApi", `Завантаження епізодів для ${slug}`);

      const response = await AniuaApi.axiosInstance.get<EpisodesResponse>(
        `${AniuaApi.baseUrl}/v1/episodes?slug=${slug}`
      );

      const episodes = response.data.episodes || [];

      // Зберігаємо в персистентний кеш (10 хв)
      EpisodesCacheStorage.set(cacheKey, episodes);

      // Зберігаємо в in-memory кеш
      AniuaApi.cache.episodes.set(slug, {
        data: episodes,
        timestamp: Date.now(),
      });

      Logger.debug("AniuaApi", `Завантажено ${episodes.length} епізодів`);
      return episodes;
    } catch (error) {
      return AniuaApi.handleError(
        error as AxiosError,
        `Помилка завантаження епізодів для ${slug}`
      );
    }
  }

  /**
   * Отримує епізоди згруповані по командах озвучення
   * @param slug - Slug аніме
   * @returns Об'єкт де ключ - назва команди, значення - масив епізодів
   *
   * @example
   * ```typescript
   * const grouped = await AniuaApi.getAnimeEpisodesGroupedByTeam("sono-bisque-doll");
   * Object.entries(grouped).forEach(([team, eps]) => {
   *   console.log(`${team}: ${eps.length} епізодів`);
   * });
   * ```
   */
  public static async getAnimeEpisodesGroupedByTeam(
    slug: string
  ): Promise<Record<string, Episode[]>> {
    const episodes = await AniuaApi.getAnimeEpisodes(slug);

    const grouped: Record<string, Episode[]> = {};

    episodes.forEach((episode) => {
      const teamName = episode.team || "Невідомо";
      if (!grouped[teamName]) {
        grouped[teamName] = [];
      }
      grouped[teamName].push(episode);
    });

    // Сортуємо епізоди в кожній групі за номером
    Object.values(grouped).forEach((eps) => {
      eps.sort((a, b) => a.episode - b.episode);
    });

    return grouped;
  }

  /**
   * Отримує епізоди згруповані по плеєрах та командах озвучення
   * @param slug - Slug аніме
   * @returns Об'єкт де перший рівень - плеєр, другий - команда, значення - масив епізодів
   *
   * @example
   * ```typescript
   * const grouped = await AniuaApi.getAnimeEpisodesGroupedByPlayer("sono-bisque-doll");
   * // grouped = { "moon": { "Glass Moon": [...], "Didko": [...] }, "ashdi": { ... } }
   * ```
   */
  public static async getAnimeEpisodesGroupedByPlayer(
    slug: string
  ): Promise<EpisodesByPlayerAndTeam> {
    const episodes = await AniuaApi.getAnimeEpisodes(slug);

    const grouped: EpisodesByPlayerAndTeam = {};

    episodes.forEach((episode) => {
      const player = episode.player || "unknown";
      const team = episode.team || "Невідомо";

      if (!grouped[player]) {
        grouped[player] = {};
      }
      if (!grouped[player][team]) {
        grouped[player][team] = [];
      }
      grouped[player][team].push(episode);
    });

    // Сортуємо епізоди за номером в кожній групі
    Object.values(grouped).forEach((teams) => {
      Object.values(teams).forEach((eps) => {
        eps.sort((a, b) => a.episode - b.episode);
      });
    });

    return grouped;
  }

  /**
   * Отримує унікальні команди озвучення для конкретного аніме за slug
   * @param slug - Slug аніме
   * @returns Масив назв команд
   */
  public static async getEpisodeTeams(slug: string): Promise<string[]> {
    const episodes = await AniuaApi.getAnimeEpisodes(slug);
    const teams = new Set<string>();
    episodes.forEach((ep) => {
      if (ep.team) teams.add(ep.team);
    });
    return Array.from(teams);
  }

  /**
   * Перевіряє чи епізоди для аніме вже закешовані
   * @param slug - Slug аніме
   * @returns true якщо епізоди в кеші і кеш валідний
   */
  public static hasEpisodesCached(slug: string): boolean {
    const cached = AniuaApi.cache.episodes.get(slug);
    return !!cached && AniuaApi.isCacheValid(cached.timestamp);
  }

  /**
   * Попередньо завантажує епізоди в кеш (без очікування)
   * Використовується для прелоаду при відображенні карток аніме
   * @param slug - Slug аніме
   */
  public static prefetchEpisodes(slug: string): void {
    // Якщо вже в кеші - пропускаємо
    if (AniuaApi.hasEpisodesCached(slug)) {
      return;
    }

    // Завантажуємо в фоні без очікування
    AniuaApi.getAnimeEpisodes(slug).catch((error) => {
      Logger.debug("AniuaApi", `Prefetch failed for ${slug}:`, error);
    });
  }

  /**
   * Попередньо завантажує епізоди для масиву аніме
   * @param slugs - Масив slug аніме
   * @param concurrency - Кількість паралельних запитів (default: 3)
   */
  public static prefetchMultipleEpisodes(
    slugs: string[],
    concurrency: number = 3
  ): void {
    // Фільтруємо ті що вже в кеші
    const toFetch = slugs.filter((slug) => !AniuaApi.hasEpisodesCached(slug));

    if (toFetch.length === 0) return;

    // Завантажуємо пачками
    const fetchBatch = async (batch: string[]) => {
      await Promise.allSettled(
        batch.map((slug) => AniuaApi.getAnimeEpisodes(slug))
      );
    };

    // Розбиваємо на пачки і запускаємо
    for (let i = 0; i < toFetch.length; i += concurrency) {
      const batch = toFetch.slice(i, i + concurrency);
      fetchBatch(batch);
    }
  }

  /**
   * Завантажує raw вміст файлу з GitHub репозиторію
   * @param {string} gitHash - Хеш коміту або назва гілки
   * @param {string} file - Шлях до файлу в репозиторії
   * @returns {Promise<string>} Текстовий вміст файлу
   */
  public static async getGithubRaw(
    gitHash: string,
    file: string
  ): Promise<string> {
    try {
      const response = await fetch(
        `${(await this.getMetadata()).github}/AniUA/${gitHash}/${file}`.replace(
          "github.com",
          "raw.githubusercontent.com"
        )
      );
      Logger.debug(
        "getGithubRaw",
        "Завантаження файлу з GitHub",
        `${(await this.getMetadata()).github}/AniUA/${gitHash}/${file}`.replace(
          "github.com",
          "raw.githubusercontent.com"
        )
      );
      return await response.text();
    } catch (error: any) {
      Logger.error(
        "getGithubRaw",
        "Помилка при отриманні raw файлу з Github",
        error
      );
      return "";
    }
  }
}

// Експорт для зворотної сумісності з TeamsDbApi
export { AniuaApi as TeamsDbApi };
export default AniuaApi;
