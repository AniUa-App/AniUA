import MainConfig from '../cfgs/MainConfig';

/**
 * Логер для відстеження проблем з ініціалізацією додатка
 */
class AppLogger {
  static log(message, data = null) {
    if (MainConfig.debug.isDebug) {
      console.log(`[AniUA] ${message}`, data || '');
    }
  }

  static warn(message, error = null) {
    console.warn(`[AniUA] ${message}`, error || '');
  }

  static error(message, error = null) {
    console.error(`[AniUA] ${message}`, error || '');
  }

  static logAppInit(step, success = true, details = null) {
    const status = success ? '✅' : '❌';
    const message = `${status} Ініціалізація: ${step}`;
    
    if (success) {
      this.log(message, details);
    } else {
      this.error(message, details);
    }
  }
}

export default AppLogger; 