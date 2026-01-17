import * as Updates from "expo-updates";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform, Linking } from "react-native";
import { AniuaApi } from "../Api/AniuaApi";
import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";

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
  localDate: string | undefined
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
      if (__DEV__) {
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
        localVersion
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
              "CHANGELOG.MD"
            );
            if (changelogRaw) {
              // Парсимо changelog - беремо перші кілька рядків після заголовку
              const lines = changelogRaw
                .replace("# CHANGELOG", "")
                .trim()
                .split("\n")
                .filter((line: string) => line.trim());

              changelog = lines.slice(0, 5).join("\n");
            }
          }
        } catch (changelogError) {
          Logger.debug(
            "UpdateChecker",
            "Не вдалося завантажити changelog з GitHub",
            changelogError
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
   * Завантажує та встановлює APK
   * @param url - URL для завантаження APK
   * @param onProgress - Callback для відстеження прогресу
   */
  public static async downloadAndInstallAPK(
    url: string,
    onProgress?: DownloadProgressCallback
  ): Promise<void> {
    if (Platform.OS !== "android") {
      throw new Error("Встановлення APK підтримується тільки на Android");
    }

    try {
      Logger.info("UpdateChecker", "Завантаження APK...", { url });

      const fileName = `aniua-update-${Date.now()}.apk`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Завантажуємо файл
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          if (onProgress) {
            const percent = Math.round(
              (downloadProgress.totalBytesWritten /
                downloadProgress.totalBytesExpectedToWrite) *
                100
            );
            onProgress({
              downloadedBytes: downloadProgress.totalBytesWritten,
              totalBytes: downloadProgress.totalBytesExpectedToWrite,
              percent,
            });
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result?.uri) {
        throw new Error("Не вдалося завантажити файл");
      }

      Logger.info("UpdateChecker", "APK завантажено, встановлення...", {
        uri: result.uri,
      });

      // Відкриваємо для встановлення
      await this.openAPKForInstall(result.uri);
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка завантаження APK", error);
      throw error;
    }
  }

  /**
   * Відкриває APK файл для встановлення
   */
  private static async openAPKForInstall(fileUri: string): Promise<void> {
    try {
      // Конвертуємо file:// URI в content:// через FileProvider
      const contentUri = await FileSystem.getContentUriAsync(fileUri);

      Logger.debug("UpdateChecker", "Відкриття APK для встановлення", {
        contentUri,
      });

      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: contentUri,
        flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        type: "application/vnd.android.package-archive",
      });
    } catch (error) {
      Logger.error("UpdateChecker", "Помилка відкриття APK", error);

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
