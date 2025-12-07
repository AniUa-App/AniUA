import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";

interface ApiResponse<T = any> {
  [key: string]: T;
}

/**
 * API клас для взаємодії з серверним бекендом AniUA
 * Керує автентифікацією користувачів, збором feedback, та отриманням метаданих
 */
class ServerApi {
  private static readonly BASE_URL = MainConfig.api.url;
  private static readonly API_KEY = MainConfig.api.key;
  private static readonly REQUEST_TIMEOUT = 100000; // 100 секунд

  private static uniqueAccountId = MainConfig.devInfo.uniqueAccountId;
  private static cachedDeviceId: string | undefined;

  /**
   * Отримує унікальний ID пристрою з кешу або генерує новий
   * @returns {Promise<string>} Унікальний ID пристрою
   */
  private static async getUserId(): Promise<string> {
    if (this.isValidDeviceId(this.cachedDeviceId)) {
      return this.cachedDeviceId!;
    }

    if (this.isValidDeviceId(MainConfig?.devInfo?.deviceId)) {
      this.cachedDeviceId = MainConfig.devInfo.deviceId;
      return this.cachedDeviceId!;
    }

    const newDeviceId = MainConfig.devInfo.getUniqueId();
    MainConfig.devInfo.deviceId = newDeviceId;
    this.cachedDeviceId = newDeviceId;

    Logger.debug("ServerApi", "Згенеровано новий device ID", newDeviceId);
    return newDeviceId;
  }

  /**
   * Перевіряє валідність ID пристрою
   * @param {string | undefined} deviceId - ID для перевірки
   * @returns {boolean} true якщо ID валідний
   */
  private static isValidDeviceId(deviceId: string | undefined): boolean {
    return !!(deviceId && deviceId !== "unknown");
  }

  /**
   * Формує HTTP заголовки для API запитів
   * @returns {Record<string, string>} Об'єкт з заголовками
   */
  private static getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Key: this.API_KEY,
    };
  }

  /**
   * Виконує HTTP запит до серверного API з підтримкою таймауту
   * @template T - Тип даних відповіді
   * @param {string} endpoint - Endpoint API
   * @param {Record<string, any>} payload - Дані для відправки
   * @param {string} [method="POST"] - HTTP метод
   * @returns {Promise<ApiResponse<T>>} Відповідь від сервера
   */
  private static async callEdge<T = any>(
    endpoint: string,
    payload: Record<string, any>,
    method: string = "POST"
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const controller = new AbortController();

    try {
      Logger.debug("ServerApi", `Виконується запит до API: ${this.BASE_URL}`);
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT
      );

      // Формуємо URL з використанням конфігурації
      const url = `${this.BASE_URL}/${endpoint}`;

      const fetchOptions: RequestInit = {
        method: method,
        headers: this.getHeaders(),
        signal: controller.signal,
      };

      if (method !== "GET" && method !== "HEAD") {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.info(
        "ServerApi",
        `API запит "${endpoint}" виконано за ${executionTime}с`
      );

      this.logResponseDetails(endpoint, response);

      return await this.parseResponse<T>(response);
    } catch (error: any) {
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.error(
        "ServerApi",
        `Помилка API запиту "${endpoint}" за ${executionTime}с`,
        error
      );
      throw error;
    } finally {
      controller.abort();
    }
  }

  /**
   * Логує деталі відповіді сервера (Cloudflare headers, статус, розмір)
   * @param {string} endpoint - Назва endpoint
   * @param {Response} response - HTTP відповідь
   */
  private static logResponseDetails(
    endpoint: string,
    response: Response
  ): void {
    try {
      const headers = response.headers;
      const getHeader = (key: string) =>
        headers.get(key) || headers.get(key.toUpperCase()) || "-";

      Logger.debug("ServerApi", `${endpoint} → Статус: ${response.status}`, {
        cfRay: getHeader("cf-ray"),
        serverTiming: getHeader("server-timing"),
        cacheStatus: getHeader("cf-cache-status"),
        contentLength: getHeader("content-length"),
      });
    } catch (error) {
      // Ігноруємо помилки, щоб не блокувати основний процес
    }
  }

  /**
   * Парсить JSON відповідь від сервера
   * @template T - Тип даних відповіді
   * @param {Response} response - HTTP відповідь
   * @returns {Promise<ApiResponse<T>>} Розпарсена відповідь або порожній об'єкт
   */
  private static async parseResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    try {
      const text = await response.text();
      if (!text) {
        return {} as ApiResponse<T>;
      }
      Logger.debug("ServerApi", "API відповідь", text);
      return JSON.parse(text) as ApiResponse<T>;
    } catch (error) {
      Logger.warn(
        "ServerApi",
        "Не вдалося розпарсити JSON відповідь, повертаємо порожній об'єкт"
      );
      return {} as ApiResponse<T>;
    }
  }

  /**
   * Перевіряє чи зареєстрований користувач з поточним deviceId
   * @returns {Promise<boolean>} true якщо користувач існує в базі
   */
  public static async isUser(): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      Logger.debug("ServerApi", "Перевірка користувача", {
        userId,
        version: MainConfig.devInfo.version,
      });
      const response = await this.callEdge<{ isUser?: boolean }>("isUser", {
        unique_device_id: userId,
        user_version: MainConfig.devInfo.version,
      });

      Logger.debug("ServerApi", "Результат перевірки користувача", response);
      return !!response?.exists;
    } catch (error: any) {
      Logger.error("ServerApi", "Помилка при перевірці користувача", error);
      return false;
    }
  }

  /**
   * Отримує унікальний ID акаунту користувача з сервера або кешу
   * @returns {Promise<string>} Унікальний ID акаунту
   */
  public static async getUniqueAccountId(): Promise<string> {
    try {
      // Якщо ID вже закешований, повертаємо його
      if (this.uniqueAccountId) {
        return this.uniqueAccountId;
      }

      const userId = await this.getUserId();
      const response = await this.callEdge<{ unique_account_id?: string }>(
        "getAccId",
        {
          unique_device_id: userId,
        }
      );

      const accountId =
        (response &&
          typeof response === "object" &&
          response.unique_account_id) ||
        "";
      this.uniqueAccountId = accountId as string;
      return accountId as string;
    } catch (error: any) {
      Logger.error("ServerApi", "Помилка при отриманні ID акаунту", error);
      return "";
    }
  }

  /**
   * Реєструє нового користувача в системі
   * @returns {Promise<string>} Унікальний ID новоствореного акаунту
   */
  public static async newUser(): Promise<string> {
    try {
      const userId = await this.getUserId();
      const response = await this.callEdge<{ unique_account_id?: string }>(
        "newUser",
        {
          unique_device_id: userId,
          user_version: MainConfig.devInfo.version,
        }
      );

      const accountId =
        (response &&
          typeof response === "object" &&
          response.unique_account_id) ||
        "";
      this.uniqueAccountId = accountId as string;
      Logger.info(
        "ServerApi",
        "Зареєстровано нового користувача з ID",
        accountId
      );
      return accountId as string;
    } catch (error: any) {
      Logger.error(
        "ServerApi",
        "Помилка при реєстрації нового користувача",
        error
      );
      return "";
    }
  }

  /**
   * Відправляє відгук користувача на сервер
   * @param {number} rating - Оцінка від 1 до 5 зірок
   * @param {string} feedback - Текст відгуку
   * @returns {Promise<boolean>} true якщо відгук успішно збережено
   */
  public static async sendFeedback(
    rating: number,
    feedback: string
  ): Promise<boolean> {
    try {
      const userId =
        SettingsStorage.getParameter("accountId") ||
        (await ServerApi.getUniqueAccountId());
      const response = await this.callEdge<{ saved?: boolean }>("newFeedBack", {
        unique_account_id: userId,
        stars: rating,
        message: feedback,
      });
      return !!response.saved;
    } catch (error: any) {
      Logger.error("ServerApi", "Помилка при відправці відгуку", error);
      return false;
    }
  }

  /**
   * Отримує метадані додатку (URL сайту, Telegram, GitHub тощо)
   * @returns {Promise<any>} Об'єкт з метаданими
   */
  public static async getMetadata(): Promise<any> {
    try {
      const response = await this.callEdge<any>("getMetadata", {}, "GET");

      return response;
    } catch (error: any) {
      Logger.error(
        "getGithubRaw",
        "Помилка при отриманні метаданів:",
        error?.message || error
      );
      return {};
    }
  }
}

