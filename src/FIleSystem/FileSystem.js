import SettingsStorage from "../Storage/SettingsStorage";
import RNFS from "react-native-fs";
import { PermissionsAndroid, Platform } from "react-native";
import { AllowTheVideoFolder as AllowTheVideoFolderPermisions } from "../Permissions/Permissions";
import Logger from "../Logger/Logger";

export default async function AllowTheVideoFolder() {
  const result = await AllowTheVideoFolderPermisions();
  SettingsStorage.setParameter("pathToSaveEpisodes", result.path);
  return result.path;
}

export async function getVideoDir() {
  return SettingsStorage.getParameter("pathToSaveEpisodes");
}

/**
 * Перевіряє доступний простір на пристрої
 */
export async function getAvailableSpace() {
  try {
    const path = await getVideoDir();
    if (path) {
      const stats = await RNFS.getFSInfo();
      return {
        free: stats.freeSpace,
        total: stats.totalSpace,
        freeGB: (stats.freeSpace / (1024 * 1024 * 1024)).toFixed(2),
        totalGB: (stats.totalSpace / (1024 * 1024 * 1024)).toFixed(2),
      };
    }
  } catch (error) {
    Logger.warn('FileSystem', 'Помилка отримання інформації про простір', error);
  }
  return null;
}

/**
 * Перевіряє, чи існує директорія для збереження відео
 */
export async function checkVideoDirectory() {
  try {
    const path = await getVideoDir();
    if (path) {
      const exists = await RNFS.exists(path);
      const isWritable = exists ? await testDirectoryWrite(path) : false;

      return {
        path,
        exists,
        isWritable,
        canWrite: exists && isWritable,
      };
    }
  } catch (error) {
    Logger.warn('FileSystem', 'Помилка перевірки директорії', error);
  }
  return null;
}

/**
 * Тестує запис у директорію
 */
async function testDirectoryWrite(path) {
  try {
    const testFile = `${path}/test_write.txt`;
    await RNFS.writeFile(testFile, "test", "utf8");
    await RNFS.unlink(testFile);
    return true;
  } catch (error) {
    Logger.warn('FileSystem', 'Не вдається записати в директорію', { path, error });
    return false;
  }
}

export async function getDocumentDirectory() {
  return RNFS.DocumentDirectoryPath;
}

export async function isFolderAllowed() {
  return SettingsStorage.getParameter("pathToSaveEpisodes").length > 0
    ? true
    : false;
}

/**
 * Перевіряє, чи є на пристрої щонайменше 1 ГБ вільного місця
 * @returns {Promise<boolean>} true, якщо вільного місця >= 1 ГБ, інакше false
 */
export async function hasAtLeastOneGBFree() {
  try {
    const { freeSpace } = await RNFS.getFSInfo();
    const ONE_GB = 1024 * 1024 * 1024;
    return typeof freeSpace === "number" && freeSpace >= ONE_GB;
  } catch (error) {
    Logger.warn('FileSystem', 'Не вдалося перевірити вільне місце', error);
    return false;
  }
}
