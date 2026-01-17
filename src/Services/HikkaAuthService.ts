import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import axios from "axios";
import Constants from "expo-constants";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { AniuaApi } from "../Api/AniuaApi";
import AniuaAuthStorage from "../Storage/AniuaAuthStorage";
import MainConfig from "../cfgs/MainConfig";
import Logger from "../Logger/Logger";
import { EventBus } from "../Global/EventBus";

/**
 * Сервіс для OAuth авторизації через Hikka
 * Реалізує повний OAuth flow згідно з документацією Hikka
 */
export class HikkaAuthService {
  private static readonly OAUTH_URL = "https://hikka.io/oauth";
  private static readonly TOKEN_URL = "https://api.hikka.io/auth/token";
  private static readonly DEFAULT_SCOPES = [
    "read:user-details",
    "update:user-details:email",
    "delete:user-details:image",
    "delete:user-details:cover",
    "update:user-details:username",
    "update:user-details:password",
    "update:user-details:description",
    "read:watchlist",
    "update:watchlist",
    "read:readlist",
    "update:readlist",
    "read:export-list",
    "read:client:list",
    "create:client",
    "read:client",
    "update:client",
    "verify:client",
    "delete:client",
    "read:collection",
    "create:collection",
    "update:collection",
    "delete:collection",
    "create:article",
    "update:article",
    "delete:article",
    "read:articles",
    "read:articles_top",
    "read:comment:score",
    "create:comment",
    "update:comment",
    "delete:comment",
    "create:edit",
    "update:edit",
    "close:edit",
    "accept:edit",
    "deny:edit",
    "read:favourite",
    "create:favourite",
    "delete:favourite",
    "read:favourite:list",
    "read:follow",
    "follow",
    "unfollow",
    "read:history",
    "read:notification",
    "seen:notification",
    "read:vote",
    "set:vote",
    "upload",
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

        Logger.info("HikkaAuthService", "Hikka авторизація успішна");

        // Автоматична реєстрація/вхід в AniUA API
        await this.registerInAniUA(tokenData.secret, tokenData.user);

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
  private static async exchangeToken(requestReference: string): Promise<{
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
   * Автоматична реєстрація/вхід в AniUA API після успішної Hikka авторизації
   * @param hikkaToken - Токен Hikka для X-JWT-Token header
   * @param hikkaUser - Дані користувача Hikka
   */
  private static async registerInAniUA(
    hikkaToken: string,
    hikkaUser: any
  ): Promise<void> {
    try {
      if (!hikkaUser) {
        Logger.warn(
          "HikkaAuthService",
          "Дані Hikka користувача відсутні, пропускаємо реєстрацію в AniUA"
        );
        return;
      }

      const reference = hikkaUser.reference;
      const username = hikkaUser.username;
      const email = hikkaUser.email || `${username}@hikka.io`;

      Logger.debug("HikkaAuthService", "Спроба входу в AniUA", {
        reference,
        username,
        email,
      });

      try {
        // Спочатку пробуємо signin
        const authResponse = await AniuaApi.signin({
          reference,
          username,
          email,
        });

        AniuaAuthStorage.setAuthFromResponse(authResponse.data, {
          reference,
          username,
          email,
          download_version: MainConfig.devInfo.version,
          download_git_hash: MainConfig.devInfo.gitHash,
        });

        Logger.info("HikkaAuthService", "Успішний вхід в AniUA", { reference });
      } catch (signinError: any) {
        // Якщо користувач не існує, реєструємо
        Logger.debug(
          "HikkaAuthService",
          "Користувач не існує в AniUA, реєструємо...",
          {
            reference,
            username,
            email,
            download_version: MainConfig.devInfo.version,
            download_git_hash: MainConfig.devInfo.gitHash,
            signinError: signinError?.message,
            jwtToken: AniuaApi.getJwtToken(),
          }
        );

        const authResponse = await AniuaApi.signup({
          reference,
          username,
          email,
          download_version: MainConfig.devInfo.version,
          download_git_hash: MainConfig.devInfo.gitHash,
        });

        AniuaAuthStorage.setAuthFromResponse(authResponse.data, {
          reference,
          username,
          email,
          download_version: MainConfig.devInfo.version,
          download_git_hash: MainConfig.devInfo.gitHash,
        });

        Logger.info("HikkaAuthService", "Успішна реєстрація в AniUA", {
          reference,
        });
      }

      // Emit event для інших компонентів
      EventBus.emit("aniuaUserUpdated", AniuaAuthStorage.getUser());
    } catch (error) {
      // Помилка реєстрації в AniUA не критична, логуємо та продовжуємо
      Logger.warn("HikkaAuthService", "Помилка реєстрації в AniUA", error);
    }
  }

  /**
   * Вихід з системи
   */
  public static logout() {
    HikkaAuthStorage.clearAuth();
    HikkaApiComplete.clearAuthToken();
    AniuaAuthStorage.clearAuth();

    // Emit event для useAniuaUser та інших компонентів
    EventBus.emit("hikkaLogout");
    EventBus.emit("aniuaUserUpdated", null);

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
      Logger.error(
        "HikkaAuthService",
        "Помилка оновлення даних користувача",
        error
      );
      return null;
    }
  }
}