/**
 * Завантажує raw вміст файлу з GitHub репозиторію
 * @param {string} gitHash - Хеш коміту або назва гілки
 * @param {string} file - Шлях до файлу в репозиторії
 * @returns {Promise<string>} Текстовий вміст файлу
 */
export const getGithubRaw = async (
  gitHash: string,
  file: string
): Promise<string> => {
  try {
    const response = await fetch(
      `${MainConfig.urls.github}/AniUA/${gitHash}/${file}`.replace(
        "github.com",
        "raw.githubusercontent.com"
      )
    );
    Logger.debug(
      "getGithubRaw",
      "Завантаження файлу з GitHub",
      `${MainConfig.urls.github}/AniUA/${gitHash}/${file}`.replace(
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
  }
};

/**
 * Отримує або створює унікальний ID акаунту користувача
 * Перевіряє чи існує користувач, якщо ні - реєструє нового
 * @returns {Promise<string>} Унікальний ID акаунту
 */
export const getUniqueAccountId = async (): Promise<string> => {
  try {
    const isExistingUser = await ServerApi.isUser();

    if (isExistingUser) {
      Logger.debug(
        "getUniqueAccountId",
        "Користувач існує, отримуємо ID акаунту"
      );
      return await ServerApi.getUniqueAccountId();
    } else {
      Logger.debug(
        "getUniqueAccountId",
        "Користувач не існує, реєструємо нового"
      );
      return await ServerApi.newUser();
    }
  } catch (error) {
    Logger.error(
      "getUniqueAccountId",
      "Помилка при отриманні унікального ID акаунту",
      error
    );
    return "";
  }
};

/**
 * Зручна функція-обгортка для отримання метаданих додатку
 * @returns {Promise<any>} Об'єкт з метаданими
 */
export const getMetadata = async (): Promise<any> => {
  try {
    const response = await ServerApi.getMetadata();
    return response;
  } catch (error) {
    Logger.error("getMetadata", "Помилка при отриманні метаданів", error);
    return {};
  }
};

export default ServerApi;
