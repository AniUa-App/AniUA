import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";

interface ApiResponse<T = any> {
  [key: string]: T;
}

class ServerApi {
  private static readonly BASE_URL = MainConfig.api.url;
  private static readonly API_KEY = MainConfig.api.key;
  private static readonly REQUEST_TIMEOUT = 100000; // 100 секунд

  private static uniqueAccountId = MainConfig.devInfo.uniqueAccountId;
  private static cachedDeviceId: string | undefined;

  /**
   * Отримує унікальний ID пристрою
   */
  private static async getUserId(): Promise<string> {
    // Якщо є закешований валідний ID
    if (this.isValidDeviceId(this.cachedDeviceId)) {
      return this.cachedDeviceId!;
    }

    // Якщо є ID у конфігурації
    if (this.isValidDeviceId(MainConfig?.devInfo?.deviceId)) {
      this.cachedDeviceId = MainConfig.devInfo.deviceId;
      return this.cachedDeviceId!;
    }

    // Генеруємо новий ID
    const newDeviceId = MainConfig.devInfo.getUniqueId();
    MainConfig.devInfo.deviceId = newDeviceId;
    this.cachedDeviceId = newDeviceId;

    console.log(`Згенеровано новий device ID: ${newDeviceId}`);
    return newDeviceId;
  }

  /**
   * Перевіряє чи є ID пристрою валідним
   */
  private static isValidDeviceId(deviceId: string | undefined): boolean {
    return !!(deviceId && deviceId !== "unknown");
  }

  /**
   * Отримує заголовки для запитів
   */
  private static getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Key: this.API_KEY,
    };
  }

  /**
   * Виконує HTTP запит до API
   */
  private static async callEdge<T = any>(
    endpoint: string,
    payload: Record<string, any>,
    method: string = "POST"
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const controller = new AbortController();

    try {
      console.log(`Виконується запит до API: ${this.BASE_URL}`);
      // Встановлюємо таймаут для запиту
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

      // Only attach a body when the method supports it
      if (method !== "GET" && method !== "HEAD") {
        fetchOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      // Логування часу виконання запиту
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️ API запит "${endpoint}" виконано за ${executionTime}с`);

      // Детальне логування відповіді (тільки в debug режимі)
      this.logResponseDetails(endpoint, response);

      // Обробка відповіді
      return await this.parseResponse<T>(response);
    } catch (error: any) {
      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(
        `⚠️ Помилка API запиту "${endpoint}" за ${executionTime}с:`,
        error?.message || error
      );
      throw error;
    } finally {
      // Завжди скасовуємо запит для очищення ресурсів
      controller.abort();
    }
  }

  /**
   * Логує деталі відповіді від сервера
   */
  private static logResponseDetails(
    endpoint: string,
    response: Response
  ): void {
    try {
      const headers = response.headers;
      const getHeader = (key: string) =>
        headers.get(key) || headers.get(key.toUpperCase()) || "-";

      console.log(
        `${endpoint} → Статус: ${response.status}`,
        `| cf-ray: ${getHeader("cf-ray")}`,
        `| server-timing: ${getHeader("server-timing")}`,
        `| cache-status: ${getHeader("cf-cache-status")}`,
        `| content-length: ${getHeader("content-length")}`
      );
    } catch (error) {
      // Ігноруємо помилки логування
    }
  }

  /**
   * Парсить відповідь від сервера
   */
  private static async parseResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    try {
      const text = await response.text();
      if (!text) {
        return {} as ApiResponse<T>;
      }
      console.log("API відповідь:", text);
      return JSON.parse(text) as ApiResponse<T>;
    } catch (error) {
      console.warn(
        "Не вдалося розпарсити JSON відповідь, повертаємо порожній об'єкт"
      );
      return {} as ApiResponse<T>;
    }
  }

  /**
   * Перевіряє чи є користувач зареєстрованим
   */
  public static async isUser(): Promise<boolean> {
    try {
      const userId = await this.getUserId();
      console.log("Перевірка користувача:", userId, MainConfig.devInfo.version);
      const response = await this.callEdge<{ isUser?: boolean }>("isUser", {
        unique_device_id: userId,
        user_version: MainConfig.devInfo.version,
      });

      console.log("Результат перевірки користувача:", response);
      return !!response?.exists;
    } catch (error: any) {
      console.error(
        "Помилка при перевірці користувача:",
        error?.message || error
      );
      return false;
    }
  }

  /**
   * Отримує унікальний ID акаунту користувача
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
      console.error(
        "Помилка при отриманні ID акаунту:",
        error?.message || error
      );
      return "";
    }
  }

  /**
   * Реєструє нового користувача
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
      console.log("Зареєстровано нового користувача з ID:", accountId);
      return accountId as string;
    } catch (error: any) {
      console.error(
        "Помилка при реєстрації нового користувача:",
        error?.message || error
      );
      return "";
    }
  }
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
      console.error("Помилка при відправці відгуку:", error?.message || error);
      return false;
    }
  }
  public static async getMetadata(): Promise<any> {
    try {
      // Use POST to be consistent with other endpoints and avoid GET body restrictions
      const response = await this.callEdge<any>("getMetadata", {}, "GET");

      return response;
    } catch (error: any) {
      console.error(
        "Помилка при отриманні метаданів:",
        error?.message || error
      );
      return {};
    }
  }
}

export const getUniqueAccountId = async (): Promise<string> => {
  try {
    const isExistingUser = await ServerApi.isUser();

    if (isExistingUser) {
      console.log("Користувач існує, отримуємо ID акаунту");
      return await ServerApi.getUniqueAccountId();
    } else {
      console.log("Користувач не існує, реєструємо нового");
      return await ServerApi.newUser();
    }
  } catch (error) {
    console.error("Помилка при отриманні унікального ID акаунту:", error);
    return "";
  }
};

export const getMetadata = async (): Promise<any> => {
  try {
    const response = await ServerApi.getMetadata();
    return response;
  } catch (error) {
    console.error("Помилка при отриманні метаданів:", error);
    return {};
  }
};

export default ServerApi;
