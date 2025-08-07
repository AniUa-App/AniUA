import React, {useState, useEffect} from 'react';
import {Alert, ActivityIndicator, View, Text} from 'react-native';
import {FFmpegKit, FFprobeKit, FFmpegKitConfig} from 'ffmpeg-kit-react-native';
import axios from 'axios';
import { getVideoDir } from '../FIleSystem/FileSystem';
import {sanitizeFileName} from '../Global/Functions';
import {DEBUGCONFIG} from '../cfgs/DebugConfig';
import notifee from '@notifee/react-native';
import {appColor} from '../Styles/Colors';
import SettingsStorage from '../Storage/SettingsStorage';
import RNFS from 'react-native-fs';


// Налаштування FFmpeg для відключення логів
FFmpegKitConfig.setLogLevel(FFmpegKitConfig.LEVEL_QUIET);
FFmpegKitConfig.enableLogCallback(() => {});
FFmpegKitConfig.enableStatisticsCallback(() => {});

export const STATUSES = {
  downloading: 'Завантаження серії',
  downloading_m3u8_witch_quality_url: 'Завантаження файлу з якістю',
  parsing_m3u8_witch_quality: 'Аналіз файлу',
  getting_additional_information: 'Отримання додаткової інформації',
  quality_selection: 'Вибір найвищої якості',
  downloading_and_splicing_clips: 'Завантаження серії',
  success: 'Серія завантажена',
  error: 'Помилка завантаження',
};

export default async function DownloadVideoNotification({
  animeName = 'Anime Name',
  episodeNumber = 0,
  progress = 0,
  typeOfProgress = '',
}) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'AniUA',
    name: 'AniUA',
  });

  // Оголошуємо змінну поза блоком try
  let notificationId = null;

  // Display a notification
  try {
    notificationId = await notifee.displayNotification({
      title: `Завантаження ${animeName} - ${episodeNumber}`,
      body: `${typeOfProgress} - ${progress}%`,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
        progress: {
          max: 100,
          current: progress,
          indeterminate: progress === 0,
        },
        smallIcon: 'ic_launcher',
        color: appColor,
        ongoing: true,
        autoCancel: false,
        swipeAction: {
          action: 'dismiss',
        },
      },
    });
    if (DEBUGCONFIG.isDebug) {
      console.log(`notificationId: ${notificationId}`);
    }
  } catch (error) {
    console.log(`error: ${error}`);
    notificationId = null;
  }

  // Єдиний return в кінці функції
  return notificationId;
}

// Додаємо нову функцію для оновлення прогресу
export async function updateDownloadProgress({
  notificationId,
  animeName,
  episodeNumber,
  progress,
  typeOfProgress = '',
  ffmpegSessionId,
}) {
  await notifee.displayNotification({
    id: notificationId,
    title: `Завантаження ${animeName} - ${episodeNumber} серія`,
    body: `${typeOfProgress} - ${progress}%`,
    data: {
      ffmpegSessionId: ffmpegSessionId || null,
      action: 'cancel_download',
    },
    android: {
      channelId: 'AniUA',
      progress: {
        max: 100,
        current: progress,
        indeterminate: progress === 0,
      },
      smallIcon: 'ic_launcher',
      color: appColor,
      ongoing: true,

      pressAction: {
        id: 'cancel_download',
      },
      actions: [
        {
          title: 'Скасувати',
          pressAction: {
            id: 'cancel_download',
          },
        },
      ],
    },
  });
}

// Додаємо нову функцію для завершення завантаження
export async function completeDownloadNotification({
  notificationId,
  animeName,
  episodeNumber,
  savedEpisodeData,
}) {
  await notifee.displayNotification({
    id: notificationId,
    title: `Завантаження завершено`,
    body: `${animeName} - ${episodeNumber} серія`,
    data: {
      animeName,
      episodeNumber,
      savedEpisodeData,
      action: 'open_downloaded_video',
    },
    android: {
      channelId: 'AniUA',
      smallIcon: 'ic_launcher',
      color: appColor,
      ongoing: false,
      autoCancel: true,
      swipeAction: {
        action: 'dismiss',
      },
      pressAction: {
        id: 'open_downloaded_video',
        launchActivity: 'default',
      },
      actions: [
        {
          title: 'Відкрити',
          pressAction: {
            id: 'open_downloaded_video',
          },
        },
      ],
    },
  });
}

