import { Storage } from "./Storage";

/**
 * Storage для зберігання даних авторизації Hikka OAuth
 * Зберігає токен доступу, час створення та експірації
 */
class HikkaAuthStorage extends Storage {
  private readonly AUTH_TOKEN_KEY = "hikka_auth_token";
  private readonly AUTH_USER_KEY = "hikka_auth_user";
  private readonly AUTH_EXPIRATION_KEY = "hikka_auth_expiration";

  /**
   * Зберігає дані авторизації
   * @param token - Токен доступу
   * @param expiration - Час дії токену в секундах
   * @param user - Дані користувача (опціонально)
   */
  setAuthData(token: string, expiration: number, user?: any) {
    this.setItem(this.AUTH_TOKEN_KEY, token);
    this.setItem(this.AUTH_EXPIRATION_KEY, Date.now() + expiration * 1000);
    if (user) {
      this.setItem(this.AUTH_USER_KEY, user);
    }
  }

  /**
   * Отримує токен доступу
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
      this.clearAuth();
      return null;
    }

    return token;
  }

  /**
   * Отримує дані користувача
   * @returns Об'єкт користувача або null
   */
  getUser(): any | null {
    return this.getItem(this.AUTH_USER_KEY);
  }

  /**
   * Перевіряє чи користувач авторизований
   * @returns true якщо токен існує і не протермінований
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Оновлює час експірації токену (продовжує дію на 30 хвилин)
   */
  extendTokenExpiration() {
    const token = this.getItem(this.AUTH_TOKEN_KEY);
    if (token) {
      // Продовжуємо на 30 хвилин (як вказано в документації)
      this.setItem(this.AUTH_EXPIRATION_KEY, Date.now() + 30 * 60 * 1000);
    }
  }

  /**
   * Очищає всі дані авторизації
   */
  clearAuth() {
    this.removeItem(this.AUTH_TOKEN_KEY);
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
}

export default new HikkaAuthStorage();
