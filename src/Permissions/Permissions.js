import { PermissionsAndroid, Platform } from 'react-native';
import SettingsStorage from '../Storage/SettingsStorage';
import RNFS from 'react-native-fs';
import MainConfig from '../cfgs/MainConfig';

export async function AllowTheVideoFolder() {
    if (Platform.OS === 'android') {
        // Для Android 10+ (API 29+) використовуємо Scoped Storage
        if (Platform.Version >= 29) {
            try {
                // Використовуємо внутрішню директорію додатка, де дозволи не потрібні
                const internalPath = `${RNFS.ExternalDirectoryPath.replace('data', 'media').replace("files",'episodes')}`;
                
                // Створюємо директорію, якщо її немає
                const dirExists = await RNFS.exists(internalPath);
                if (!dirExists) {
                    await RNFS.mkdir(internalPath);
                }
                
                console.log('Використовуємо Scoped Storage шлях:', internalPath);
                return { success: true, path: internalPath };
            } catch (error) {
                console.warn('Помилка при створенні Scoped Storage директорії:', error);
                // Fallback на DocumentDirectory
                const fallbackPath = RNFS.DocumentDirectoryPath + `/episodes`;
                try {
                    const dirExists = await RNFS.exists(fallbackPath);
                    if (!dirExists) {
                        await RNFS.mkdir(fallbackPath);
                    }
                    console.log('Використовуємо резервний шлях:', fallbackPath);
                    return { success: true, path: fallbackPath };
                } catch (fallbackError) {
                    console.warn('Помилка створення резервної директорії:', fallbackError);
                    return { success: false, path: '' };
                }
            }
        } else {
            // Для старих версій Android (API < 29) використовуємо старий метод
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Дозвіл на запис у зовнішнє сховище надано');
                    return { success: true, path: RNFS.ExternalStorageDirectoryPath };
                } else {
                    console.log('Дозвіл на запис у зовнішнє сховище відхилено');
                    return { success: false, path: '' };
                }
            } catch (error) {
                console.warn('Помилка при запиті дозволу:', error);
                return { success: false, path: '' };
            }
        }


    }
    // Для інших платформ повертаємо false
    return { success: false, path: '' };
}





export async function checkNotificationPermission() {
    var isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (Platform.OS === 'android' && Platform.Version >= 33 && !isGranted) {
        const isGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (isGranted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}
