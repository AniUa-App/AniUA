import * as Updates from "expo-updates";
import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";

/**
 * Типи оновлень
 */
export type UpdateType = "ota" | "none";

/**
 * Результат перевірки оновлень
 */
export interface UpdateCheckResult {
  /** Тип доступного оновлення */
  type: UpdateType;
  /** Чи є оновлення */
  available: boolean;
  /** Нова версія */
  version?: string;
  /** Git hash нової версії */
  gitHash?: string;
  /** Короткий git hash */
  gitShortHash?: string;
  /** Опис оновлення (changelog) */
  changelog?: string;
  /** Чи це критичне оновлення */
  isCritical?: boolean;
}

/**
 * Сервіс для перевірки та встановлення OTA оновлень через expo-updates
 */
class UpdateCheckerService {
  /**
   * Перевіряє наявність OTA оновлень
   */
  public static async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      // Перевіряємо OTA оновлення
      const otaResult = await this.checkOTAUpdate();
      if (otaResult.available) {
        Logger.info("UpdateChecker", "Знайдено OTA оновлення", otaResult);
        return otaResult;
      }

      Logger.debug("UpdateChecker", "Оновлень не знайдено");
      return { type: "none", available: false };
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка перевірки оновлень", error);
      return { type: "none", available: false };
    }
  }

  /**
   * Перевіряє наявність OTA оновлення через expo-updates
   */
  public static async checkOTAUpdate(): Promise<UpdateCheckResult> {
    try {
      // В dev режимі OTA не працює
      if (MainConfig.debug.isDebug || __DEV__) {
        Logger.debug("UpdateChecker", "OTA перевірка пропущена в dev режимі");
        return { type: "none", available: false };
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Отримуємо changelog з маніфесту якщо є
        const manifest = update.manifest as {
          extra?: { changelog?: string };
        } | null;
        const changelog = manifest?.extra?.changelog;

        return {
          type: "ota",
          available: true,
          changelog,
          isCritical: false,
        };
      }

      return { type: "none", available: false };
    } catch (error) {
      Logger.warn("UpdateChecker", "Помилка перевірки OTA", error);
      return { type: "none", available: false };
    }
  }

  /**
   * Застосовує OTA оновлення та перезавантажує застосунок
   */
  public static async applyOTAUpdate(): Promise<void> {
    try {
      Logger.info("UpdateChecker", "Завантаження OTA оновлення...");

      await Updates.fetchUpdateAsync();

      Logger.info("UpdateChecker", "OTA оновлення завантажено, перезапуск...");

      await Updates.reloadAsync();
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка застосування OTA", error);
      throw error;
    }
  }

  /**
   * Зберігає інформацію про попередню версію для показу snackbar після оновлення
   */
  public static savePreviousVersion(): void {
    const currentVersion = MainConfig.devInfo.version;
    const currentGitHash = MainConfig.devInfo.gitShortHash;

    SettingsStorage.setParameter("previousVersion", currentVersion);
    SettingsStorage.setParameter("previousGitHash", currentGitHash);
  }

  /**
   * Перевіряє чи версія змінилась після оновлення
   * @returns Інформація про оновлення або null якщо версія не змінилась
   */
  public static checkVersionChanged(): {
    previousVersion: string;
    currentVersion: string;
    currentGitHash: string;
  } | null {
    const previousVersion = SettingsStorage.getParameter("previousVersion");
    const currentVersion = MainConfig.devInfo.version;
    const currentGitHash = MainConfig.devInfo.gitShortHash || "";

    // Очищуємо збережену попередню версію
    SettingsStorage.removeParameter("previousVersion");
    SettingsStorage.removeParameter("previousGitHash");

    if (previousVersion && previousVersion !== currentVersion) {
      return {
        previousVersion,
        currentVersion,
        currentGitHash,
      };
    }

    return null;
  }

}

export default UpdateCheckerService;
