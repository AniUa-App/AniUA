import { PermissionsAndroid, Platform } from "react-native";
import SettingsStorage from "../Storage/SettingsStorage";
import RNFS from "react-native-fs";
import MainConfig from "../cfgs/MainConfig";
import Logger from "../Logger/Logger";

export async function AllowTheVideoFolder() {
  if (Platform.OS === "android") {
    // Для Android 10+ (API 29+) використовуємо Scoped Storage
    if (Platform.Version >= 29) {
      try {
        // Використовуємо внутрішню директорію додатка, де дозволи не потрібні
        const internalPath = `${RNFS.ExternalDirectoryPath.replace("data", "media").replace("files", "episodes")}`;

        // Створюємо директорію, якщо її немає
        const dirExists = await RNFS.exists(internalPath);
        if (!dirExists) {
          await RNFS.mkdir(internalPath);
        }

        Logger.info('Permissions', 'Використовуємо Scoped Storage шлях', { path: internalPath });
        return { success: true, path: internalPath };
      } catch (error) {
        Logger.warn('Permissions', 'Помилка при створенні Scoped Storage директорії', error);
        // Fallback на DocumentDirectory
        const fallbackPath = RNFS.DocumentDirectoryPath + `/episodes`;
        try {
          const dirExists = await RNFS.exists(fallbackPath);
          if (!dirExists) {
            await RNFS.mkdir(fallbackPath);
          }
          Logger.info('Permissions', 'Використовуємо резервний шлях', { path: fallbackPath });
          return { success: true, path: fallbackPath };
        } catch (fallbackError) {
          Logger.warn('Permissions', 'Помилка створення резервної директорії', fallbackError);
          return { success: false, path: "" };
        }
      }
    } else {
      // Для старих версій Android (API < 29) використовуємо старий метод
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Logger.info('Permissions', 'Дозвіл на запис у зовнішнє сховище надано');
          return { success: true, path: RNFS.ExternalStorageDirectoryPath };
        } else {
          Logger.info('Permissions', 'Дозвіл на запис у зовнішнє сховище відхилено');
          return { success: false, path: "" };
        }
      } catch (error) {
        Logger.warn('Permissions', 'Помилка при запиті дозволу', error);
        return { success: false, path: "" };
      }
    }
  }
  // Для інших платформ повертаємо false
  return { success: false, path: "" };
}

export async function checkNotificationPermission() {
  // iOS та Android < 13 не потребують явного дозволу на показ локальних сповіщень
  if (Platform.OS !== "android" || Platform.Version < 33) {
    return true;
  }

  // Android 13+ (API 33+) — перевіряємо і, за потреби, запитуємо дозвіл
  const alreadyGranted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  if (alreadyGranted) {
    return true;
  }

  const requestResult = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return requestResult === PermissionsAndroid.RESULTS.GRANTED;
}
