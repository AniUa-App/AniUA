import { Platform, AppState } from 'react-native';

/**
 * Допоміжний клас для безпечної роботи з Android activity
 */
class AndroidHelper {
  /**
   * Очікує готовності Android activity
   * @param {number} timeout - максимальний час очікування в мс
   * @returns {Promise<boolean>} - true якщо activity готова, false якщо вийшов час
   */
  static waitForActivity(timeout = 5000) {
    return new Promise((resolve) => {
      if (Platform.OS !== 'android') {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      
      const checkActivity = () => {
        if (AppState.currentState === 'active') {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          console.warn('Timeout: Android activity не готова протягом', timeout, 'мс');
          resolve(false);
        } else {
          setTimeout(checkActivity, 100);
        }
      };
      
      checkActivity();
    });
  }

  /**
   * Виконує функцію з перевіркою готовності activity
   * @param {Function} func - функція для виконання
   * @param {string} errorMessage - повідомлення про помилку
   * @returns {Promise<any>} - результат виконання функції або null у випадку помилки
   */
  static async safeExecute(func, errorMessage = 'Помилка виконання операції') {
    try {
      if (Platform.OS !== 'android') {
        return await func();
      }

      const isReady = await this.waitForActivity();
      if (!isReady) {
        throw new Error('Android activity не готова');
      }

      return await func();
    } catch (error) {
      console.warn(`${errorMessage}:`, error);
      return null;
    }
  }

  /**
   * Перевіряє чи доступна Android activity
   * @returns {boolean}
   */
  static isActivityAvailable() {
    return Platform.OS !== 'android' || AppState.currentState === 'active';
  }
}

export default AndroidHelper; 