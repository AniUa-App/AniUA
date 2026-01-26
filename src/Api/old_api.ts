import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";

interface ApiResponse<T = any> {
  [key: string]: T;
}

/**
 * API клас для взаємодії з серверним бекендом AniUA
 * Керує збором feedback та отриманням метаданих
 */
class ServerApi {
  private static readonly BASE_URL = MainConfig.api.url;
  private static readonly API_KEY = MainConfig.api.key;
  private static readonly REQUEST_TIMEOUT = 100000;

  /**
   * Отримує унікальний ID пристрою
   * @returns {string} Унікальний ID пристрою
   */
  private static getDeviceId(): string {
    const deviceId = MainConfig?.devInfo?.deviceId;
    if (deviceId && deviceId !== "unknown") {
      return deviceId;
    }
    return MainConfig.devInfo.getUniqueId();
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
   * Отримує метадані додатку (URL сайту, Telegram, GitHub тощо)
   * @returns {Promise<any>} Об'єкт з метаданими
   */
  public static async getMetadata(): Promise<any> {
    try {
      const response = await this.callEdge<any>("getMetadata", {}, "GET");
      return response;
    } catch (error: any) {
      Logger.error(
        "ServerApi",
        "Помилка при отриманні метаданих:",
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
    return "";
  }
};

/**
 * Отримує унікальний ID акаунту користувача
 * Використовує локальний deviceId замість серверної реєстрації
 * @deprecated Використовуйте useAniuaUser для повної авторизації
 * @returns {Promise<string>} Унікальний ID пристрою
 */
export const getUniqueAccountId = async (): Promise<string> => {
  try {
    // Використовуємо локальний deviceId
    const deviceId = MainConfig?.devInfo?.deviceId;
    if (deviceId && deviceId !== "unknown") {
      return deviceId;
    }
    return MainConfig.devInfo.getUniqueId();
  } catch (error) {
    Logger.error(
      "getUniqueAccountId",
      "Помилка при отриманні ID пристрою",
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
    Logger.error("getMetadata", "Помилка при отриманні метаданих", error);
    return {};
  }
};

export default ServerApi;
