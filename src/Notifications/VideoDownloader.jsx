import React, { useState, useEffect } from "react";
import { Alert, ActivityIndicator, View, Text } from "react-native";
import {
  FFmpegKit,
  FFprobeKit,
  FFmpegKitConfig,
} from "ffmpeg-kit-react-native";
import axios from "axios";
import { getVideoDir } from "../FIleSystem/FileSystem";
import { sanitizeFileName } from "../Global/Functions";
import { DEBUGCONFIG } from "../cfgs/DebugConfig";
import notifee from "@notifee/react-native";
import { primary } from "../Styles/Colors";
import Color from "color";
import SettingsStorage from "../Storage/SettingsStorage";
import RNFS from "react-native-fs";
import { EventBus } from "../Global/EventBus";
import { hasAtLeastOneGBFree } from "../FIleSystem/FileSystem";
import Logger from "../Logger/Logger";

// Налаштування FFmpeg для відключення логів
FFmpegKitConfig.setLogLevel(FFmpegKitConfig.LEVEL_QUIET);
FFmpegKitConfig.enableLogCallback(() => {});
FFmpegKitConfig.enableStatisticsCallback(() => {});

export const STATUSES = {
  downloading: "Завантаження серії",
  downloading_m3u8_witch_quality_url: "Завантаження файлу з якістю",
  parsing_m3u8_witch_quality: "Аналіз файлу",
  getting_additional_information: "Отримання додаткової інформації",
  quality_selection: "Вибір найвищої якості",
  downloading_and_splicing_clips: "Завантаження серії",
  success: "Серія завантажена",
  error: "Помилка завантаження",
  no_free_space_on_device: "Недостатньо вільного місця на пристрої",
};

export default async function DownloadVideoNotification({
  animeName = "Anime Name",
  episodeNumber = 0,
  progress = 0,
  typeOfProgress = "",
}) {
  Logger.debug("DownloadVideoNotification", "Called with params", {
    animeName,
    episodeNumber,
    progress,
    typeOfProgress,
  });

  // Create a channel (required for Android)
  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  const appColorHex = Color(primary).hex();

  Logger.debug("DownloadVideoNotification", "Using channel ID", {
    activeChannelId,
  });

  const channelId = await notifee.createChannel({
    id: activeChannelId,
    name: "AniUA",
    importance: 3, // HIGH
  });

  Logger.debug("DownloadVideoNotification", "Channel created", { channelId });

  // Оголошуємо змінну поза блоком try
  let notificationId = null;

  // Display a notification
  try {
    Logger.debug(
      "DownloadVideoNotification",
      "Attempting to display notification"
    );
    notificationId = await notifee.displayNotification({
      title: `Завантаження ${animeName} - ${episodeNumber}`,
      body: `${typeOfProgress} - ${progress}%`,
      android: {
        channelId: activeChannelId,
        asForegroundService: true,
        pressAction: {
          id: "default",
        },
        progress: {
          max: 100,
          current: progress,
          indeterminate: progress === 0,
        },
        smallIcon: "ic_stat_aniua",
        color: appColorHex,
        ongoing: true,
        autoCancel: false,
        swipeAction: {
          action: "dismiss",
        },
      },
    });
    Logger.info(
      "DownloadVideoNotification",
      "Notification displayed successfully",
      { notificationId }
    );
  } catch (error) {
    Logger.error(
      "DownloadVideoNotification",
      "Error displaying notification",
      error
    );
    notificationId = null;
  }

  // Єдиний return в кінці функції
  Logger.debug("DownloadVideoNotification", "Returning notification ID", {
    notificationId,
  });
  return notificationId;
}

// Додаємо нову функцію для оновлення прогресу
export async function updateDownloadProgress({
  notificationId,
  animeName,
  episodeNumber,
  progress,
  typeOfProgress = "",
  ffmpegSessionId,
}) {
  Logger.debug("updateDownloadProgress", "Called with params", {
    notificationId,
    animeName,
    episodeNumber,
    progress,
    typeOfProgress,
  });

  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  const appColorHex = Color(primary).hex();

  try {
    await notifee.displayNotification({
      id: notificationId,
      title: `Завантаження ${animeName} - ${episodeNumber} серія`,
      body: `${typeOfProgress} - ${progress}%`,
      data: {
        ffmpegSessionId: ffmpegSessionId ? String(ffmpegSessionId) : "",
        action: "cancel_download",
      },
      android: {
        channelId: activeChannelId,
        asForegroundService: true,
        progress: {
          max: 100,
          current: progress,
          indeterminate: progress === 0,
        },
        smallIcon: "ic_stat_aniua",
        color: appColorHex,
        ongoing: true,

        pressAction: {
          id: "cancel_download",
        },
        actions: [
          {
            title: "Скасувати",
            pressAction: {
              id: "cancel_download",
            },
          },
        ],
      },
    });
    Logger.debug("updateDownloadProgress", "Notification updated successfully");
  } catch (error) {
    Logger.error(
      "updateDownloadProgress",
      "Error updating notification",
      error
    );
  }
}

