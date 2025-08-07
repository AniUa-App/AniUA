import notifee, {EventType} from '@notifee/react-native';
import * as FileSystem from 'expo-file-system';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import FileOpener from './FileOpener';

// Ініціалізуємо обробник для фонових подій
export function setupBackgroundHandler() {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    if (
      type === EventType.ACTION_PRESS &&
      detail.pressAction?.id === 'cancel_download'
    ) {
      console.log('cancel_download from action press');
      const {ffmpegSessionId} = detail.notification.data || {};
      console.log('ffmpegSessionId ', ffmpegSessionId);
      if (ffmpegSessionId) {
        try {
          await FFmpegKit.cancel(ffmpegSessionId);
          console.log('Завантаження скасовано');
        } catch (error) {
          console.error('Помилка при скасуванні завантаження:', error);
        }
      }
      return Promise.resolve();
    }

    if (
      type === EventType.PRESS &&
      detail.pressAction.id === 'open_downloaded_video'
    ) {
      console.log('setupBackgroundHandler');
      const {savedEpisodeData} = detail.notification.data;
      console.log('Background: savedEpisodeData', savedEpisodeData);

      try {
        // Додати перевірку існування файлу з expo-file-system
        const fileInfo = await FileSystem.getInfoAsync(savedEpisodeData.video_path);
        if (!fileInfo.exists) {
          console.error('Файл не існує:', savedEpisodeData.video_path);
          return Promise.resolve();
        }

        await FileOpener.openFile(
          savedEpisodeData.video_path,
          'video/*',
        );
        console.log('Діалог вибору відкрито');
      } catch (error) {
        console.error('Помилка при відкритті файлу:', error);
      }
      return Promise.resolve();
    }
  });
}

// Функція для відстеження подій у foreground
export function setupForegroundHandler() {
  const unsubscribe = notifee.onForegroundEvent(async ({type, detail}) => {
    if (
      type === EventType.ACTION_PRESS &&
      detail.pressAction?.id === 'cancel_download'
    ) {
      console.log('cancel_download from action press');
      const {ffmpegSessionId} = detail.notification.data || {};
      console.log('ffmpegSessionId ', ffmpegSessionId);
      if (ffmpegSessionId) {
        try {
          await FFmpegKit.cancel(ffmpegSessionId);
          console.log('Завантаження скасовано');
        } catch (error) {
          console.error('Помилка при скасуванні завантаження:', error);
        }
      }
      return;
    }

    if (type === EventType.PRESS && detail.notification) {
      console.log('setupForegroundHandler');
      switch (detail.pressAction.id) {
        case 'open_downloaded_video':
          const {savedEpisodeData} = detail.notification.data;
          console.log('Foreground: savedEpisodeData', savedEpisodeData);

          try {
            // Додати перевірку існування файлу
            const fileExists = await FileSystem.getInfoAsync(
              savedEpisodeData.video_path,
            );
            if (!fileExists.exists) {
              console.error('Файл не існує:', savedEpisodeData.video_path);
              return;
            }

            await FileOpener.openFile(
              savedEpisodeData.video_path,
              'video/*',
            );
            console.log('Діалог вибору відкрито');
          } catch (error) {
            console.error('Помилка при відкритті файлу:', error);
          }
          break;

        case 'download_video_error':
          console.log(
            'Помилка при завантаженні відео:',
            detail.notification.data,
          );
          break;
      }
    }
  });

  return unsubscribe;
}
