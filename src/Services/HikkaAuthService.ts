import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import Constants from "expo-constants";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import Logger from "../Logger/Logger";

/**
 * Сервіс для OAuth авторизації через Hikka
 * Реалізує повний OAuth flow згідно з документацією Hikka
 */
export class HikkaAuthService {
  private static readonly OAUTH_URL = "https://hikka.io/oauth";
  private static readonly TOKEN_URL = "https://api.hikka.io/auth/token";
  private static readonly DEFAULT_SCOPES = [
    "read",
    "write",
    "comments:write",
    "follow:write",
    "favourite:write",
    "watch:write",
    "read:write",
  ];

  /**
   * Отримує client ID з конфігурації
   */
  private static getClientId(): string {
    const clientId = Constants.expoConfig?.extra?.hikkaClientId;
    if (!clientId) {
      throw new Error(
        "HIKKA_CLIENT_ID не знайдено. Додайте EXPO_PUBLIC_HIKKA_CLIENT_ID до .env.local"
      );
    }
    return clientId;
  }

  /**
   * Отримує client secret з конфігурації
   */
  private static getClientSecret(): string {
    const clientSecret = Constants.expoConfig?.extra?.hikkaClientSecret;
    if (!clientSecret) {
      throw new Error(
        "HIKKA_CLIENT_SECRET не знайдено. Додайте HIKKA_CLIENT_SECRET до .env.local"
      );
    }
    return clientSecret;
  }

  /**
   * Отримує redirect URL з конфігурації
   */
  private static getRedirectUrl(): string {
    const redirectUrl = Constants.expoConfig?.extra?.hikkaRedirectUrl;
    if (!redirectUrl) {
      throw new Error(
        "HIKKA_REDIRECT_URL не знайдено. Додайте EXPO_PUBLIC_HIKKA_REDIRECT_URL до .env.local"
      );
    }
    return redirectUrl;
  }

  /**
   * Ініціює процес OAuth авторизації
   * @param scopes - Список дозволів (за замовчуванням: read, write, etc.)
   * @returns Promise з результатом авторизації
   */
  public static async startOAuth(
    scopes: string[] = HikkaAuthService.DEFAULT_SCOPES
  ): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    error?: string;
  }> {
    try {
      const clientId = this.getClientId();
      const scopesParam = scopes.join(",");

      // Формуємо URL для OAuth
      const authUrl = `${this.OAUTH_URL}?reference=${clientId}&scope=${scopesParam}`;

      Logger.debug("HikkaAuthService", "Початок OAuth flow", authUrl);

      // Відкриваємо браузер для авторизації
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.getRedirectUrl()
      );

      if (result.type === "success" && result.url) {
        Logger.debug("HikkaAuthService", "OAuth callback отримано", result.url);

        // Парсимо URL callback
        const { queryParams } = Linking.parse(result.url);
        const requestReference = queryParams?.reference as string;

        if (!requestReference) {
          throw new Error("Request reference не знайдено в callback URL");
        }

        // Обмінюємо reference на токен
        const tokenData = await this.exchangeToken(requestReference);

        // Зберігаємо токен
        HikkaAuthStorage.setAuthData(
          tokenData.secret,
          tokenData.expiration,
          tokenData.user
        );

        // Встановлюємо токен в API клієнт
        HikkaApiComplete.setAuthToken(tokenData.secret);

        Logger.info("HikkaAuthService", "Авторизація успішна");

        return {
          success: true,
          token: tokenData.secret,
          user: tokenData.user,
        };
      } else if (result.type === "cancel") {
        Logger.info("HikkaAuthService", "Авторизація скасована користувачем");
        return {
          success: false,
          error: "Авторизація скасована",
        };
      } else {
        Logger.error("HikkaAuthService", "Невідомий результат OAuth", result);
        return {
          success: false,
          error: "Невідома помилка при авторизації",
        };
      }
    } catch (error: any) {
      Logger.error("HikkaAuthService", "Помилка OAuth", error);
      return {
        success: false,
        error: error.message || "Помилка при авторизації",
      };
    }
  }

  /**
   * Обмінює request reference на access token
   * @param requestReference - Референс з callback URL
   * @returns Дані токену
   */
  private static async exchangeToken(
    requestReference: string
  ): Promise<{
    secret: string;
    created: number;
    expiration: number;
    user?: any;
  }> {
    try {
      Logger.debug(
        "HikkaAuthService",
        "Обмін reference на токен",
        requestReference
      );

      const response = await axios.post(this.TOKEN_URL, {
        request_reference: requestReference,
        client_secret: this.getClientSecret(),
      });

      // Отримуємо дані користувача
      let userData = null;
      if (response.data.secret) {
        try {
          // Тимчасово встановлюємо токен для запиту
          const tempClient = axios.create({
            headers: {
              Auth: response.data.secret,
            },
          });
          const userResponse = await tempClient.get(
            "https://api.hikka.io/user/me"
          );
          userData = userResponse.data;
        } catch (error) {
          Logger.error(
            "HikkaAuthService",
            "Помилка отримання даних користувача",
            error
          );
        }
      }

      return {
        secret: response.data.secret,
        created: response.data.created,
        expiration: response.data.expiration,
        user: userData,
      };
    } catch (error: any) {
      Logger.error("HikkaAuthService", "Помилка обміну токену", error);
      throw new Error(
        error.response?.data?.message || "Помилка отримання токену"
      );
    }
  }

  /**
   * Вихід з системи
   */
  public static logout() {
    HikkaAuthStorage.clearAuth();
    HikkaApiComplete.clearAuthToken();
    Logger.info("HikkaAuthService", "Вихід виконано");
  }

  /**
   * Ініціалізує сервіс при запуску додатку
   * Автоматично встановлює токен в API клієнт якщо він існує
   */
  public static initialize() {
    const token = HikkaAuthStorage.getToken();
    if (token) {
      HikkaApiComplete.setAuthToken(token);
      Logger.info("HikkaAuthService", "Токен відновлено зі storage");
    }
  }

  /**
   * Перевіряє чи користувач авторизований
   */
  public static isAuthenticated(): boolean {
    return HikkaAuthStorage.isAuthenticated();
  }

  /**
   * Отримує дані поточного користувача
   */
  public static getCurrentUser(): any | null {
    return HikkaAuthStorage.getUser();
  }

  /**
   * Оновлює дані користувача
   */
  public static async refreshUserData(): Promise<any | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const userData = await HikkaApiComplete.getCurrentUser();
      const token = HikkaAuthStorage.getToken();
      const expiration = HikkaAuthStorage.getTimeUntilExpiration() / 1000;

      if (token) {
        HikkaAuthStorage.setAuthData(token, expiration, userData);
      }

      return userData;
    } catch (error) {
      Logger.error("HikkaAuthService", "Помилка оновлення даних користувача", error);
      return null;
    }
  }
}
