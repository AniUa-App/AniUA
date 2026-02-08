import { useState, useEffect, useCallback } from "react";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import Logger from "../Logger/Logger";
import { EventBus } from "../Global/EventBus";

export interface WatchStats {
  planned: number;
  watching: number;
  completed: number;
  on_hold: number;
  dropped: number;
}

export interface HikkaUser {
  reference: string;
  username: string;
  description: string | null;
  avatar: string | null;
  cover: string | null;
  created: number;
  role: string;
  active: boolean;
  is_followed: boolean | null;
  updated: number;
}

interface UseHikkaUserResult {
  user: HikkaUser | null;
  stats: WatchStats | null;
  favorites: any[];
  history: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  login: () => Promise<boolean>;
  logout: () => void;
}

/**
 * Хук для роботи з даними користувача Hikka
 * @returns {UseHikkaUserResult} - Дані користувача, статистика, стан завантаження та методи
 */
export function useHikkaUser(): UseHikkaUserResult {
  const [user, setUser] = useState<HikkaUser | null>(null);
  const [stats, setStats] = useState<WatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const isAuth = HikkaAuthService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (!isAuth) {
        setUser(null);
        setStats(null);
        setIsLoading(false);
        return;
      }

      // Отримуємо дані користувача
      const userData = await HikkaApiComplete.getCurrentUser();
      setUser(userData);

      // Отримуємо статистику перегляду
      if (userData?.username) {
        try {
          const watchStats = await HikkaApiComplete.getWatchStats(
            userData.username
          );
          setStats(watchStats);

          // Отримуємо кількість улюблених
          const favoritesData = await HikkaApiComplete.getUserFavorites(
            "anime",
            userData.username,
            { page: 1, size: 1 }
          );
          setFavorites(favoritesData);

          // Отримуємо історію перегляду
          const historyData = await HikkaApiComplete.getUserHistory(
            userData.username,
            { page: 1, size: 100 }
          );
          setHistory(historyData);
        } catch (statsError) {
          Logger.warn(
            "useHikkaUser",
            "Не вдалося завантажити статистику",
            statsError
          );
        }
      }
    } catch (err: any) {
      Logger.error(
        "useHikkaUser",
        "Помилка завантаження даних користувача",
        {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
        }
      );
      setError(err);
      setUser(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    try {
      const result = await HikkaAuthService.startOAuth();
      if (result.success) {
        await fetchUserData();
        return true;
      }
      return false;
    } catch (err: any) {
      Logger.error("useHikkaUser", "Помилка авторизації", err);
      setError(err);
      return false;
    }
  }, [fetchUserData]);

  const logout = useCallback(() => {
    HikkaAuthService.logout();
    setUser(null);
    setStats(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = EventBus.on("favoritesUpdated", () => {
      fetchUserData();
    });
    return unsubscribe;
  }, [fetchUserData]);

  return {
    user,
    stats,
    favorites,
    history,
    isLoading,
    isAuthenticated,
    error,
    refetch: fetchUserData,
    login,
    logout,
  };
}

export default useHikkaUser;
