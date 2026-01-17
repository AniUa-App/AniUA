import { Storage } from "./Storage";

/**
 * Інтерфейс збереженого сповіщення
 */
export interface StoredNotification {
  /** Унікальний ідентифікатор сповіщення */
  id: string;
  /** Заголовок сповіщення */
  title: string;
  /** Тіло сповіщення */
  body: string;
  /** Додаткові дані (slug аніме, episode тощо) */
  data: {
    slug?: string;
    episode?: number;
    team?: string;
    type?: string;
    [key: string]: any;
  };
  /** Час отримання (timestamp) */
  receivedAt: number;
  /** Чи прочитане сповіщення */
  read: boolean;
}

/**
 * Storage для зберігання push-сповіщень локально
 * Дозволяє зберігати сповіщення для відображення в NotificationsScreen
 */
class NotificationsStorage extends Storage {
  private readonly NOTIFICATIONS_KEY = "notifications";
  private readonly PUSH_TOKEN_KEY = "push_token";
  private readonly SUBSCRIBED_SLUGS_KEY = "subscribed_slugs";
  private readonly MAX_NOTIFICATIONS = 100;

  /**
   * Додає нове сповіщення до списку
   * @param notification - Сповіщення для додавання
   */
  addNotification(notification: Omit<StoredNotification, "id" | "receivedAt" | "read">): StoredNotification {
    const notifications = this.getNotifications();

    const newNotification: StoredNotification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receivedAt: Date.now(),
      read: false,
    };

    // Додаємо на початок списку
    notifications.unshift(newNotification);

    // Обмежуємо кількість збережених сповіщень
    if (notifications.length > this.MAX_NOTIFICATIONS) {
      notifications.splice(this.MAX_NOTIFICATIONS);
    }

    this.setItem(this.NOTIFICATIONS_KEY, notifications);

    return newNotification;
  }

  /**
   * Отримує список всіх сповіщень
   * @returns Масив сповіщень, відсортований за часом (найновіші першими)
   */
  getNotifications(): StoredNotification[] {
    return this.getItem(this.NOTIFICATIONS_KEY) || [];
  }

  /**
   * Отримує кількість непрочитаних сповіщень
   * @returns Кількість непрочитаних
   */
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter((n) => !n.read).length;
  }

  /**
   * Позначає сповіщення як прочитане
   * @param id - ID сповіщення
   */
  markAsRead(id: string): void {
    const notifications = this.getNotifications();
    const notification = notifications.find((n) => n.id === id);

    if (notification) {
      notification.read = true;
      this.setItem(this.NOTIFICATIONS_KEY, notifications);
    }
  }

  /**
   * Позначає всі сповіщення як прочитані
   */
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach((n) => {
      n.read = true;
    });
    this.setItem(this.NOTIFICATIONS_KEY, notifications);
  }

  /**
   * Видаляє сповіщення за ID
   * @param id - ID сповіщення для видалення
   */
  removeNotification(id: string): void {
    const notifications = this.getNotifications();
    const filtered = notifications.filter((n) => n.id !== id);
    this.setItem(this.NOTIFICATIONS_KEY, filtered);
  }

  /**
   * Очищає всі сповіщення
   */
  clearAll(): void {
    this.removeItem(this.NOTIFICATIONS_KEY);
  }

  /**
   * Зберігає push token пристрою
   * @param token - Expo push token
   */
  setPushToken(token: string): void {
    this.setItem(this.PUSH_TOKEN_KEY, token);
  }

  /**
   * Отримує push token пристрою
   * @returns Token або null
   */
  getPushToken(): string | null {
    return this.getItem(this.PUSH_TOKEN_KEY);
  }

  /**
   * Зберігає список slug аніме на які підписаний користувач
   * @param slugs - Масив slug
   */
  setSubscribedSlugs(slugs: string[]): void {
    this.setItem(this.SUBSCRIBED_SLUGS_KEY, slugs);
  }

  /**
   * Отримує список slug аніме на які підписаний користувач
   * @returns Масив slug
   */
  getSubscribedSlugs(): string[] {
    return this.getItem(this.SUBSCRIBED_SLUGS_KEY) || [];
  }

  /**
   * Додає slug до списку підписок
   * @param slug - Slug аніме
   */
  addSubscribedSlug(slug: string): void {
    const slugs = this.getSubscribedSlugs();
    if (!slugs.includes(slug)) {
      slugs.push(slug);
      this.setSubscribedSlugs(slugs);
    }
  }

  /**
   * Видаляє slug зі списку підписок
   * @param slug - Slug аніме
   */
  removeSubscribedSlug(slug: string): void {
    const slugs = this.getSubscribedSlugs();
    const filtered = slugs.filter((s) => s !== slug);
    this.setSubscribedSlugs(filtered);
  }

  /**
   * Перевіряє чи користувач підписаний на аніме
   * @param slug - Slug аніме
   * @returns true якщо підписаний
   */
  isSubscribedToSlug(slug: string): boolean {
    return this.getSubscribedSlugs().includes(slug);
  }
}

export default new NotificationsStorage();
