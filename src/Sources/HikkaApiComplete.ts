import axios, { AxiosInstance } from "axios";
import Logger from "../Logger/Logger";

/**
 * Повний API клас для роботи з Hikka API (api.hikka.io)
 * Підтримує всі ендпоінти з OpenAPI специфікації
 * Всі запити кешуються на 5 хвилин для оптимізації продуктивності
 */
export class HikkaApiComplete {
  protected static apiUrl = "https://api.hikka.io/";
  protected static apiEpisodesUrl = "https://api.hikka-features.pp.ua/";
  protected static apiCache: Record<string, { data: any; timestamp: number }> = {};
  protected static CACHE_TTL = 5 * 60 * 1000;
  protected static currentYear = new Date().getFullYear();
  protected static authToken: string | null = null;
  protected static axiosInstance: AxiosInstance = axios.create({
    timeout: 10000,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  /**
   * Встановлює токен авторизації для запитів
   * @param {string} token - Токен авторизації
   */
  public static setAuthToken(token: string) {
    HikkaApiComplete.authToken = token;
    HikkaApiComplete.axiosInstance.defaults.headers.common["Auth"] = token;
  }

  /**
   * Видаляє токен авторизації
   */
  public static clearAuthToken() {
    HikkaApiComplete.authToken = null;
    delete HikkaApiComplete.axiosInstance.defaults.headers.common["Auth"];
  }

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
    ttl: number = HikkaApiComplete.CACHE_TTL
  ) {
    const cachedData = HikkaApiComplete.apiCache[cacheKey];
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp < ttl) {
      return cachedData.data;
    }

    try {
      const result = await requestFn();
      if (result?.code === 404) {
        return { data: [], code: 404 };
      }
      HikkaApiComplete.apiCache[cacheKey] = {
        data: result,
        timestamp: now,
      };
      return result;
    } catch (error: any) {
      Logger.error("HikkaApiComplete", `Помилка у запиті ${cacheKey}`, error);
      throw error;
    }
  }

