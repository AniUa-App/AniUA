import { Storage } from "./Storage";

/**
 * Персистентний кеш для епізодів аніме.
 * Зберігає епізоди в MMKV з TTL 10 хвилин.
 * Дані зберігаються навіть після перезапуску застосунку.
 */
class EpisodesCacheStorage extends Storage {
  storageKey = "episodesCache";
  // TTL 10 хвилин
  cacheTtl = 10 * 60 * 1000;

  constructor() {
    super();
  }

  /**
   * Отримує весь кеш
   */
  getCache() {
    return this.getItem(this.storageKey, {});
  }

  /**
   * Зберігає весь кеш
   */
  setCache(cache = {}) {
    this.setItem(this.storageKey, cache);
  }

  /**
   * Перевіряє чи кеш для ключа ще валідний
   * @param {string} key - Ключ кешу (наприклад slug аніме)
   * @returns {boolean}
   */
  isCacheValid(key) {
    const cache = this.getCache();
    const entry = cache[key];
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.cacheTtl;
  }

  /**
   * Отримує дані з кешу якщо вони валідні
   * @param {string} key - Ключ кешу
   * @returns {any | null} - Дані або null якщо кеш невалідний
   */
  get(key) {
    const cache = this.getCache();
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp >= this.cacheTtl) {
      // Кеш застарів - видаляємо
      this.remove(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Зберігає дані в кеш
   * @param {string} key - Ключ кешу
   * @param {any} data - Дані для збереження
   */
  set(key, data) {
    const cache = this.getCache();
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    this.setCache(cache);
  }

  /**
   * Видаляє запис з кешу
   * @param {string} key - Ключ кешу
   */
  remove(key) {
    const cache = this.getCache();
    delete cache[key];
    this.setCache(cache);
  }

  /**
   * Очищає весь кеш епізодів
   */
  clearAll() {
    this.setCache({});
  }

  /**
   * Очищає застарілі записи з кешу
   * Викликати при старті застосунку для очищення старих даних
   */
  cleanupExpired() {
    const cache = this.getCache();
    const now = Date.now();
    let hasChanges = false;

    Object.keys(cache).forEach((key) => {
      if (now - cache[key].timestamp >= this.cacheTtl) {
        delete cache[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.setCache(cache);
    }
  }

  /**
   * Повертає кількість записів в кеші
   */
  size() {
    return Object.keys(this.getCache()).length;
  }

  /**
   * Встановлює новий TTL для кешу (в мілісекундах)
   * @param {number} ttl - Час життя кешу в мс
   */
  setTtl(ttl) {
    this.cacheTtl = ttl;
  }

  /**
   * Повертає поточний TTL
   */
  getTtl() {
    return this.cacheTtl;
  }
}

export default new EpisodesCacheStorage();
