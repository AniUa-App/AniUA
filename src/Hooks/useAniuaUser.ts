import { useState, useEffect, useCallback } from "react";
import { AniuaApi, UpdateUserDetails } from "../Api/AniuaApi";
import AniuaAuthStorage, {
  AniuaUserDetails,
} from "../Storage/AniuaAuthStorage";
import { AniuaAuthService } from "../Services/AniuaAuthService";
import Logger from "../Logger/Logger";
import { EventBus } from "../Global/EventBus";

/**
 * Інтерфейс результату хуку useAniuaUser
 */
export interface UseAniuaUserResult {
  /** Дані користувача AniUA */
  user: AniuaUserDetails | null;
  /** Стан завантаження */
  isLoading: boolean;
  /** Чи користувач авторизований */
  isAuthenticated: boolean;
  /** Помилка */
  error: Error | null;
  /**
   * Виконує вхід в AniUA API використовуючи дані з Hikka
   * Автоматично реєструє користувача якщо він не існує
   */
  signinWithHikka: () => Promise<boolean>;
  /**
   * Виконує вихід з AniUA
   */
  logout: () => void;
  /**
   * Оновлює дані профілю користувача
   */
  updateProfile: (data: UpdateUserDetails) => Promise<boolean>;
  /**
   * Перезавантажує дані користувача
   */
  refetch: () => Promise<void>;
  /**
   * Отримує поточний access token
   */
  getToken: () => string | null;
}

/**
 * Хук для роботи з користувачем AniUA API
 *
 * Автоматично синхронізується з Hikka OAuth:
 * - При успішному вході в Hikka, автоматично входить/реєструє в AniUA
 * - Зберігає токени в AniuaAuthStorage
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, signinWithHikka } = useAniuaUser();
 *
 * // Після успішного Hikka OAuth
 * await signinWithHikka();
 * ```
 */
export function useAniuaUser(): UseAniuaUserResult {
  const [user, setUser] = useState<AniuaUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Завантажує дані користувача зі Storage
   */
  const loadUserFromStorage = useCallback(() => {
    try {
      const isAuth = AniuaAuthStorage.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const storedUser = AniuaAuthStorage.getUser();
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      Logger.error("useAniuaUser", "Помилка завантаження зі Storage", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Виконує вхід в AniUA API використовуючи дані з Hikka
   * Використовує AniuaAuthService для автоматичного signin/signup
   */
  const signinWithHikka = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Використовуємо сервіс для оновлення авторизації
      const result = await AniuaAuthService.refresh();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);

        Logger.info("useAniuaUser", "Успішний вхід в AniUA", {
          reference: result.user.reference,
          isNewUser: result.isNewUser,
          usedCachedTokens: result.usedCachedTokens,
        });

        return true;
      }

      throw new Error(result.error || "Не вдалось увійти в AniUA");
    } catch (err: any) {
      Logger.error("useAniuaUser", "Помилка входу в AniUA", err);
      setError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Виконує вихід з AniUA
   */
  const logout = useCallback(() => {
    AniuaAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    Logger.info("useAniuaUser", "Вихід з AniUA");
  }, []);

  /**
   * Оновлює профіль користувача
   */
  const updateProfile = useCallback(
    async (data: UpdateUserDetails): Promise<boolean> => {
      try {
        if (!AniuaAuthService.isAuthenticated()) {
          throw new Error("Користувач не авторизований");
        }

        await AniuaApi.updateUserDetails(data);

        // Оновлюємо локальні дані
        const currentUser = AniuaAuthStorage.getUser();
        if (currentUser) {
          const updatedUser: AniuaUserDetails = {
            ...currentUser,
            ...data,
          };
          AniuaAuthStorage.setUser(updatedUser);
          setUser(updatedUser);
        }

        EventBus.emit("aniuaUserUpdated", user);

        Logger.info("useAniuaUser", "Профіль оновлено");
        return true;
      } catch (err: any) {
        Logger.error("useAniuaUser", "Помилка оновлення профілю", err);
        setError(err);
        return false;
      }
    },
    [user]
  );

  /**
   * Перезавантажує дані користувача
   */
  const refetch = useCallback(async () => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  /**
   * Отримує поточний access token
   */
  const getToken = useCallback((): string | null => {
    return AniuaAuthStorage.getToken();
  }, []);

  // Завантажуємо дані при ініціалізації
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Слухаємо зміни авторизації Hikka
  useEffect(() => {
    const unsubscribeHikkaLogout = EventBus.on("hikkaLogout", () => {
      // При виході з Hikka, також виходимо з AniUA
      logout();
    });

    return () => {
      unsubscribeHikkaLogout();
    };
  }, [logout]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signinWithHikka,
    logout,
    updateProfile,
    refetch,
    getToken,
  };
}

export default useAniuaUser;