export async function errorDownloadNotification({
  notificationId,
  animeName,
  episodeNumber,
  error,
}) {
  const errorMessage = Array.isArray(error) ? error.join('; ') : String(error);
  await notifee.displayNotification({
    id: notificationId,
    title: `Помилка завантаження: ${animeName} - ${episodeNumber} серія`,
    body: `Подробиці: ${errorMessage.substring(0, 200)}`,
    android: {
      channelId: 'AniUA',
      smallIcon: 'ic_launcher',
      color: appColor,
      ongoing: false,
      autoCancel: true,
      swipeAction: {
        action: 'dismiss',
      },
      pressAction: {
        id: 'download_video_error',
      },
    },
    data: {
      animeName,
      episodeNumber,
      errorDetails: errorMessage,
      action: 'download_video_error',
    },
  });
}

// добавити перевірку на тип файлу, та розподіляти, яку функцію викликати
export async function DownloadVideo(
  item,
  anime,
  info,
  progressCallback,
  completionCallback,
) {
  const progressInfo = {
    status: '',
    data: {
      progress: 0,
      data: [],
    },
    already_done: [],
  };

  // Створюємо сповіщення при старті завантаження
  let notificationId = await DownloadVideoNotification({
    animeName: anime.title_ua,
    episodeNumber: item.episode,
    progress: 0,
    typeOfProgress: STATUSES.downloading,
  });

  function updateStatus(status, data = {}) {
    if (progressCallback) {
      progressInfo.status = status;
      progressInfo.data = data;
      progressInfo.already_done.push({
        status: status,
        data: data,
      });
      progressCallback(progressInfo);
    }

    // Оновлюємо сповіщення при кожному оновленні статусу
    if (notificationId) {
      var savedEpisodeData = {
        episode: item.episode,
        player: info.watched.player,
        dubbing: info.watched.dubbing,
        quality: data.quality,
        url: {homeUrl: item.video_url, playerUrl: data.url},
        video_path: data.path,
        video_type: 'mp4',
      };
      if (status === 'success') {
        completeDownloadNotification({
          notificationId,
          animeName: anime.title_ua,
          episodeNumber: item.episode,
          savedEpisodeData,
        });
        if (completionCallback) {
          if (!info.downloaded) info.downloaded = {};
          if (!info.downloaded.episodes) info.downloaded.episodes = [];

          info.downloaded.episodes.push(savedEpisodeData);
          completionCallback(info);
          console.log(info, 'newTempData');
        }
      } else if (status === 'error') {
        console.log('error', data);
        errorDownloadNotification({
          notificationId,
          animeName: anime.title_ua,
          episodeNumber: item.episode,
          error: data.data,
        });
      } else {
        const statusText = STATUSES[status] || status;
        updateDownloadProgress({
          notificationId,
          animeName: anime.title_ua,
          episodeNumber: item.episode,
          progress: data.progress || 0,
          typeOfProgress: statusText,
          ffmpegSessionId: data.ffmpegSessionId,
        });
      }
    }
  }

  try {
    FFmpegKitConfig.init();
    console.log(await FFmpegKitConfig.getVersion(), 'version');

    // Виправлено порядок - спочатку визначаємо nameOfFile
    const nameOfFile = `${sanitizeFileName(
      `${anime.title_ua}-=(${info?.watched?.player}-${info?.watched?.dubbing}-${item.episode}).mp4`,
      false,
    )}`;
    let selectedQuality = {};
    let tsLinks = [];
    let duration;
    let pathToSaveEpisodes = await getVideoDir();
    console.log(pathToSaveEpisodes, 'pathToSaveEpisodes');

    // Спочатку створюємо змінну outputPath
    let outputPath = `${pathToSaveEpisodes}/${sanitizeFileName(
      anime.title_ua,
      false,
    )}/`;

    // Потім перевіряємо чи існує папка
    try {
      if (!(await RNFS.exists(outputPath))) {
        await RNFS.mkdir(outputPath);
      }
    } catch (error) {
      // Ігноруємо помилку, якщо папка вже існує
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }

    // Додаємо ім'я файлу до шляху
    outputPath += nameOfFile;

    // 1. Отримання M3U8 файла з описом якостей
    updateStatus('downloading_m3u8_witch_quality_url', {
      progress: 20 + randNumber(16),
      data: [nameOfFile, item.video_url],
    });
    let playerResponse = item.video_url.includes('moon')
      ? await getPlayerDataFrom_MOON_Player(item.video_url)
      : await getPlayerDataFrom_ASHDI_Player(item.video_url);
    if (Object.values(playerResponse.file).some(url => url.includes('webm'))) {
      selectedQuality.url =
        playerResponse.file['1080p'] ||
        playerResponse.file['720p'] ||
        playerResponse.file['480p'] ||
        playerResponse.file['360p'];
      selectedQuality.quality = playerResponse.file['1080p']
        ? '1080p'
        : playerResponse.file['720p']
        ? '720p'
        : playerResponse.file['480p']
        ? '480p'
        : playerResponse.file['360p']
        ? '360p'
        : '';

      const ffprobe = new FFprobe(selectedQuality.url);
      await ffprobe.getMediaInformation();
      duration = (await ffprobe.getOriginalDuration()) || 0;
    } else {
      let response = await axios.get(playerResponse.file, {
        headers: {
          'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
        },
        decompress: true,
      });

      // 2. Парсинг доступних якостей
      updateStatus('parsing_m3u8_witch_quality', {
        progress: 40 + randNumber(16),
        data: [response.data],
      });
      var {success, data: availableQualities} = dataToQuality(response.data);
      if (!success) {
        updateStatus('error', {
          progress: -1,
          data: ['no_quality_options_found'],
        });

        return {success: false, error: 'no_quality_options_found'};
      }

      // 3. Вибір якості (обираємо найвищу за замовчуванням)
      updateStatus('quality_selection', {
        progress: 60 + randNumber(16),
        data: [availableQualities],
      });
      selectedQuality = availableQualities[0]; // Найвища якість

      updateStatus('quality_selection', {
        progress: 80 + randNumber(16),
        data: [selectedQuality],
      });

      // Отримуємо інформацію про TS сегменти для розрахунку прогресу
      const qualityM3U8Response = await axios.get(selectedQuality.url, {
        headers: {
          'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
        },
        decompress: true,
      });

      // Розбираємо базовий URL для TS файлів
      const baseUrl = selectedQuality.url.substring(
        0,
        selectedQuality.url.lastIndexOf('/'),
      );

      // Отримуємо список TS файлів
      const tsLinksResult = dataToTsLinks(qualityM3U8Response.data, baseUrl);
      if (!tsLinksResult.success) {
        updateStatus('error', {progress: -1, data: ['no_ts_segments_found']});
        return {success: false, error: 'no_ts_segments_found'};
      }
      tsLinks = tsLinksResult.data;

      updateStatus('getting_additional_information', {
        progress: 100,
        data: [tsLinks],
      });
    }

    const command = `-i "${selectedQuality.url}" -c copy "${outputPath}" -y`;

    await FFmpegKit.executeAsync(
      command,
      async session => {
        console.log(await session, 'session');

        if (!session) {
          console.error('FFmpegKit session is null');
          updateStatus('error', {
            progress: -1,
            data: ['FFmpegKit session is null'],
          });
          return {success: false, error: 'FFmpegKit session is null'};
        }
        const returnCode = await session.getReturnCode();
        const outputFileExists = await RNFS.exists(outputPath);

        const isSavedEpisode = await RNFS.exists(outputPath);

        if (returnCode.isValueSuccess() && outputFileExists && isSavedEpisode) {
          updateStatus('success', {
            progress: 100,
            path: outputPath,
            url: selectedQuality.url,
            quality: selectedQuality.quality,
          });
          return {success: true, path: outputPath};
        } else if (returnCode.getValue() === 255) {
          updateStatus('error', {
            progress: -1,
            data: [
              'Помилка при завантаженні серії: відміна завантаження серії',
            ],
          });
          return {success: false, error: 'Помилка при завантаженні серії'};
        } else if (!returnCode.isValueSuccess()) {
          console.error(
            `FFmpeg завершився з помилкою: ${returnCode.getValue()}`,
          );
          const logs = await session.getAllLogs();
          updateStatus('error', {
            progress: -1,
            data: [logs],
          });
          return {success: false, error: logs};
        } else if (!isSavedEpisode) {
          updateStatus('error', {
            progress: -1,
            data: ['Файл не було створено після завершення FFmpeg'],
          });
          return {
            success: false,
            error: 'Файл не було створено після завершення FFmpeg',
          };
        } else {
          updateStatus('error', {
            progress: -1,
            data: [
              'Помилка при завантаженні серії',
              [
                outputPath,
                selectedQuality,
                tsLinks,
                duration,
                command,
                returnCode,
                outputFileExists,
              ],
            ],
          });
          return {success: false, error: 'Помилка при завантаженні серії'};
        }
      },
      log => {},
      async statistics => {
        const time = statistics.getTime();
        let pct = 0;

        if (selectedQuality.url.includes('webm')) {
          pct = Math.max(
            0,
            Math.min(Math.floor((time / 1000 / duration) * 100), 100),
          );
        } else {
          const totalMs = await getTotalMs(tsLinks.length);
          const factor = item.video_url.includes('moon') ? 100 : 200;
          pct = Math.max(
            0,
            Math.min(Math.floor((time / totalMs) * factor), 100),
          );
        }
        updateStatus('downloading_and_splicing_clips', {
          progress: pct,
          ffmpegSessionId: await statistics.getSessionId(),
          data: [time, pct],
        });
      },
    );

    // Важливо дочекатися завершення сесії
  } catch (error) {
    updateStatus('error', {
      progress: -1,
      data: [error && error.message ? error.message : String(error)],
    });

    console.error(
      'Помилка завантаження відео:',
      error && error.message ? error.message : String(error),
    );
    return {
      success: false,
      error: error && error.message ? error.message : String(error),
    };
  }
}

