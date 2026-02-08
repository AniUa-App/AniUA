import * as Updates from "expo-updates";
import * as IntentLauncher from "expo-intent-launcher";
import * as Application from "expo-application";
import { Platform, Linking, NativeModules } from "react-native";
import RNFS from "react-native-fs";
import { AniuaApi } from "../Api/AniuaApi";
import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";

const { FileOpener } = NativeModules;

/**
 * Типи оновлень
 */
export type UpdateType = "ota" | "apk" | "none";

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
  /** URL для завантаження (для APK) */
  downloadUrl?: string;
  /** Дата створення нової версії */
  createdAt?: string;
  /** Чи це критичне оновлення */
  isCritical?: boolean;
}

/**
 * Прогрес завантаження
 */
export interface DownloadProgress {
  /** Завантажено байт */
  downloadedBytes: number;
  /** Загальний розмір в байтах */
  totalBytes: number;
  /** Відсоток завантаження (0-100) */
  percent: number;
}

/**
 * Callback для прогресу завантаження
 */
export type DownloadProgressCallback = (progress: DownloadProgress) => void;

/**
 * Порівнює дві версії у форматі semver
 * @returns > 0 якщо v1 > v2, < 0 якщо v1 < v2, 0 якщо рівні
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Порівнює дати створення версій
 * @returns true якщо remote новіший
 */
function isNewerByDate(
  remoteDate: string,
  localDate: string | undefined,
): boolean {
  if (!localDate) return true;

  const remote = new Date(remoteDate).getTime();
  const local = new Date(localDate).getTime();

  return remote > local;
}

/**
 * Сервіс для перевірки та встановлення оновлень застосунку
 *
 * Підтримує два типи оновлень:
 * - OTA (Over-The-Air) через expo-updates
 * - APK через завантаження та встановлення
 *
 * @example
 * ```typescript
 * // Перевірка оновлень
 * const result = await UpdateCheckerService.checkForUpdates();
 *
 * if (result.type === 'ota') {
 *   await UpdateCheckerService.applyOTAUpdate();
 * } else if (result.type === 'apk') {
 *   await UpdateCheckerService.downloadAndInstallAPK(result.downloadUrl!);
 * }
 * ```
 */
class UpdateCheckerService {
  /**
   * Перевіряє наявність оновлень (спочатку OTA, потім APK)
   */
  public static async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      // Спочатку перевіряємо OTA оновлення
      const otaResult = await this.checkOTAUpdate();
      if (otaResult.available) {
        Logger.info("UpdateChecker", "Знайдено OTA оновлення", otaResult);
        return otaResult;
      }