  /**
   * Очищає весь кеш API
   */
  public static clearCache() {
    HikkaApiComplete.apiCache = {};
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * Реєстрація нового користувача
   * @param {Object} data - Дані реєстрації
   * @param {string} data.email - Email користувача
   * @param {string} data.username - Ім'я користувача
   * @param {string} data.password - Пароль
   * @param {string} data.captcha - Captcha токен
   * @returns {Promise<Object>} Результат реєстрації
   */
  public static async signup(data: {
    email: string;
    username: string;
    password: string;
    captcha: string;
  }) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/signup`,
      data
    );
    return response.data;
  }

  /**
   * Вхід користувача
   * @param {Object} data - Дані входу
   * @param {string} data.username - Ім'я користувача або email
   * @param {string} data.password - Пароль
   * @param {string} data.captcha - Captcha токен
   * @returns {Promise<Object>} Токен авторизації
   */
  public static async login(data: {
    username: string;
    password: string;
    captcha: string;
  }) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/login`,
      data
    );
    return response.data;
  }

  /**
   * Активація акаунту
   * @param {string} token - Токен активації
   * @returns {Promise<Object>}
   */
  public static async activateAccount(token: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/activation`,
      { token }
    );
    return response.data;
  }

  /**
   * Повторна відправка посилання активації
   * @param {string} email - Email користувача
   * @returns {Promise<Object>}
   */
  public static async resendActivation(email: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/activation/resend`,
      { email }
    );
    return response.data;
  }

  /**
   * Запит на скидання пароля
   * @param {string} email - Email користувача
   * @returns {Promise<Object>}
   */
  public static async requestPasswordReset(email: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/password/reset`,
      { email }
    );
    return response.data;
  }

  /**
   * Підтвердження скидання пароля
   * @param {Object} data - Дані підтвердження
   * @param {string} data.token - Токен скидання
   * @param {string} data.password - Новий пароль
   * @returns {Promise<Object>}
   */
  public static async confirmPasswordReset(data: {
    token: string;
    password: string;
  }) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/password/confirm`,
      data
    );
    return response.data;
  }

  /**
   * Отримання OAuth URL провайдера
   * @param {string} provider - Провайдер OAuth (google, discord, github)
   * @returns {Promise<Object>}
   */
  public static async getOAuthUrl(provider: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}auth/oauth/${provider}`
    );
    return response.data;
  }

  /**
   * Обмін OAuth коду на токен
   * @param {string} provider - Провайдер OAuth
   * @param {string} code - Код авторизації
   * @returns {Promise<Object>}
   */
  public static async exchangeOAuthToken(provider: string, code: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/oauth/${provider}`,
      { code }
    );
    return response.data;
  }

  /**
   * Отримання інформації про поточний токен
   * @returns {Promise<Object>}
   */
  public static async getTokenInfo() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}auth/token/info`
    );
    return response.data;
  }

  /**
   * Запит токену для стороннього клієнта
   * @param {string} clientReference - Референс клієнта
   * @returns {Promise<Object>}
   */
  public static async requestThirdPartyToken(clientReference: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/token/request/${clientReference}`
    );
    return response.data;
  }

  /**
   * Генерація токену для стороннього клієнта
   * @param {string} secret - Секретний ключ
   * @returns {Promise<Object>}
   */
  public static async generateToken(secret: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}auth/token`,
      { secret }
    );
    return response.data;
  }

  /**
   * Список сторонніх токенів
   * @returns {Promise<Array>}
   */
  public static async listThirdPartyTokens() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}auth/token/thirdparty`
    );
    return response.data;
  }

  /**
   * Відкликання токену
   * @param {string} tokenReference - Референс токену
   * @returns {Promise<Object>}
   */
  public static async revokeToken(tokenReference: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}auth/token/${tokenReference}`
    );
    return response.data;
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Отримання профілю поточного користувача
   * @returns {Promise<Object>}
   */
  public static async getCurrentUser() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}user/me`
    );
    return response.data;
  }

  /**
   * Отримання профілю користувача за username
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async getUserProfile(username: string) {
    const cacheKey = `user_${username}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}user/${username}`
      );
      return response.data;
    });
  }

  /**
   * Отримання активності користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Array>}
   */
  public static async getUserActivity(username: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}user/${username}/activity`
    );
    return response.data;
  }

  /**
   * Пошук користувачів
   * @param {Object} params - Параметри пошуку
   * @param {string} [params.query] - Текст пошуку
   * @param {number} [params.page=1] - Номер сторінки
   * @param {number} [params.size=20] - Кількість елементів
   * @returns {Promise<Object>}
   */
  public static async searchUsers(params: {
    query?: string;
    page?: number;
    size?: number;
  }) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}user/list`,
      params
    );
    return response.data;
  }

  // ==================== ANIME ENDPOINTS ====================

  /**
   * Пошук аніме
   * @param {Object} params - Параметри пошуку
   * @param {string} [params.query] - Текст пошуку
   * @param {number} [params.page=1] - Номер сторінки
   * @param {number} [params.size=20] - Кількість елементів
   * @param {Array<string>} [params.media_type] - Типи медіа
   * @param {Array<number>} [params.years] - Діапазон років [від, до]
   * @param {Array<number>} [params.score] - Діапазон рейтингу [від, до]
   * @param {Array<string>} [params.status] - Статуси
   * @param {Array<string>} [params.genres] - Жанри
   * @param {Array<string>} [params.studios] - Студії
   * @param {boolean} [params.only_translated] - Тільки перекладені
   * @param {Array<string>} [params.sort] - Сортування
   * @returns {Promise<Object>}
   */
  public static async searchAnime(params: {
    query?: string;
    page?: number;
    size?: number;
    media_type?: string[];
    years?: number[];
    score?: number[];
    status?: string[];
    genres?: string[];
    studios?: string[];
    only_translated?: boolean;
    sort?: string[];
  }) {
    const { page = 1, size = 20, ...rest } = params;
    const cacheKey = `anime_search_${JSON.stringify(params)}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.post(
        `${HikkaApiComplete.apiUrl}anime?page=${page}&size=${size}`,
        rest
      );
      return response.data;
    });
  }

  /**
   * Отримує детальну інформацію про аніме за slug
   * @param {string} slug - Унікальний slug аніме
   * @returns {Promise<Object|null>} Об'єкт з деталями аніме або null
   */
  public static async getAnimeDetails(slug: string) {
    const cacheKey = `anime_details_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}anime/${slug}`
      );
      return response.data;
    }).catch(() => null);
  }

  /**
   * Отримання персонажів аніме
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>}
   */
  public static async getAnimeCharacters(slug: string) {
    const cacheKey = `anime_characters_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}anime/${slug}/characters`
      );
      return response.data.list;
    });
  }

  /**
   * Отримання персоналу аніме
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>}
   */
  public static async getAnimeStaff(slug: string) {
    const cacheKey = `anime_staff_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}anime/${slug}/staff`
      );
      return response.data.list;
    });
  }

  /**
   * Отримання епізодів аніме
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>}
   */
  public static async getAnimeEpisodes(slug: string) {
    const cacheKey = `anime_episodes_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}anime/${slug}/episodes`
      );
      return response.data.list;
    });
  }

  /**
   * Отримання рекомендацій аніме
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>}
   */
  public static async getAnimeRecommendations(slug: string) {
    const cacheKey = `anime_recommendations_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}anime/${slug}/recommendations`
      );
      return response.data.list;
    });
  }

  /**
   * Отримує франшизу (пов'язані аніме) за slug
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>} Масив аніме з франшизи
   */
  public static async getAnimeFranchise(slug: string) {
    const cacheKey = `franchise_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      try {
        const response = await HikkaApiComplete.axiosInstance.get(
          `${HikkaApiComplete.apiUrl}anime/${slug}/franchise`
        );
        return response.data.list;
      } catch (error: any) {
        if (error?.response?.status === 400) {
          return [];
        }
        Logger.error("HikkaApiComplete", "Помилка при завантаженні франшизи", error);
        return [];
      }
    }).catch(() => []);
  }

  // ==================== MANGA/NOVEL ENDPOINTS ====================

  /**
   * Пошук манги
   * @param {Object} params - Параметри пошуку (аналогічно searchAnime)
   * @returns {Promise<Object>}
   */
  public static async searchManga(params: any) {
    const { page = 1, size = 20, ...rest } = params;
    const cacheKey = `manga_search_${JSON.stringify(params)}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.post(
        `${HikkaApiComplete.apiUrl}manga?page=${page}&size=${size}`,
        rest
      );
      return response.data;
    });
  }

  /**
   * Отримання деталей манги
   * @param {string} slug - Slug манги
   * @returns {Promise<Object>}
   */
  public static async getMangaDetails(slug: string) {
    const cacheKey = `manga_details_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}manga/${slug}`
      );
      return response.data;
    });
  }

  /**
   * Отримання персонажів манги
   * @param {string} slug - Slug манги
   * @returns {Promise<Array>}
   */
  public static async getMangaCharacters(slug: string) {
    const cacheKey = `manga_characters_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}manga/${slug}/characters`
      );
      return response.data.list;
    });
  }

  /**
   * Пошук ранобе
   * @param {Object} params - Параметри пошуку
   * @returns {Promise<Object>}
   */
  public static async searchNovel(params: any) {
    const { page = 1, size = 20, ...rest } = params;
    const cacheKey = `novel_search_${JSON.stringify(params)}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.post(
        `${HikkaApiComplete.apiUrl}novel?page=${page}&size=${size}`,
        rest
      );
      return response.data;
    });
  }

  /**
   * Отримання деталей ранобе
   * @param {string} slug - Slug ранобе
   * @returns {Promise<Object>}
   */
  public static async getNovelDetails(slug: string) {
    const cacheKey = `novel_details_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}novel/${slug}`
      );
      return response.data;
    });
  }

  /**
   * Отримання персонажів ранобе
   * @param {string} slug - Slug ранобе
   * @returns {Promise<Array>}
   */
  public static async getNovelCharacters(slug: string) {
    const cacheKey = `novel_characters_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}novel/${slug}/characters`
      );
      return response.data.list;
    });
  }

  // ==================== WATCH LIST ENDPOINTS ====================

  /**
   * Отримання запису зі списку перегляду
   * @param {string} slug - Slug аніме
   * @returns {Promise<Object>}
   */
  public static async getWatchEntry(slug: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}watch/${slug}`
    );
    return response.data;
  }

  /**
   * Додавання/оновлення аніме у списку перегляду
   * @param {string} slug - Slug аніме
   * @param {Object} data - Дані запису
   * @param {string} data.status - Статус перегляду (planned, watching, completed, etc.)
   * @param {number} [data.score] - Оцінка (1-10)
   * @param {number} [data.episodes] - Переглянуто епізодів
   * @param {number} [data.rewatches] - Кількість переглядів
   * @returns {Promise<Object>}
   */
  public static async addToWatchList(
    slug: string,
    data: {
      status: string;
      score?: number;
      episodes?: number;
      rewatches?: number;
    }
  ) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}watch/${slug}`,
      data
    );
    return response.data;
  }

  /**
   * Видалення аніме зі списку перегляду
   * @param {string} slug - Slug аніме
   * @returns {Promise<Object>}
   */
  public static async removeFromWatchList(slug: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}watch/${slug}`
    );
    return response.data;
  }

  /**
   * Отримання користувачів які дивляться аніме
   * @param {string} slug - Slug аніме
   * @returns {Promise<Array>}
   */
  public static async getAnimeFollowing(slug: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}watch/${slug}/following`
    );
    return response.data;
  }

  /**
   * Отримання статистики списку перегляду користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async getWatchStats(username: string) {
    const cacheKey = `watch_stats_${username}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}watch/${username}/stats`
      );
      return response.data;
    });
  }

  /**
   * Отримання випадкового запису зі списку перегляду
   * @param {string} username - Ім'я користувача
   * @param {string} status - Статус перегляду
   * @returns {Promise<Object>}
   */
  public static async getRandomWatchEntry(username: string, status: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}watch/random/${username}/${status}`
    );
    return response.data;
  }

  /**
   * Отримання списку перегляду користувача
   * @param {string} username - Ім'я користувача
   * @param {Object} params - Параметри фільтрації
   * @returns {Promise<Object>}
   */
  public static async getUserWatchList(username: string, params: any = {}) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}watch/${username}/list`,
      params
    );
    return response.data;
  }

  // ==================== READ LIST ENDPOINTS ====================

  /**
   * Отримання запису зі списку читання
   * @param {string} contentType - Тип контенту (manga/novel)
   * @param {string} slug - Slug
   * @returns {Promise<Object>}
   */
  public static async getReadEntry(contentType: string, slug: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}read/${contentType}/${slug}`
    );
    return response.data;
  }

  /**
   * Додавання/оновлення у списку читання
   * @param {string} contentType - Тип контенту (manga/novel)
   * @param {string} slug - Slug
   * @param {Object} data - Дані запису
   * @returns {Promise<Object>}
   */
  public static async addToReadList(
    contentType: string,
    slug: string,
    data: any
  ) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}read/${contentType}/${slug}`,
      data
    );
    return response.data;
  }

  /**
   * Видалення зі списку читання
   * @param {string} contentType - Тип контенту (manga/novel)
   * @param {string} slug - Slug
   * @returns {Promise<Object>}
   */
  public static async removeFromReadList(contentType: string, slug: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}read/${contentType}/${slug}`
    );
    return response.data;
  }

  /**
   * Отримання списку читання користувача
   * @param {string} contentType - Тип контенту (manga/novel)
   * @param {string} username - Ім'я користувача
   * @param {Object} params - Параметри фільтрації
   * @returns {Promise<Object>}
   */
  public static async getUserReadList(
    contentType: string,
    username: string,
    params: any = {}
  ) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}read/${contentType}/${username}/list`,
      params
    );
    return response.data;
  }

  // ==================== CHARACTER/PEOPLE ENDPOINTS ====================

  /**
   * Отримання деталей персонажа
   * @param {string} slug - Slug персонажа
   * @returns {Promise<Object>}
   */
  public static async getCharacterDetails(slug: string) {
    const cacheKey = `character_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}characters/${slug}`
      );
      return response.data;
    });
  }

  /**
   * Пошук персонажів
   * @param {Object} params - Параметри пошуку
   * @returns {Promise<Object>}
   */
  public static async searchCharacters(params: any) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}characters`,
      params
    );
    return response.data;
  }

  /**
   * Отримання аніме з персонажем
   * @param {string} slug - Slug персонажа
   * @returns {Promise<Array>}
   */
  public static async getCharacterAnime(slug: string) {
    const cacheKey = `character_anime_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}characters/${slug}/anime`
      );
      return response.data.list;
    });
  }

  /**
   * Отримання деталей особи (актор, режисер, тощо)
   * @param {string} slug - Slug особи
   * @returns {Promise<Object>}
   */
  public static async getPersonDetails(slug: string) {
    const cacheKey = `person_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}people/${slug}`
      );
      return response.data;
    });
  }

  /**
   * Пошук осіб
   * @param {Object} params - Параметри пошуку
   * @returns {Promise<Object>}
   */
  public static async searchPeople(params: any) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}people`,
      params
    );
    return response.data;
  }

  /**
   * Отримання робіт особи в аніме
   * @param {string} slug - Slug особи
   * @returns {Promise<Array>}
   */
  public static async getPersonAnime(slug: string) {
    const cacheKey = `person_anime_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}people/${slug}/anime`
      );
      return response.data.list;
    });
  }

  // ==================== COLLECTIONS ENDPOINTS ====================

  /**
   * Отримання списку колекцій
   * @param {Object} params - Параметри фільтрації
   * @returns {Promise<Object>}
   */
  public static async getCollections(params: any = {}) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}collections`,
      params
    );
    return response.data;
  }

  /**
   * Створення нової колекції
   * @param {Object} data - Дані колекції
   * @returns {Promise<Object>}
   */
  public static async createCollection(data: any) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}collections/create`,
      data
    );
    return response.data;
  }

  /**
   * Отримання колекції
   * @param {string} reference - Референс колекції
   * @returns {Promise<Object>}
   */
  public static async getCollection(reference: string) {
    const cacheKey = `collection_${reference}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}collections/${reference}`
      );
      return response.data;
    });
  }

  /**
   * Оновлення колекції
   * @param {string} reference - Референс колекції
   * @param {Object} data - Нові дані
   * @returns {Promise<Object>}
   */
  public static async updateCollection(reference: string, data: any) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}collections/${reference}`,
      data
    );
    return response.data;
  }

  /**
   * Видалення колекції
   * @param {string} reference - Референс колекції
   * @returns {Promise<Object>}
   */
  public static async deleteCollection(reference: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}collections/${reference}`
    );
    return response.data;
  }

  // ==================== COMMENTS ENDPOINTS ====================

  /**
   * Отримання останніх коментарів
   * @returns {Promise<Array>}
   */
  public static async getLatestComments() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}comments/latest`
    );
    return response.data;
  }

  /**
   * Отримання списку коментарів
   * @returns {Promise<Array>}
   */
  public static async getCommentsList() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}comments/list`
    );
    return response.data;
  }

  /**
   * Написання коментаря
   * @param {string} contentType - Тип контенту
   * @param {string} slug - Slug
   * @param {Object} data - Дані коментаря
   * @returns {Promise<Object>}
   */
  public static async writeComment(
    contentType: string,
    slug: string,
    data: any
  ) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}comments/${contentType}/${slug}`,
      data
    );
    return response.data;
  }

  /**
   * Отримання коментарів контенту
   * @param {string} contentType - Тип контенту
   * @param {string} slug - Slug
   * @returns {Promise<Array>}
   */
  public static async getContentComments(contentType: string, slug: string) {
    const cacheKey = `comments_${contentType}_${slug}`;
    return HikkaApiComplete.cachedRequest(
      cacheKey,
      async () => {
        const response = await HikkaApiComplete.axiosInstance.get(
          `${HikkaApiComplete.apiUrl}comments/${contentType}/${slug}/list`
        );
        return response.data;
      },
      60000 // 1 хвилина кеш для коментарів
    );
  }

  /**
   * Редагування коментаря
   * @param {string} commentReference - Референс коментаря
   * @param {Object} data - Нові дані
   * @returns {Promise<Object>}
   */
  public static async editComment(commentReference: string, data: any) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}comments/${commentReference}`,
      data
    );
    return response.data;
  }

  /**
   * Видалення коментаря
   * @param {string} commentReference - Референс коментаря
   * @returns {Promise<Object>}
   */
  public static async deleteComment(commentReference: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}comments/${commentReference}`
    );
    return response.data;
  }

  // ==================== NOTIFICATIONS ENDPOINTS ====================

  /**
   * Отримання сповіщень користувача
   * @returns {Promise<Array>}
   */
  public static async getNotifications() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}notifications`
    );
    return response.data;
  }

  /**
   * Отримання кількості непрочитаних сповіщень
   * @returns {Promise<Object>}
   */
  public static async getNotificationsCount() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}notifications/count`
    );
    return response.data;
  }

  /**
   * Позначення сповіщення як прочитане
   * @param {string} notificationReference - Референс сповіщення
   * @returns {Promise<Object>}
   */
  public static async markNotificationAsSeen(notificationReference: string) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}notifications/${notificationReference}/seen`
    );
    return response.data;
  }

  // ==================== FAVORITE ENDPOINTS ====================

  /**
   * Отримання статусу улюбленого
   * @param {string} contentType - Тип контенту
   * @param {string} slug - Slug
   * @returns {Promise<Object>}
   */
  public static async getFavoriteStatus(contentType: string, slug: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}favourite/${contentType}/${slug}`
    );
    return response.data;
  }

  /**
   * Додавання до улюблених
   * @param {string} contentType - Тип контенту
   * @param {string} slug - Slug
   * @returns {Promise<Object>}
   */
  public static async addToFavorites(contentType: string, slug: string) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}favourite/${contentType}/${slug}`
    );
    return response.data;
  }

  /**
   * Видалення з улюблених
   * @param {string} contentType - Тип контенту
   * @param {string} slug - Slug
   * @returns {Promise<Object>}
   */
  public static async removeFromFavorites(contentType: string, slug: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}favourite/${contentType}/${slug}`
    );
    return response.data;
  }

  /**
   * Отримання списку улюблених користувача
   * @param {string} contentType - Тип контенту
   * @param {string} username - Ім'я користувача
   * @param {Object} params - Параметри фільтрації
   * @returns {Promise<Object>}
   */
  public static async getUserFavorites(
    contentType: string,
    username: string,
    params: any = {}
  ) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}favourite/${contentType}/${username}/list`,
      params
    );
    return response.data;
  }

  // ==================== FOLLOW ENDPOINTS ====================

  /**
   * Перевірка статусу підписки
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async getFollowStatus(username: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}follow/${username}`
    );
    return response.data;
  }

  /**
   * Підписатись на користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async followUser(username: string) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}follow/${username}`
    );
    return response.data;
  }

  /**
   * Відписатись від користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async unfollowUser(username: string) {
    const response = await HikkaApiComplete.axiosInstance.delete(
      `${HikkaApiComplete.apiUrl}follow/${username}`
    );
    return response.data;
  }

  /**
   * Отримання статистики підписок
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Object>}
   */
  public static async getFollowStats(username: string) {
    const cacheKey = `follow_stats_${username}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}follow/${username}/stats`
      );
      return response.data;
    });
  }

  /**
   * Отримання списку підписок користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Array>}
   */
  public static async getUserFollowing(username: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}follow/${username}/following`
    );
    return response.data;
  }

  /**
   * Отримання списку підписників користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Array>}
   */
  public static async getUserFollowers(username: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}follow/${username}/followers`
    );
    return response.data;
  }

  // ==================== SCHEDULE ENDPOINTS ====================

  /**
   * Отримання розкладу аніме
   * @param {Object} params - Параметри фільтрації
   * @returns {Promise<Array>}
   */
  public static async getAnimeSchedule(params: any = {}) {
    const cacheKey = `schedule_${JSON.stringify(params)}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.post(
        `${HikkaApiComplete.apiUrl}schedule/anime`,
        params
      );
      return response.data;
    });
  }

  // ==================== OTHER ENDPOINTS ====================

  /**
   * Отримує список всіх жанрів аніме
   * @returns {Promise<Array>} Масив об'єктів жанрів
   */
  public static async getGenres() {
    const cacheKey = `genres`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}genres`
      );
      return response.data.list;
    });
  }

  /**
   * Завантаження зображення
   * @param {string} uploadType - Тип завантаження (avatar, cover, etc.)
   * @param {FormData} formData - Дані форми з файлом
   * @returns {Promise<Object>}
   */
  public static async uploadImage(uploadType: string, formData: FormData) {
    const response = await HikkaApiComplete.axiosInstance.put(
      `${HikkaApiComplete.apiUrl}upload/${uploadType}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Отримання деталей компанії
   * @param {string} slug - Slug компанії
   * @returns {Promise<Object>}
   */
  public static async getCompanyDetails(slug: string) {
    const cacheKey = `company_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      const response = await HikkaApiComplete.axiosInstance.get(
        `${HikkaApiComplete.apiUrl}companies/${slug}`
      );
      return response.data;
    });
  }

  /**
   * Пошук компаній
   * @param {Object} params - Параметри пошуку
   * @returns {Promise<Object>}
   */
  public static async searchCompanies(params: any) {
    const response = await HikkaApiComplete.axiosInstance.post(
      `${HikkaApiComplete.apiUrl}companies`,
      params
    );
    return response.data;
  }

  /**
   * Отримання історії підписок
   * @returns {Promise<Array>}
   */
  public static async getFollowingHistory() {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}history/following`
    );
    return response.data;
  }

  /**
   * Отримання історії користувача
   * @param {string} username - Ім'я користувача
   * @returns {Promise<Array>}
   */
  public static async getUserHistory(username: string) {
    const response = await HikkaApiComplete.axiosInstance.get(
      `${HikkaApiComplete.apiUrl}history/user/${username}`
    );
    return response.data;
  }

  // ==================== EPISODES FROM HIKKA-FEATURES ====================

  /**
   * Отримує список епізодів аніме з озвучками від різних провайдерів
   * @param {string} slug - Slug аніме
   * @returns {Promise<Object>} Об'єкт з епізодами по озвучкам та провайдерам або помилкою
   */
  public static async getEpisodes(slug: string) {
    const cacheKey = `episodes_${slug}`;
    return HikkaApiComplete.cachedRequest(cacheKey, async () => {
      try {
        Logger.debug("HikkaApiComplete", "Завантаження епізодів для slug", slug);

        const response = await HikkaApiComplete.axiosInstance.get(
          `${HikkaApiComplete.apiEpisodesUrl}watch/${slug}`
        );

        Logger.debug("HikkaApiComplete", "Отримано епізоди", response.data);

        const { type, ...rest } = response.data;

        return { data: rest, code: response.status };
      } catch (error: any) {
        Logger.error("HikkaApiComplete", "Помилка при завантаженні епізодів", error);
        return {
          data: [],
          code: error?.response?.status || 500,
        };
      }
    });
  }

  /**
   * Повертає базову URL для Hikka API
   * @returns {string} Базова URL API
   */
  public static getApiUrl() {
    return `${HikkaApiComplete.apiUrl}`;
  }
}