// Функция получения данных плеера
async function getPlayerDataFrom_ASHDI_Player(url) {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
    console.log(fileMatch);
    return fileMatch ? {file: fileMatch[1]} : null;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return {success: false, error: 'no_player_data_found'};
  }
}

export async function getPlayerDataFrom_MOON_Player(url) {
  try {
    // Отримуємо HTML-контент за посиланням
    const response = await axios.get(url, {
      headers: {
        'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
      },
      decompress: true,
    });

    const htmlContent = response.data;

    // Шукаємо дані плеєра за допомогою регулярних виразів
    const playerData = {};

    // Використовуємо регулярні вирази для пошуку параметрів плеєра
    const idMatch = htmlContent.match(/id:\s*"([^"]+)"/);
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
    if (fileMatch[1].includes('webm')) {
      const data = {};
      const temp_ = fileMatch[1].split(',');
      temp_.forEach(item => {
        const quality = item.match(/\[(.*?)\]/)?.[1];
        if (quality) data[quality] = item.split(']')[1];
      });
      fileMatch[1] = data;
    }
    const posterMatch = htmlContent.match(/poster:\s*"([^"]+)"/);
    const subtitleMatch = htmlContent.match(/subtitle:\s*"([^"]+)"/);
    const forbiddenQualityMatch = htmlContent.match(
      /forbidden_quality:\s*"([^"]+)"/,
    );
    const defaultQualityMatch = htmlContent.match(
      /default_quality:\s*"([^"]+)"/,
    );

    // Заповнюємо об'єкт даними, якщо вони знайдені
    if (idMatch) playerData.id = idMatch[1];
    if (fileMatch) playerData.file = fileMatch[1];
    if (posterMatch) playerData.poster = posterMatch[1];
    if (subtitleMatch) playerData.subtitle = subtitleMatch[1];
    if (forbiddenQualityMatch)
      playerData.forbiddenQuality = forbiddenQualityMatch[1];
    if (defaultQualityMatch) playerData.defaultQuality = defaultQualityMatch[1];

    // Перевіряємо, чи знайдено хоча б один параметр
    return Object.keys(playerData).length > 0 ? playerData : null;
  } catch (error) {
    console.error('Помилка при отриманні даних плеєра:', error);
    return {success: false, error: 'no_player_data_found'};
  }
}

