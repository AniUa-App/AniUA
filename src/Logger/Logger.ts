import MainConfig from "../cfgs/MainConfig";

/**
 * Рівні логування
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Налаштування логера
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableReactotron: boolean;
}

/**
 * Покращений логер для AniUA
 *
 * Особливості:
 * - Різні рівні логування (DEBUG, INFO, WARN, ERROR)
 * - Інтеграція з Reactotron (якщо доступний)
 * - Автоматичне відключення в продакшні
 * - Форматований вивід з контекстом
 *
 * @example
 * import Logger from '@/Logger/Logger';
 *
 * Logger.debug('AnimePreview', 'Завантаження аніме', { id: 123 });
 * Logger.info('API', 'Запит виконано успішно');
 * Logger.warn('Storage', 'Застаріла версія кешу');
 * Logger.error('VideoPlayer', 'Помилка відтворення', error);
 */
class Logger {
  private config: LoggerConfig;
  private reactotron: any = null;

  constructor() {
    // Налаштування за замовчуванням
    this.config = {
      minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.WARN,
      enableColors: true,
      enableTimestamp: true,
      enableReactotron: __DEV__,
    };

    // Спроба підключити Reactotron якщо доступний
    if (__DEV__ && this.config.enableReactotron) {
      try {
        this.reactotron = require("../cfgs/ReactotronConfig").default;
      } catch (error) {
        // Reactotron не доступний, працюємо без нього
      }
    }
  }

  /**
   * Форматує час для логів
   */
  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ms = String(now.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  /**
   * Форматує повідомлення для виводу
   */
  private formatMessage(
    level: string,
    context: string,
    message: string,
    data?: any
  ): string {
    const timestamp = this.config.enableTimestamp
      ? `[${this.getTimestamp()}]`
      : "";
    const ctx = context ? `[${context}]` : "";
    const baseMessage = `${timestamp} ${level} ${ctx} ${message}`;

    return baseMessage;
  }

  /**
   * Перевіряє чи потрібно виводити лог цього рівня
   */
  private shouldLog(level: LogLevel): boolean {
    // У продакшні дотримуємось MainConfig.debug.isDebug
    if (!__DEV__ && !MainConfig.debug.isDebug) {
      return level >= LogLevel.WARN;
    }

    return level >= this.config.minLevel;
  }

  /**
   * Відправляє лог в Reactotron якщо доступний
   */
  private sendToReactotron(
    level: "debug" | "log" | "warn" | "error",
    context: string,
    message: string,
    data?: any
  ): void {
    if (!this.reactotron) return;

    try {
      const display = context ? `[${context}] ${message}` : message;

      if (level === "error" && data instanceof Error) {
        this.reactotron.error(data, display);
      } else if (data !== undefined) {
        this.reactotron[level](display, data);
      } else {
        this.reactotron[level](display);
      }
    } catch (error) {
      // Ігноруємо помилки Reactotron
    }
  }

  /**
   * DEBUG рівень - детальна інформація для розробки
   */
  public debug(context: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const formatted = this.formatMessage("🔍 DEBUG", context, message, data);

    /* eslint-disable no-console */
    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
    /* eslint-enable no-console */

    this.sendToReactotron("debug", context, message, data);
  }

  /**
   * INFO рівень - загальна інформація про роботу
   */
  info(context: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const formatted = this.formatMessage("ℹ️  INFO", context, message, data);

    /* eslint-disable no-console */
    if (data !== undefined) {
      console.log(formatted, data);
    } else {
      console.log(formatted);
    }
    /* eslint-enable no-console */

    this.sendToReactotron("log", context, message, data);
  }

  /**
   * WARN рівень - попередження про потенційні проблеми
   */
  warn(context: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const formatted = this.formatMessage("⚠️  WARN", context, message, data);

    /* eslint-disable no-console */
    if (data !== undefined) {
      console.warn(formatted, data);
    } else {
      console.warn(formatted);
    }
    /* eslint-enable no-console */

    this.sendToReactotron("warn", context, message, data);
  }

  /**
   * ERROR рівень - критичні помилки
   */
  error(context: string, message: string, error?: Error | any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const formatted = this.formatMessage("❌ ERROR", context, message, error);

    /* eslint-disable no-console */
    if (error !== undefined) {
      console.error(formatted, error);
    } else {
      console.error(formatted);
    }
    /* eslint-enable no-console */

    this.sendToReactotron("error", context, message, error);
  }

  /**
   * Логування ініціалізації додатка (з емодзі статусом)
   */
  logAppInit(step: string, success: boolean = true, details?: any): void {
    const status = success ? "✅" : "❌";
    const message = `${status} Ініціалізація: ${step}`;

    if (success) {
      this.info("App", message, details);
    } else {
      this.error("App", message, details);
    }
  }

  /**
   * Налаштування мінімального рівня логування
   */
  setMinLevel(level: LogLevel): void {
    this.config.minLevel = level;
  }

  /**
   * Отримання поточного рівня логування
   */
  getMinLevel(): LogLevel {
    return this.config.minLevel;
  }
}

// Експортуємо singleton
export default new Logger();