// Додаємо нову функцію для завершення завантаження
export async function completeDownloadNotification({
  notificationId,
  animeName,
  episodeNumber,
  savedEpisodeData,
}) {
  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  const appColorHex = Color(primary).hex();
  await notifee.displayNotification({
    id: notificationId,
    title: `Завантаження завершено`,
    body: `${animeName} - ${episodeNumber} серія`,
    data: {
      animeName,
      episodeNumber,
      savedEpisodeData,
      action: "open_downloaded_video",
    },
    android: {
      channelId: activeChannelId,
      smallIcon: "ic_stat_aniua",
      color: appColorHex,
      ongoing: false,
      autoCancel: true,
      swipeAction: {
        action: "dismiss",
      },
      pressAction: {
        id: "open_downloaded_video",
        launchActivity: "default",
      },
      actions: [
        {
          title: "Відкрити",
          pressAction: {
            id: "open_downloaded_video",
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
  const errorMessage = Array.isArray(error) ? error.join("; ") : String(error);
  const activeChannelId =
    (SettingsStorage.getParameter &&
      SettingsStorage.getParameter("notificationsChannelId")) ||
    "AniUA";
  const appColorHex = Color(primary).hex();
  await notifee.displayNotification({
    id: notificationId,
    title: `Помилка завантаження: ${animeName} - ${episodeNumber} серія`,
    body: `Подробиці: ${STATUSES[errorMessage] || errorMessage.substring(0, 200)}`,
    android: {
      channelId: activeChannelId,
      smallIcon: "ic_stat_aniua",
      color: appColorHex,
      ongoing: false,
      autoCancel: true,
      swipeAction: {
        action: "dismiss",
      },
      pressAction: {
        id: "download_video_error",
      },
    },
    data: {
      animeName,
      episodeNumber,
      errorDetails: errorMessage,
      action: "download_video_error",
    },
  });
}

// добавити перевірку на тип файлу, та розподіляти, яку функцію викликати
export async function DownloadVideo({
  item,
  anime,
  info,
  onStartDownloadCallback,
  progressCallback,
  completionCallback,
  errorCallback,
}) {
  const progressInfo = {
    status: "",
    data: {
      progress: 0,
      data: [],
    },
    already_done: [],
  };

  if (onStartDownloadCallback) {
    onStartDownloadCallback();
  }

  // Створюємо сповіщення при старті завантаження
  let notificationId = await DownloadVideoNotification({
    animeName: anime.title_ua,
    episodeNumber: item.episode,
    progress: 0,
    typeOfProgress: STATUSES.downloading,
  });

  Logger.info("DownloadVideo", "Initial notification created", {
    notificationId,
  });

  if (!notificationId) {
    Logger.error("DownloadVideo", "Failed to create initial notification");
  }

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

    // Глобальна емісія статусу завантаження для UI по конкретному епізоду
    try {
      EventBus.emit("downloadProgress", {
        slug: anime?.slug,
        episode: item?.episode,
        status,
        progress: typeof data?.progress === "number" ? data.progress : 0,
      });
    } catch {}

    // Оновлюємо сповіщення при кожному оновленні статусу
    if (notificationId) {
      var savedEpisodeData = {
        episode: item.episode,
        player: info?.player,
        dubbing: info?.dub_team,
        quality: data.quality,
        url: { homeUrl: item.video_url, playerUrl: data.url },
        video_path: data.path,
        video_type: "mp4",
      };
      if (status === "success") {
        completeDownloadNotification({
          notificationId,
          animeName: anime.title_ua,
          episodeNumber: item.episode,
          savedEpisodeData,
        });
        // Емісія завершення (success)
        try {
          EventBus.emit("downloadProgress", {
            slug: anime?.slug,
            episode: item?.episode,
            status: "success",
            progress: 100,
          });
        } catch {}
        if (completionCallback) {
          if (!info.downloaded_episodes) info.downloaded_episodes = [];

          info.downloaded_episodes.push(savedEpisodeData);
          completionCallback(info);
        }
      } else if (status === "error") {
        errorDownloadNotification({
          notificationId,
          animeName: anime.title_ua,
          episodeNumber: item.episode,
          error: data.data,
        });
        if (errorCallback) {
          errorCallback(data.data, item, anime);
        }
        try {
          EventBus.emit("downloadProgress", {
            slug: anime?.slug,
            episode: item?.episode,
            status: "error",
            progress: -1,
          });
        } catch {}
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

    // Виправлено порядок - спочатку визначаємо nameOfFile
    const nameOfFile = `${sanitizeFileName(
      `${anime.title_ua.length > 120 ? anime.title_en.substring(0, 120) : anime.title_ua}-=(${info?.watched?.player}-${info?.watched?.dubbing}-${item.episode}).mp4`,
      false
    )}`;
    let selectedQuality = {};
    let tsLinks = [];
    let duration;
    let pathToSaveEpisodes = await getVideoDir();

    // Спочатку створюємо змінну outputPath
    let outputPath = `${pathToSaveEpisodes}/${sanitizeFileName(
      `${anime.title_ua.length > 120 ? anime.title_en.substring(0, 120) : anime.title_ua}`,
      false
    )}/`;

    // Потім перевіряємо чи існує папка
    try {
      if (!(await RNFS.exists(outputPath))) {
        await RNFS.mkdir(outputPath);
      }
    } catch (error) {
      // Ігноруємо помилку, якщо папка вже існує
      if (!error.message.includes("already exists")) {
        throw error;
      }
    }

    if (!(await hasAtLeastOneGBFree())) {
      updateStatus("error", {
        progress: -1,
        data: ["no_free_space_on_device"],
      });
      return { success: false, error: "no_free_space_on_device" };
    }

    // Додаємо ім'я файлу до шляху
    outputPath += nameOfFile;

    // 1. Отримання M3U8 файла з описом якостей
    updateStatus("downloading_m3u8_witch_quality_url", {
      progress: 20 + randNumber(16),
      data: [nameOfFile, item.video_url],
    });
    let playerResponse = item.video_url.includes("moon")
      ? await getPlayerDataFrom_MOON_Player(item.video_url)
      : await getPlayerDataFrom_ASHDI_Player(item.video_url);

    // Перевірка на помилки або відсутність даних плеєра
    if (!playerResponse || playerResponse.success === false) {
      updateStatus("error", {
        progress: -1,
        data: [playerResponse?.error || "no_player_data_found"],
      });
      return {
        success: false,
        error: playerResponse?.error || "no_player_data_found",
      };
    }

    if (!playerResponse.file) {
      updateStatus("error", {
        progress: -1,
        data: ["no_video_file_found"],
      });
      return { success: false, error: "no_video_file_found" };
    }

    if (
      Object.values(playerResponse.file).some((url) => url.includes("webm"))
    ) {
      selectedQuality.url =
        playerResponse.file["1080p"] ||
        playerResponse.file["720p"] ||
        playerResponse.file["480p"] ||
        playerResponse.file["360p"];
      selectedQuality.quality = playerResponse.file["1080p"]
        ? "1080p"
        : playerResponse.file["720p"]
          ? "720p"
          : playerResponse.file["480p"]
            ? "480p"
            : playerResponse.file["360p"]
              ? "360p"
              : "";

      const ffprobe = new FFprobe(selectedQuality.url);
      await ffprobe.getMediaInformation();
      duration = (await ffprobe.getOriginalDuration()) || 0;
    } else {
      let response = await axios.get(playerResponse.file, {
        headers: {
          "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
        },
        decompress: true,
      });

      // 2. Парсинг доступних якостей
      updateStatus("parsing_m3u8_witch_quality", {
        progress: 40 + randNumber(16),
        data: [response.data],
      });
      var { success, data: availableQualities } = dataToQuality(response.data);
      if (!success) {
        updateStatus("error", {
          progress: -1,
          data: ["no_quality_options_found"],
        });

        return { success: false, error: "no_quality_options_found" };
      }

      // 3. Вибір якості (обираємо найвищу за замовчуванням)
      updateStatus("quality_selection", {
        progress: 60 + randNumber(16),
        data: [availableQualities],
      });
      selectedQuality = availableQualities[0]; // Найвища якість

      updateStatus("quality_selection", {
        progress: 80 + randNumber(16),
        data: [selectedQuality],
      });

      // Отримуємо інформацію про TS сегменти для розрахунку прогресу
      const qualityM3U8Response = await axios.get(selectedQuality.url, {
        headers: {
          "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
        },
        decompress: true,
      });

      // Розбираємо базовий URL для TS файлів
      const baseUrl = selectedQuality.url.substring(
        0,
        selectedQuality.url.lastIndexOf("/")
      );

      // Отримуємо список TS файлів
      const tsLinksResult = dataToTsLinks(qualityM3U8Response.data, baseUrl);
      if (!tsLinksResult.success) {
        updateStatus("error", { progress: -1, data: ["no_ts_segments_found"] });
        return { success: false, error: "no_ts_segments_found" };
      }
      tsLinks = tsLinksResult.data;

      updateStatus("getting_additional_information", {
        progress: 100,
        data: [tsLinks],
      });
    }

    const command = `-i "${selectedQuality.url}" -c copy "${outputPath}" -y`;

    await FFmpegKit.executeAsync(
      command,
      async (session) => {
        if (!session) {
          Logger.error("DownloadVideo", "FFmpegKit session is null");
          updateStatus("error", {
            progress: -1,
            data: ["FFmpegKit session is null"],
          });
          return { success: false, error: "FFmpegKit session is null" };
        }
        const returnCode = await session.getReturnCode();
        const outputFileExists = await RNFS.exists(outputPath);

        const isSavedEpisode = await RNFS.exists(outputPath);

        if (returnCode.isValueSuccess() && outputFileExists && isSavedEpisode) {
          updateStatus("success", {
            progress: 100,
            path: outputPath,
            url: selectedQuality.url,
            quality: selectedQuality.quality,
          });
          return { success: true, path: outputPath };
        } else if (returnCode.getValue() === 255) {
          updateStatus("error", {
            progress: -1,
            data: [
              "Помилка при завантаженні серії: відміна завантаження серії",
            ],
          });
          return { success: false, error: "Помилка при завантаженні серії" };
        } else if (!returnCode.isValueSuccess()) {
          Logger.error("DownloadVideo", "FFmpeg завершився з помилкою", {
            returnCode: returnCode.getValue(),
          });
          const logs = await session.getAllLogs();
          updateStatus("error", {
            progress: -1,
            data: [logs],
          });
          return { success: false, error: logs };
        } else if (!isSavedEpisode) {
          updateStatus("error", {
            progress: -1,
            data: ["Файл не було створено після завершення FFmpeg"],
          });
          return {
            success: false,
            error: "Файл не було створено після завершення FFmpeg",
          };
        } else {
          updateStatus("error", {
            progress: -1,
            data: [
              "Помилка при завантаженні серії",
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
          return { success: false, error: "Помилка при завантаженні серії" };
        }
      },
      (log) => {},
      async (statistics) => {
        const time = statistics.getTime();
        let pct = 0;

        if (selectedQuality.url.includes("webm")) {
          pct = Math.max(
            0,
            Math.min(Math.floor((time / 1000 / duration) * 100), 100)
          );
        } else {
          const totalMs = await getTotalMs(tsLinks.length);
          const factor = item.video_url.includes("moon") ? 100 : 200;
          pct = Math.max(
            0,
            Math.min(Math.floor((time / totalMs) * factor), 100)
          );
        }
        updateStatus("downloading_and_splicing_clips", {
          progress: pct,
          ffmpegSessionId: await statistics.getSessionId(),
          data: [time, pct],
        });
      }
    );

    // Важливо дочекатися завершення сесії
  } catch (error) {
    updateStatus("error", {
      progress: -1,
      data: [error && error.message ? error.message : String(error)],
    });

    Logger.error("DownloadVideo", "Помилка завантаження відео", error);
    return {
      success: false,
      error: error && error.message ? error.message : String(error),
    };
  }
}

// Функція отримання даних плеєра
async function getPlayerDataFrom_ASHDI_Player(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
      },
      decompress: true,
    });
    const htmlContent = response.data;

    // Спробуємо різні патерни для пошуку файлу
    let fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);

    // Альтернативний патерн з одинарними лапками
    if (!fileMatch) {
      fileMatch = htmlContent.match(/file:\s*'([^']+)'/);
    }

    // Альтернативний патерн без пробілів
    if (!fileMatch) {
      fileMatch = htmlContent.match(/file:"([^"]+)"/);
    }

    if (!fileMatch) {
      if (DEBUGCONFIG.isDebug) {
        Logger.error(
          "ASHDI_Player",
          "Не знайдено файл у відповіді ashdi плеєра"
        );
        Logger.debug("ASHDI_Player", "HTML content preview", {
          preview: htmlContent.substring(0, 500),
        });
      }
      return { success: false, error: "no_player_data_found" };
    }

    let file = fileMatch[1];

    // Обробка формату webm (як у moon плеєрі)
    if (file.includes("webm")) {
      const data = {};
      const temp_ = file.split(",");
      temp_.forEach((item) => {
        const quality = item.match(/\[(.*?)\]/)?.[1];
        if (quality) data[quality] = item.split("]")[1];
      });
      file = data;
    }

    return { file };
  } catch (error) {
    if (DEBUGCONFIG.isDebug) {
      Logger.error("ASHDI_Player", "Помилка завантаження ashdi плеєра", error);
    }
    return { success: false, error: "no_player_data_found" };
  }
}

export async function getPlayerDataFrom_MOON_Player(url) {
  try {
    // Отримуємо HTML-контент за посиланням
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
      },
      decompress: true,
    });

    const htmlContent = response.data;

    // Шукаємо дані плеєра за допомогою регулярних виразів
    const playerData = {};

    // Використовуємо регулярні вирази для пошуку параметрів плеєра
    const idMatch = htmlContent.match(/id:\s*"([^"]+)"/);
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
    if (fileMatch[1].includes("webm")) {
      const data = {};
      const temp_ = fileMatch[1].split(",");
      temp_.forEach((item) => {
        const quality = item.match(/\[(.*?)\]/)?.[1];
        if (quality) data[quality] = item.split("]")[1];
      });
      fileMatch[1] = data;
    }
    const posterMatch = htmlContent.match(/poster:\s*"([^"]+)"/);
    const subtitleMatch = htmlContent.match(/subtitle:\s*"([^"]+)"/);
    const forbiddenQualityMatch = htmlContent.match(
      /forbidden_quality:\s*"([^"]+)"/
    );
    const defaultQualityMatch = htmlContent.match(
      /default_quality:\s*"([^"]+)"/
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
    Logger.error("MOON_Player", "Помилка при отриманні даних плеєра", error);
    return { success: false, error: "no_player_data_found" };
  }
}

