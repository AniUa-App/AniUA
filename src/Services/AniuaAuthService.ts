import { AniuaApi, AuthResponse, ApiResponse } from "../Api/AniuaApi";
import AniuaAuthStorage, {
  AniuaUserDetails,
} from "../Storage/AniuaAuthStorage";
import { HikkaAuthService } from "./HikkaAuthService";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import MainConfig from "../cfgs/MainConfig";
import Logger from "../Logger/Logger";
import { EventBus } from "../Global/EventBus";
import AnalyticsService from "./AnalyticsService";

/**
 * Результат ініціалізації авторизації
 */
export interface AniuaAuthInitResult {
  success: boolean;
  isNewUser: boolean;
  user: AniuaUserDetails | null;
  error?: string;
  usedCachedTokens: boolean;
}

/**
 * Сервіс автентифікації AniUA
 *
 * Автоматично виконує вхід при запуску застосунку:
 * 1. Перевіряє наявність авторизації Hikka
 * 2. Якщо є - виконує signin/signup в AniUA
 * 3. Якщо не вдалось - використовує збережені токени
 */
export class AniuaAuthService {
  private static isInitialized = false;
  private static initPromise: Promise<AniuaAuthInitResult> | null = null;

  /**
   * Ініціалізує авторизацію при запуску застосунку
   * Викликати один раз в App.jsx
   */
  public static async initialize(): Promise<AniuaAuthInitResult> {
    // Запобігаємо повторній ініціалізації
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  /**
   * Внутрішня логіка ініціалізації
   */
  private static async performInitialization(): Promise<AniuaAuthInitResult> {
    Logger.info("AniuaAuthService", "Початок ініціалізації авторизації");

    try {
      // Перевіряємо чи є авторизація в Hikka
      const isHikkaAuth = HikkaAuthService.isAuthenticated();

      if (!isHikkaAuth) {
        Logger.info(
          "AniuaAuthService",
          "Немає авторизації Hikka, використовуємо збережені токени"
        );
        return this.useCachedTokens();
      }

      // Отримуємо дані з Hikka
      const hikkaUser = HikkaAuthStorage.getUser();
      if (!hikkaUser) {
        Logger.warn(
          "AniuaAuthService",
          "Дані Hikka користувача не знайдено, використовуємо кеш"
        );
        return this.useCachedTokens();
      }

      // Формуємо дані для AniUA
      const reference = hikkaUser.reference;
      const username = hikkaUser.username;
      const email = hikkaUser.email || `${username}@hikka.io`;

      // Спочатку пробуємо signin
      const signinResult = await this.trySignin({ reference, username, email });

      if (signinResult.success) {
        this.isInitialized = true;
        return signinResult;
      }

      // Якщо signin не вдався (користувач не існує), пробуємо signup
      const signupResult = await this.trySignup({
        reference,
        username,
        email,
        download_version: MainConfig.devInfo.version,
        download_git_hash: MainConfig.devInfo.gitHash,
      });

      if (signupResult.success) {
        this.isInitialized = true;
        return signupResult;
      }

      // Якщо і signup не вдався, використовуємо кешовані токени
      Logger.warn(
        "AniuaAuthService",
        "Signin та signup не вдались, використовуємо кеш",
        signupResult.error
      );
      return this.useCachedTokens();
    } catch (error: any) {
      Logger.error("AniuaAuthService", "Помилка ініціалізації", error);
      return this.useCachedTokens();
    }
  }

  /**
   * Спроба входу
   */
  private static async trySignin(payload: {
    reference: string;
    username: string;
    email: string;
  }): Promise<AniuaAuthInitResult> {
    try {
      const response = await AniuaApi.signin(payload);

      if (response.success && response.data.access_token) {
        const userDetails = this.saveAuthResponse(response.data, payload);

        Logger.info("AniuaAuthService", "Успішний вхід в AniUA", {
          reference: payload.reference,
        });

        AnalyticsService.logLogin("hikka");

        return {
          success: true,
          isNewUser: false,
          user: userDetails,
          usedCachedTokens: false,
        };
      }

      // Повертаємо помилку для подальшої обробки
      return {
        success: false,
        isNewUser: false,
        user: null,
        error: response.error?.message || "Невідома помилка signin",
        usedCachedTokens: false,
      };
    } catch (error: any) {
      return {
        success: false,
        isNewUser: false,
        user: null,
        error: error.message,
        usedCachedTokens: false,
      };
    }
  }

  /**
   * Спроба реєстрації
   */
  private static async trySignup(payload: {
    reference: string;
    username: string;
    email: string;
    download_version: string;
    download_git_hash: string;
  }): Promise<AniuaAuthInitResult> {
    try {
      const response = await AniuaApi.signup(payload);

      if (response.success && response.data.access_token) {
        const userDetails = this.saveAuthResponse(response.data, payload);

        Logger.info("AniuaAuthService", "Успішна реєстрація в AniUA", {
          reference: payload.reference,
        });

        AnalyticsService.logSignUp();

        return {
          success: true,
          isNewUser: true,
          user: userDetails,
          usedCachedTokens: false,
        };
      }

      return {
        success: false,
        isNewUser: false,
        user: null,
        error: response.error?.message || "Невідома помилка signup",
        usedCachedTokens: false,
      };
    } catch (error: any) {
      return {
        success: false,
        isNewUser: false,
        user: null,
        error: error.message,
        usedCachedTokens: false,
      };
    }
  }

  /**
   * Зберігає відповідь авторизації
   */
  private static saveAuthResponse(
    authResponse: AuthResponse,
    userData: { reference: string; username: string; email: string }
  ): AniuaUserDetails {
    const userDetails: AniuaUserDetails = {
      reference: userData.reference,
      username: userData.username,
      email: userData.email,
      download_version: MainConfig.devInfo.version,
      download_git_hash: MainConfig.devInfo.gitHash,
    };

    AniuaAuthStorage.setAuthFromResponse(authResponse, userDetails);

    // Оповіщаємо про оновлення користувача
    EventBus.emit("aniuaUserUpdated", userDetails);

    return userDetails;
  }

  /**
   * Використовує збережені токени якщо вони є
   */
  private static useCachedTokens(): AniuaAuthInitResult {
    const isAuth = AniuaAuthStorage.isAuthenticated();
    const user = AniuaAuthStorage.getUser();

    if (isAuth && user) {
      Logger.info(
        "AniuaAuthService",
        "Використовуємо кешовані токени для користувача",
        { reference: user.reference }
      );

      // Встановлюємо authHeader в AniuaApi якщо токен валідний
      const token = AniuaAuthStorage.getToken();
      if (token) {
        AniuaApi.setAuthHeader(`Bearer ${token}`);
      }

      this.isInitialized = true;

      return {
        success: true,
        isNewUser: false,
        user,
        usedCachedTokens: true,
      };
    }

    Logger.info(
      "AniuaAuthService",
      "Немає кешованих токенів, користувач не авторизований"
    );

    this.isInitialized = true;

    return {
      success: false,
      isNewUser: false,
      user: null,
      error: "Немає збережених токенів",
      usedCachedTokens: true,
    };
  }

  /**
   * Перевіряє чи сервіс ініціалізований
   */
  public static getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Перевіряє чи користувач авторизований
   */
  public static isAuthenticated(): boolean {
    return AniuaAuthStorage.isAuthenticated();
  }

  /**
   * Отримує поточного користувача
   */
  public static getUser(): AniuaUserDetails | null {
    return AniuaAuthStorage.getUser();
  }

  /**
   * Виконує вихід
   */
  public static logout(): void {
    AniuaAuthStorage.clearAuth();
    AniuaApi.setAuthHeader(undefined);
    EventBus.emit("aniuaUserUpdated", null);
    Logger.info("AniuaAuthService", "Вихід з AniUA");
  }

  /**
   * Примусово оновлює авторизацію (наприклад, після входу в Hikka)
   */
  public static async refresh(): Promise<AniuaAuthInitResult> {
    this.initPromise = null;
    return this.initialize();
  }
}

export default AniuaAuthService;