      // Якщо OTA немає, перевіряємо APK
      const apkResult = await this.checkAPKUpdate();
      if (apkResult.available) {
        Logger.info("UpdateChecker", "Знайдено APK оновлення", apkResult);
        return apkResult;
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
   * Перевіряє наявність APK оновлення через AniuaApi
   * Порівнює version І created_at з локальними version і buildDate
   */
  public static async checkAPKUpdate(): Promise<UpdateCheckResult> {
    try {
      const versions = await AniuaApi.getVersions();

      if (!versions || versions.length === 0) {
        return { type: "none", available: false };
      }

      // Беремо найновішу версію (припускаємо що відсортовано по даті)
      const latestVersion = versions.reduce((latest, current) => {
        const latestDate = new Date(latest.created_at).getTime();
        const currentDate = new Date(current.created_at).getTime();
        return currentDate > latestDate ? current : latest;
      }, versions[0]);

      // Локальні дані
      const localVersion = MainConfig.devInfo.version;
      const localBuildDate = MainConfig.devInfo.buildDate;
      const localGitHash = MainConfig.devInfo.gitHash;

      // Порівнюємо версії
      const versionComparison = compareVersions(
        latestVersion.version,
        localVersion,
      );

      // Оновлення потрібне якщо:
      // 1. Версія новіша АБО
      // 2. Версія та сама, але дата створення новіша (патч з тим самим номером)
      const isNewerVersion = versionComparison > 0;
      const isSameVersionButNewer =
        versionComparison === 0 &&
        isNewerByDate(latestVersion.created_at, localBuildDate);

      // Пропускаємо якщо це та сама збірка (по git hash)
      if (latestVersion.git_hash === localGitHash) {
        return { type: "none", available: false };
      }

      if (isNewerVersion || isSameVersionButNewer) {
        // Завантажуємо changelog з GitHub
        let changelog = latestVersion.description || undefined;
        const gitShortHash = latestVersion.git_hash?.substring(0, 7);

        try {
          if (gitShortHash) {
            const changelogRaw = await AniuaApi.getGithubRaw(
              gitShortHash,
              "CHANGELOG.MD",
            );
            if (changelogRaw) {
              // Парсимо changelog - беремо перші кілька рядків після заголовку
              const lines = changelogRaw
                .replace("# CHANGELOG", "")
                .trim()
                .split("\n")
                .filter((line: string) => line.trim());

              changelog = lines.join("\n");
            }
          }
        } catch (changelogError) {
          Logger.debug(
            "UpdateChecker",
            "Не вдалося завантажити changelog з GitHub",
            changelogError,
          );
        }

        return {
          type: "apk",
          available: true,
          version: latestVersion.version,
          gitHash: latestVersion.git_hash,
          gitShortHash,
          changelog,
          downloadUrl: latestVersion.download_url,
          createdAt: latestVersion.created_at,
          isCritical: false,
        };
      }

      return { type: "none", available: false };
    } catch (error) {
      Logger.warn("UpdateChecker", "Помилка перевірки APK", error);
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
   * Завантажує APK в папку Downloads
   * @param url - URL для завантаження APK
   * @param onProgress - Callback для відстеження прогресу
   * @returns Шлях до завантаженого файлу
   */
  public static async downloadAPK(
    url: string,
    onProgress?: DownloadProgressCallback,
  ): Promise<string> {
    if (Platform.OS !== "android") {
      throw new Error("Завантаження APK підтримується тільки на Android");
    }

    try {
      SettingsStorage.setParameter("lastUpdateUrl", url);
      Logger.info("UpdateChecker", "Завантаження APK...", { url });

      // Видаляємо старий APK якщо є
      await this.clearPendingAPK();

      const fileName = `AniUA-update.apk`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Завантажуємо файл через RNFS
      const { promise } = RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
        progress: (res) => {
          if (onProgress) {
            const percent = Math.round(
              (res.bytesWritten / res.contentLength) * 100,
            );
            onProgress({
              downloadedBytes: res.bytesWritten,
              totalBytes: res.contentLength,
              percent,
            });
          }
        },
        progressDivider: 1,
      });

      const result = await promise;

      if (result.statusCode !== 200) {
        throw new Error(`Помилка завантаження: ${result.statusCode}`);
      }

      Logger.info("UpdateChecker", "APK завантажено", { path: filePath });

      // Зберігаємо шлях до завантаженого APK
      SettingsStorage.setParameter("pendingApkPath", filePath);

      return filePath;
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка завантаження APK", error);
      throw error;
    }
  }

  /**
   * Завантажує та встановлює APK
   * @param url - URL для завантаження APK
   * @param onProgress - Callback для відстеження прогресу
   */
  public static async downloadAndInstallAPK(
    url: string,
    onProgress?: DownloadProgressCallback,
  ): Promise<void> {
    const filePath = await this.downloadAPK(url, onProgress);
    await this.openAPKForInstall(filePath);
  }

  /**
   * Перевіряє чи є завантажений APK, який чекає на встановлення
   * @returns Шлях до APK або null
   */
  public static async getPendingAPK(): Promise<string | null> {
    const pendingPath = SettingsStorage.getParameter("pendingApkPath");
    if (!pendingPath) return null;

    try {
      const exists = await RNFS.exists(pendingPath);
      if (exists) {
        return pendingPath;
      }
      // Файл видалено - очищуємо налаштування
      SettingsStorage.removeParameter("pendingApkPath");
      return null;
    } catch (error) {
      Logger.warn("UpdateChecker", "Помилка перевірки pending APK", error);
      return null;
    }
  }

  /**
   * Встановлює завантажений APK
   */
  public static async installPendingAPK(): Promise<void> {
    const pendingPath = await this.getPendingAPK();
    if (!pendingPath) {
      throw new Error("Немає завантаженого APK для встановлення");
    }

    await this.openAPKForInstall(pendingPath);
  }

  /**
   * Видаляє завантажений APK
   */
  public static async clearPendingAPK(): Promise<void> {
    const pendingPath = SettingsStorage.getParameter("pendingApkPath");
    if (pendingPath) {
      try {
        const exists = await RNFS.exists(pendingPath);
        if (exists) {
          await RNFS.unlink(pendingPath);
          Logger.debug("UpdateChecker", "Старий APK видалено", {
            path: pendingPath,
          });
        }
      } catch (error) {
        Logger.warn("UpdateChecker", "Помилка видалення старого APK", error);
      }
      SettingsStorage.removeParameter("pendingApkPath");
    }
  }

  /**
   * Відкриває APK файл для встановлення
   * @param filePath - Шлях до APK файлу (без file:// префіксу)
   */
  public static async openAPKForInstall(filePath: string): Promise<void> {
    // Видаляємо file:// префікс якщо є
    const cleanPath = filePath.startsWith("file://")
      ? filePath.replace("file://", "")
      : filePath;

    Logger.debug("UpdateChecker", "Відкриття APK для встановлення", {
      filePath: cleanPath,
    });

    try {
      // Використовуємо FileOpener для встановлення APK
      await FileOpener.installAPK(cleanPath);
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка відкриття APK", error);

      // Fallback - відкриваємо налаштування невідомих джерел
      try {
        const packageName = Application.applicationId;
        if (packageName) {
          await IntentLauncher.startActivityAsync(
            "android.settings.MANAGE_UNKNOWN_APP_SOURCES",
            { data: `package:${packageName}` },
          );
        }
      } catch (settingsError) {
        Logger.warn(
          "UpdateChecker",
          "Не вдалося відкрити налаштування невідомих джерел",
          settingsError,
        );
      }

      // Fallback - відкриваємо URL в браузері
      const downloadUrl = SettingsStorage.getParameter("lastUpdateUrl");
      if (downloadUrl) {
        await Linking.openURL(downloadUrl);
      }

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

  /**
   * Відкриває URL завантаження у браузері (резервний спосіб)
   */
  public static async openDownloadUrl(url: string): Promise<void> {
    try {
      await Linking.openURL(url);
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка відкриття URL", error);
      throw error;
    }
  }
}

export default UpdateCheckerService;
