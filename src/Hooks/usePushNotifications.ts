import { useState, useEffect, useCallback, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { AniuaApi } from "../Api/AniuaApi";
import AniuaAuthStorage from "../Storage/AniuaAuthStorage";
import NotificationsStorage, {
  StoredNotification,
} from "../Storage/NotificationsStorage";
import Logger from "../Logger/Logger";
import { EventBus } from "../Global/EventBus";

/**
 * Результат хуку usePushNotifications
 */
export interface UsePushNotificationsResult {
  /** Expo Push Token */
  token: string | null;
  /** Чи зареєстрований токен на сервері */
  isRegistered: boolean;
  /** Чи йде завантаження */
  isLoading: boolean;
  /** Помилка */
  error: Error | null;
  /** Кількість непрочитаних сповіщень */
  unreadCount: number;
  /** Реєструє токен для push-сповіщень */
  registerForPushNotifications: () => Promise<boolean>;
  /** Підписується на сповіщення для аніме */
  subscribeToAnime: (slug: string) => Promise<boolean>;
  /** Відписується від сповіщень для аніме */
  unsubscribeFromAnime: (slug: string) => Promise<boolean>;
  /** Отримує список slug на які підписано */
  getSubscribedSlugs: () => string[];
  /** Перевіряє чи підписаний на аніме */
  isSubscribedTo: (slug: string) => boolean;
}

/**
 * Конфігурує обробку сповіщень для застосунку
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Хук для роботи з push-сповіщеннями
 *
 * Функціонал:
 * - Реєстрація Expo Push Token
 * - Реєстрація токену на сервері AniuaApi
 * - Підписка/відписка від сповіщень про нові епізоди аніме
 * - Збереження отриманих сповіщень локально
 *
 * @example
 * ```tsx
 * const { registerForPushNotifications, subscribeToAnime } = usePushNotifications();
 *
 * // При старті додатку
 * await registerForPushNotifications();
 *
 * // При додаванні аніме до "Дивлюсь"
 * await subscribeToAnime(anime.slug);
 * ```
 */
export function usePushNotifications(): UsePushNotificationsResult {
  const [token, setToken] = useState<string | null>(
    NotificationsStorage.getPushToken()
  );
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(
    NotificationsStorage.getUnreadCount()
  );

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  /**
   * Оновлює лічильник непрочитаних сповіщень
   */
  const updateUnreadCount = useCallback(() => {
    setUnreadCount(NotificationsStorage.getUnreadCount());
  }, []);

  /**
   * Запитує дозволи та отримує Expo Push Token
   */
  const getExpoPushToken = useCallback(async (): Promise<string | null> => {
    try {
      // Перевіряємо поточні дозволи
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Якщо дозволи не надано, запитуємо
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Logger.warn(
          "usePushNotifications",
          "Дозволи на push-сповіщення не надано"
        );
        return null;
      }

      // Налаштування каналу для Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "AniUA",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      // Отримуємо project ID з конфігурації
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        Logger.warn(
          "usePushNotifications",
          "EAS Project ID не знайдено в конфігурації"
        );
        return null;
      }

      // Отримуємо токен
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      Logger.info(
        "usePushNotifications",
        "Отримано Expo Push Token",
        tokenData.data
      );

      return tokenData.data;
    } catch (err: any) {
      // Перевіряємо чи це помилка Firebase
      if (
        err.message?.includes("FirebaseApp") ||
        err.message?.includes("FCM")
      ) {
        Logger.warn(
          "usePushNotifications",
          "Firebase не налаштовано. Для push-сповіщень потрібно додати google-services.json",
          err.message
        );
      } else {
        Logger.error(
          "usePushNotifications",
          "Помилка отримання push token",
          err
        );
      }
      return null;
    }
  }, []);

  /**
   * Реєструє токен на сервері AniuaApi
   */
  const registerForPushNotifications =
    useCallback(async (): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        // Отримуємо Expo Push Token
        const pushToken = await getExpoPushToken();

        if (!pushToken) {
          // Не кидаємо помилку - просто push-сповіщення не будуть працювати
          Logger.info(
            "usePushNotifications",
            "Push token не отримано - сповіщення вимкнені"
          );
          setIsLoading(false);
          return false;
        }

        setToken(pushToken);
        NotificationsStorage.setPushToken(pushToken);

        // Реєструємо на сервері якщо авторизовані в AniUA
        const aniuaToken = AniuaAuthStorage.getToken();
        if (aniuaToken) {
          const subscribedSlugs = NotificationsStorage.getSubscribedSlugs();

          try {
            await AniuaApi.registerNotificationToken({
              token: pushToken,
              slugs: subscribedSlugs,
            });

            Logger.info(
              "usePushNotifications",
              "Token зареєстровано на сервері",
              { slugs: subscribedSlugs.length }
            );
          } catch (apiErr: any) {
            // Помилка реєстрації на сервері не критична
            Logger.warn(
              "usePushNotifications",
              "Не вдалось зареєструвати token на сервері",
              apiErr.message
            );
          }
        }

        setIsRegistered(true);
        return true;
      } catch (err: any) {
        Logger.error(
          "usePushNotifications",
          "Помилка реєстрації push token",
          err
        );
        setError(err);
        return false;
      } finally {
        setIsLoading(false);
      }
    }, [getExpoPushToken]);

  /**
   * Підписується на сповіщення для аніме
   */
  const subscribeToAnime = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        const pushToken = token || NotificationsStorage.getPushToken();

        if (!pushToken) {
          Logger.warn("usePushNotifications", "Немає push token для підписки");
          return false;
        }

        // Зберігаємо локально
        NotificationsStorage.addSubscribedSlug(slug);

        // Оновлюємо на сервері якщо авторизовані
        const aniuaToken = AniuaAuthStorage.getToken();
        if (aniuaToken) {
          await AniuaApi.updateNotificationSubscription({
            token: pushToken,
            add_slugs: [slug],
          });

          Logger.info(
            "usePushNotifications",
            "Підписано на сповіщення для аніме",
            { slug }
          );
        }

        return true;
      } catch (err: any) {
        Logger.error("usePushNotifications", "Помилка підписки на аніме", err);
        return false;
      }
    },
    [token]
  );

  /**
   * Відписується від сповіщень для аніме
   */
  const unsubscribeFromAnime = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        const pushToken = token || NotificationsStorage.getPushToken();

        if (!pushToken) {
          return false;
        }

        // Видаляємо локально
        NotificationsStorage.removeSubscribedSlug(slug);

        // Оновлюємо на сервері якщо авторизовані
        const aniuaToken = AniuaAuthStorage.getToken();
        if (aniuaToken) {
          await AniuaApi.updateNotificationSubscription({
            token: pushToken,
            remove_slugs: [slug],
          });

          Logger.info(
            "usePushNotifications",
            "Відписано від сповіщень для аніме",
            { slug }
          );
        }

        return true;
      } catch (err: any) {
        Logger.error("usePushNotifications", "Помилка відписки від аніме", err);
        return false;
      }
    },
    [token]
  );

  /**
   * Отримує список slug на які підписано
   */
  const getSubscribedSlugs = useCallback((): string[] => {
    return NotificationsStorage.getSubscribedSlugs();
  }, []);

  /**
   * Перевіряє чи підписаний на аніме
   */
  const isSubscribedTo = useCallback((slug: string): boolean => {
    return NotificationsStorage.isSubscribedToSlug(slug);
  }, []);

  // Налаштовуємо listeners при монтуванні
  useEffect(() => {
    // Listener для отримання сповіщень у foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        Logger.debug(
          "usePushNotifications",
          "Отримано сповіщення",
          notification
        );

        // Зберігаємо сповіщення локально
        const content = notification.request.content;
        NotificationsStorage.addNotification({
          title: content.title || "Нове сповіщення",
          body: content.body || "",
          data: (content.data as StoredNotification["data"]) || {},
        });

        // Оновлюємо лічильник
        updateUnreadCount();

        // Emit event для інших компонентів
        EventBus.emit("notificationReceived", notification);
      });

    // Listener для натискання на сповіщення
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        Logger.debug(
          "usePushNotifications",
          "Натиснуто на сповіщення",
          response
        );

        const data = response.notification.request.content.data;

        // Emit event для навігації до аніме
        if (data?.slug) {
          EventBus.emit("notificationTapped", data);
        }
      });

    // Слухаємо оновлення кількості непрочитаних
    const unsubscribe = EventBus.on("notificationRead", updateUnreadCount);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      unsubscribe();
    };
  }, [updateUnreadCount]);

  return {
    token,
    isRegistered,
    isLoading,
    error,
    unreadCount,
    registerForPushNotifications,
    subscribeToAnime,
    unsubscribeFromAnime,
    getSubscribedSlugs,
    isSubscribedTo,
  };
}

export default usePushNotifications;