const getTotalMs = async (tsFilesCount) => {
  const avgTsDuration = 10000;
  return tsFilesCount * avgTsDuration;
};

function dataToQuality(data) {
  const qualityMatches = [
    ...data.matchAll(
      /#EXT-X-STREAM-INF.*RESOLUTION=\d+x(\d+).*?\n(https:\/\/[^\s]+)/g
    ),
  ];

  if (qualityMatches.length === 0) {
    return { success: false, error: "no_quality_options_found" };
  }

  const availableQualities = qualityMatches.map((match) => ({
    quality: match[1] + "p",
    url: match[2],
  }));

  return { success: true, data: availableQualities };
}

function dataToTsLinks(data, baseUrl = "") {
  const tsLinks =
    baseUrl.length > 0
      ? [...data.matchAll(/#EXTINF:[^,]*,\s*([^\s]+\.ts)/g)].map(
          (match) => baseUrl + "/" + match[1]
        )
      : [...data.matchAll(/(https:\/\/[^\s]+\.ts)/g)].map((match) => match[1]);

  if (tsLinks.length === 0) {
    return { success: false, error: "no_ts_segments_found" };
  }

  return { success: true, data: tsLinks };
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
      this.#jsonData = JSON.parse(output || "{}");
    } catch (error) {
      Logger.error(
        "FFprobe",
        "Помилка при отриманні інформації про медіа",
        error
      );
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

    const pad = (num) => String(num).padStart(2, "0");

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

  const pad = (num) => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function timeToMs(time) {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

const randNumber = (num = 16) => Math.floor(Math.random() * num);