const getTotalMs = async tsFilesCount => {
  const avgTsDuration = 10000;
  return tsFilesCount * avgTsDuration;
};

function dataToQuality(data) {
  const qualityMatches = [
    ...data.matchAll(
      /#EXT-X-STREAM-INF.*RESOLUTION=\d+x(\d+).*?\n(https:\/\/[^\s]+)/g,
    ),
  ];

  if (qualityMatches.length === 0) {
    return {success: false, error: 'no_quality_options_found'};
  }

  const availableQualities = qualityMatches.map(match => ({
    quality: match[1] + 'p',
    url: match[2],
  }));

  return {success: true, data: availableQualities};
}

function dataToTsLinks(data, baseUrl = '') {
  const tsLinks =
    baseUrl.length > 0
      ? [...data.matchAll(/#EXTINF:[^,]*,\s*([^\s]+\.ts)/g)].map(
          match => baseUrl + '/' + match[1],
        )
      : [...data.matchAll(/(https:\/\/[^\s]+\.ts)/g)].map(match => match[1]);
  console.log(tsLinks, 'tsLinks');

  if (tsLinks.length === 0) {
    return {success: false, error: 'no_ts_segments_found'};
  }

  return {success: true, data: tsLinks};
}

class FFprobe {
  #jsonData = {};
  constructor(url) {
    this.url = url;
  }

  async getMediaInformation() {
    try {
      const session = await FFprobeKit.getMediaInformation(this.url);
      const output = await session.getOutput();
      this.#jsonData = JSON.parse(output || '{}');
    } catch (error) {
      console.error('Помилка при отриманні інформації про медіа:', error);
      this.#jsonData = {};
    }
  }

  async getOriginalDuration() {
    if (!this.#jsonData.format) {
      await this.getMediaInformation();
    }

    return this.#jsonData.format?.duration || 0;
  }

  async getDuration(ms) {
    const totalSeconds = Math.round(ms || (await this.getOriginalDuration()));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = num => String(num).padStart(2, '0');

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  async getSize() {
    if (!this.#jsonData.format) {
      await this.getMediaInformation();
    }
    return this.#jsonData.format?.size || 0;
  }
}

function msToTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = num => String(num).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function timeToMs(time) {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

const randNumber = (num = 16) => Math.floor(Math.random() * num);
