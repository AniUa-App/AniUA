import notifee, { EventType, AndroidImportance } from "@notifee/react-native";
import SettingsStorage from "../Storage/SettingsStorage";
import { FFmpegKit } from "ffmpeg-kit-react-native";
import FileOpener from "./FileOpener";
import RNFS from "react-native-fs";
import Logger from "../Logger/Logger";

// Ініціалізуємо обробник для фонових подій
export function setupBackgroundHandler() {
  // Переконаймося, що канал існує (особливо після перевстановлень)
  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  notifee
    .createChannel({
      id: activeChannelId,
      name: "AniUA",
      importance: AndroidImportance.HIGH,
    })
    .catch(() => {});

  notifee.onBackgroundEvent(async ({ type, detail }) => {
    Logger.debug('Actions', 'Background event received', { type, detail });
    if (
      (type === EventType.ACTION_PRESS &&
        detail.pressAction?.id === "cancel_download") ||
      (type === EventType.PRESS && detail.pressAction?.id === "cancel_download")
    ) {
      Logger.info('Actions', 'Скасування завантаження з фонової події');
      const { ffmpegSessionId } = detail.notification.data || {};
      Logger.debug('Actions', 'FFmpeg session ID', { ffmpegSessionId });
      if (ffmpegSessionId) {
        try {
          await FFmpegKit.cancel(Number(ffmpegSessionId));
          Logger.info('Actions', 'Завантаження скасовано успішно');
        } catch (error) {
          Logger.error('Actions', 'Помилка при скасуванні завантаження', error);
        }
      }
      return Promise.resolve();
    }

    if (
      (type === EventType.ACTION_PRESS &&
        detail.pressAction?.id === "open_downloaded_video") ||
      (type === EventType.PRESS &&
        detail.pressAction?.id === "open_downloaded_video")
    ) {
      Logger.info('Actions', 'Відкриття завантаженого відео з фонової події');
      const { savedEpisodeData } = detail.notification.data;
      Logger.debug('Actions', 'Дані епізоду', { savedEpisodeData });

      try {
        if (!(await RNFS.exists(savedEpisodeData.video_path))) {
          Logger.error('Actions', 'Файл не існує', { path: savedEpisodeData.video_path });
          return Promise.resolve();
        }

        await FileOpener.openFileAuto(savedEpisodeData.video_path);
        Logger.info('Actions', 'Діалог вибору відкрито');
      } catch (error) {
        Logger.error('Actions', 'Помилка при відкритті файлу', error);
      }
      return Promise.resolve();
    }
  });
}

// Функція для відстеження подій у foreground
export function setupForegroundHandler() {
  // Переконаймося, що канал існує і у foreground
  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  notifee
    .createChannel({
      id: activeChannelId,
      name: "AniUA",
      importance: AndroidImportance.HIGH,
    })
    .catch(() => {});

  const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
    Logger.debug('Actions', 'Foreground event received', { type, detail });
    if (
      (type === EventType.ACTION_PRESS &&
        detail.pressAction?.id === "cancel_download") ||
      (type === EventType.PRESS && detail.pressAction?.id === "cancel_download")
    ) {
      Logger.info('Actions', 'Скасування завантаження з foreground події');
      const { ffmpegSessionId } = detail.notification.data || {};
      Logger.debug('Actions', 'FFmpeg session ID', { ffmpegSessionId });
      if (ffmpegSessionId) {
        try {
          await FFmpegKit.cancel(Number(ffmpegSessionId));
          Logger.info('Actions', 'Завантаження скасовано успішно');
        } catch (error) {
          Logger.error('Actions', 'Помилка при скасуванні завантаження', error);
        }
      }
      return Promise.resolve();
    }

    if (
      (type === EventType.ACTION_PRESS &&
        detail.pressAction?.id === "open_downloaded_video") ||
      (type === EventType.PRESS &&
        detail.pressAction?.id === "open_downloaded_video")
    ) {
      Logger.info('Actions', 'Відкриття завантаженого відео з foreground події');
      const { savedEpisodeData } = detail.notification.data;
      Logger.debug('Actions', 'Дані епізоду', { savedEpisodeData });

      try {
        if (!(await RNFS.exists(savedEpisodeData.video_path))) {
          Logger.error('Actions', 'Файл не існує', { path: savedEpisodeData.video_path });
          return Promise.resolve();
        }

        await FileOpener.openFileAuto(savedEpisodeData.video_path);
        Logger.info('Actions', 'Діалог вибору відкрито');
      } catch (error) {
        Logger.error('Actions', 'Помилка при відкритті файлу', error);
      }
      return Promise.resolve();
    }
  });

  return unsubscribe;
}
