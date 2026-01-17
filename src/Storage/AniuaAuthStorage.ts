import { Storage } from "./Storage";
import { AuthResponse } from "../Api/AniuaApi";

/**
 * Дані користувача AniUA
 */
export interface AniuaUserDetails {
  reference: string;
  username: string;
  email: string;
  avatar?: string | null;
  description?: string | null;
  font?: string | null;
  frame?: string | null;
  role?: string;
  created?: string;
  updated?: string;
  payment_date?: string | null;
  push_token?: string | null;
  download_version?: string;
  download_git_hash?: string;
}

/**
 * Storage для зберігання даних авторизації AniUA API
 * Зберігає access token, refresh token, час експірації та дані користувача
 */
class AniuaAuthStorage extends Storage {
  private readonly AUTH_TOKEN_KEY = "aniua_auth_token";
  private readonly REFRESH_TOKEN_KEY = "aniua_refresh_token";
  private readonly AUTH_USER_KEY = "aniua_auth_user";
  private readonly AUTH_EXPIRATION_KEY = "aniua_auth_expiration";

  /**
   * Зберігає дані авторизації з AuthResponse
   * @param authResponse - Відповідь від signin/signup endpoint
   * @param user - Дані користувача (опціонально)
   */
  setAuthFromResponse(authResponse: AuthResponse, user?: AniuaUserDetails) {
    this.setItem(this.AUTH_TOKEN_KEY, authResponse.access_token);
    this.setItem(this.REFRESH_TOKEN_KEY, authResponse.refresh_token);
    // expires_at вже в timestamp форматі (секунди)
    this.setItem(this.AUTH_EXPIRATION_KEY, authResponse.expires_at * 1000);
    if (user) {
      this.setItem(this.AUTH_USER_KEY, user);
    }
  }

  /**
   * Зберігає дані авторизації вручну
   * @param accessToken - Токен доступу
   * @param refreshToken - Refresh токен
   * @param expiresAt - Timestamp експірації (в мілісекундах)
   * @param user - Дані користувача (опціонально)
   */
  setAuthData(
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
    user?: AniuaUserDetails
  ) {
    this.setItem(this.AUTH_TOKEN_KEY, accessToken);
    this.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.setItem(this.AUTH_EXPIRATION_KEY, expiresAt);
    if (user) {
      this.setItem(this.AUTH_USER_KEY, user);
    }
  }

  /**
   * Отримує access token
   * @returns Токен або null якщо не знайдено або протермінований
   */
  getToken(): string | null {
    const token = this.getItem(this.AUTH_TOKEN_KEY);
    const expiration = this.getItem(this.AUTH_EXPIRATION_KEY);

    if (!token || !expiration) {
      return null;
    }

    // Перевіряємо чи не протермінований токен
    if (Date.now() >= expiration) {
      // Не очищаємо тут, бо можемо використати refresh token
      return null;
    }

    return token;
  }

  /**
   * Отримує refresh token
   * @returns Refresh токен або null
   */
  getRefreshToken(): string | null {
    return this.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Отримує дані користувача
   * @returns Об'єкт користувача або null
   */
  getUser(): AniuaUserDetails | null {
    return this.getItem(this.AUTH_USER_KEY);
  }

  /**
   * Оновлює дані користувача
   * @param user - Нові дані користувача
   */
  setUser(user: AniuaUserDetails) {
    this.setItem(this.AUTH_USER_KEY, user);
  }

  /**
   * Перевіряє чи користувач авторизований
   * Токен вважається валідним якщо він існує і не протермінований,
   * АБО якщо існує refresh token
   * @returns true якщо авторизований
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (token) return true;

    // Якщо access token протермінований, перевіряємо наявність refresh token
    const refreshToken = this.getRefreshToken();
    return refreshToken !== null;
  }

  /**
   * Перевіряє чи потрібно оновити токен
   * @returns true якщо access token протермінований але є refresh token
   */
  needsRefresh(): boolean {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    return token === null && refreshToken !== null;
  }

  /**
   * Очищає всі дані авторизації
   */
  clearAuth() {
    this.removeItem(this.AUTH_TOKEN_KEY);
    this.removeItem(this.REFRESH_TOKEN_KEY);
    this.removeItem(this.AUTH_USER_KEY);
    this.removeItem(this.AUTH_EXPIRATION_KEY);
  }

  /**
   * Отримує час до експірації токену в мілісекундах
   * @returns Кількість мс до експірації або 0 якщо токен відсутній
   */
  getTimeUntilExpiration(): number {
    const expiration = this.getItem(this.AUTH_EXPIRATION_KEY);
    if (!expiration) {
      return 0;
    }
    return Math.max(0, expiration - Date.now());
  }

  /**
   * Перевіряє чи токен скоро протермінується (менше 5 хвилин)
   * @returns true якщо токен скоро протермінується
   */
  isTokenExpiringSoon(): boolean {
    const timeUntilExpiration = this.getTimeUntilExpiration();
    return timeUntilExpiration > 0 && timeUntilExpiration < 5 * 60 * 1000;
  }
}

export default new AniuaAuthStorage();
