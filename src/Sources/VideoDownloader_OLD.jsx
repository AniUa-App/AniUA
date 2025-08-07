import React, {useState, useEffect} from 'react';
import {Alert, ActivityIndicator, View, Text} from 'react-native';
import {FFmpegKit} from 'ffmpeg-kit-react-native';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import {sanitizeFileName} from '../Global/Functions';
import {DEBUGCONFIG} from '../cfgs/DebugConfig';

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
    resolution: match[1] + 'p',
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
// добавити перевірку на тип файлу, та розподіляти, яку функцію викликати
export async function DownloadVideo(
  url,
  path,
  progressCallback,
  completionCallback,
) {
  const pathToSaveEpisodes = SettingsStorage.getParameter('pathToSaveEpisodes');
}

export async function DownloadM3U8Video(
  url,
  path,
  progressCallback,
  completionCallback,
) {
  console.log(`DownloadVideo: ${url}`);
  // Функція для сповіщення про зміни статусу та прогрес
  const progressInfo = {
    status: '',
    data: {
      progress: 0,
      data: [],
    },
    already_done: [],
  };
  const updateStatus = (status, data = {}) => {
    if (progressCallback) {
      progressInfo.status = status;
      progressInfo.data = {
        progress: data.progress || 0, // Забезпечуємо правильну структуру
        data: data.data || [],
      };
      progressInfo.already_done.push({
        status: status,
        data: data,
      });
      progressCallback(progressInfo);
    }
  };

  try {
    const path_ = `${sanitizeFileName(path, false)}`;
    // 1. Отримання M3U8 файла з описом якостей
    updateStatus('downloading_m3u8_witch_quality_url', {
      progress: 0,
      data: [path_, url],
    });
    let playerResponse = url.includes('moon')
      ? await getPlayerDataFrom_MOON_Player(url)
      : await getPlayerDataFrom_ASHDI_Player(url);
    let response = await axios.get(playerResponse.file, {
      headers: {
        'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
      },
      decompress: true,
    });

    updateStatus('downloading_m3u8_witch_quality_url', {
      progress: 100,
      data: [response.data],
    });

    // 2. Парсинг доступних якостей
    updateStatus('parsing_m3u8_witch_quality', {
      progress: 0,
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

    updateStatus('parsing_m3u8_witch_quality', {
      progress: 100,
      data: [availableQualities],
    });

    // 3. Вибір якості (обираємо найвищу за замовчуванням)
    updateStatus('wait_for_quality_selection', {
      progress: 0,
      data: [availableQualities],
    });
    const selectedQuality = availableQualities[availableQualities.length - 1]; // Найвища якість
    console.log(selectedQuality, 'selectedQuality');

    // // 4. Отримання плейлиста для вибраної якості
    // updateStatus('parsing_clips', {
    //   progress: 0,
    //   data: [selectedQuality],
    // });

    // const qualityResponse = await axios.get(
    //   selectedQuality.url,
    //   url.includes('moon')
    //     ? {
    //         headers: {
    //           'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
    //         },
    //         decompress: true,
    //       }
    //     : {},
    // );
    // if (DEBUGCONFIG.isDebug) {
    //   console.log(playerResponse.file.replace('index.m3u8', ''));
    // }
    // var {success, data: tsLinks} = dataToTsLinks(
    //   qualityResponse.data,
    //   url.includes('moon') ? playerResponse.file.replace('index.m3u8', '') : '',
    // );
    // console.log(tsLinks, 'tsLinks');

    // if (!success) {
    //   updateStatus('error', {
    //     progress: -1,
    //     data: ['no_ts_segments_found'],
    //   });
    //   return {success: false, error: 'no_ts_segments_found'};
    // }

    // updateStatus('parsing_clips', {
    //   progress: 100,
    //   data: [qualityResponse.data, tsLinks],
    // });

    // // 5. Завантаження відео фрагментів
    // updateStatus('downloading_clips', {
    //   progress: 0,
    //   data: [],
    // });

    // const videoDir = `${RNFetchBlob.fs.dirs.CacheDir}/video_parts`;

    // // Перевіряємо і створюємо директорію, якщо вона не існує
    // const dirExists = await RNFetchBlob.fs.exists(videoDir);
    // if (!dirExists) {
    //   await RNFetchBlob.fs.mkdir(videoDir);
    // }

    // // Додаємо додаткову перевірку директорії після створення
    // const checkDirExists = await RNFetchBlob.fs.exists(videoDir);
    // console.log(`Директорія ${videoDir} існує: ${checkDirExists}`);

    // const downloadedFiles = [];
    // const fileListPath = `${videoDir}/filelist.txt`;
    // for (let i = 0; i < tsLinks.length; i++) {
    //   try {
    //     const tsPath = `${videoDir}/part${i}.ts`;
    //     await RNFetchBlob.config({path: tsPath}).fetch('GET', tsLinks[i]);

    //     // Перевіряємо, чи файл дійсно завантажився і існує
    //     const fileExists = await RNFetchBlob.fs.exists(tsPath);
    //     if (!fileExists) {
    //       console.error(`Файл ${tsPath} не існує після завантаження`);
    //       continue;
    //     }

    //     console.log(`Файл ${tsPath} успішно завантажено`);

    //     // Формат для FFmpeg concat demuxer (без лапок)
    //     downloadedFiles.push(`file ${tsPath}`);

    //     // Обчислення прогресу
    //     const progress = Math.round(((i + 1) / tsLinks.length) * 100);
    //     updateStatus('downloading_clips', {
    //       progress: progress,
    //       data: [tsLinks[i]],
    //     });
    //   } catch (err) {
    //     updateStatus('error', {
    //       progress: -1,
    //       data: ['failed_to_download_any_segment', err.toString(), tsLinks[i]],
    //     });
    //     console.error(`Помилка завантаження частини ${i}:`, err);
    //   }
    // }

    // if (downloadedFiles.length === 0) {
    //   updateStatus('error', {
    //     progress: -1,
    //     data: ['failed_to_download_any_segment', downloadedFiles.length],
    //   });
    //   return {success: false, error: 'failed_to_download_any_segment'};
    // }

    // // Записуємо файл списку з правильним форматом
    // console.log('downloadedFiles', downloadedFiles);
    // await RNFetchBlob.fs.writeFile(
    //   fileListPath,
    //   downloadedFiles.join('\n'),
    //   'utf8',
    // );

    // Перевіряємо файл списку після створення
    // const fileListExists = await RNFetchBlob.fs.exists(fileListPath);
    // console.log(`Файл списку ${fileListPath} існує: ${fileListExists}`);
    // if (fileListExists) {
    //   const fileListContent = await RNFetchBlob.fs.readFile(
    //     fileListPath,
    //     'utf8',
    //   );
    //   console.log('Вміст filelist.txt:', fileListContent);
    // }

    // 6. Об'єднання фрагментів
    const outputPath = `${RNFetchBlob.fs.dirs.DownloadDir}/${path_}`;
    updateStatus('splicing_clips', {
      progress: 0,
      data: [outputPath],
    });

    console.log('Шлях для збереження:', outputPath);

    const session = FFmpegKit.executeAsync(
      `-i "${selectedQuality.url}" -c copy "${outputPath}"`,
      async session => {
        // Отримуємо логи для діагностики
        const logs = await session.getAllLogsAsString();
        console.log('FFmpeg повні логи:', logs);

        // Переконаємося, що FFmpeg завершив роботу
        const returnCode = await session.getReturnCode();
        console.log(`FFmpeg завершено з кодом: ${returnCode.getValue()}`);

        // Перевіряємо чи файл успішно створено
        const outputFileExists = await RNFetchBlob.fs.exists(outputPath);
        console.log(`Вихідний файл ${outputPath} існує: ${outputFileExists}`);

        // Тільки якщо все успішно, видаляємо тимчасові файли
        // if (returnCode.isValueSuccess() && outputFileExists) {
        //   updateStatus('deleting_temp_files', {
        //     progress: 0,
        //     data: [outputPath, fileListPath],
        //   });
        //   // Тепер безпечно видалити тимчасові файли
        //   await RNFetchBlob.fs.unlink(videoDir);

        //   // 7. Завершення - переміщено сюди з нижньої частини
        //   updateStatus('success', {
        //     progress: 100,
        //     data: [outputPath],
        //   });

        //   completionCallback &&
        //     completionCallback({success: true, filePath: outputPath});
        //   return {success: true, filePath: outputPath};
        // } else {
        //   console.error(
        //     'Помилка при обробці відео, тимчасові файли не видалено',
        //   );
        //   updateStatus('error', {
        //     progress: -1,
        //     data: ['ffmpeg_processing_failed'],
        //   });
        //   completionCallback &&
        //     completionCallback({
        //       success: false,
        //       error: 'ffmpeg_processing_failed',
        //     });
        // }
      },
      log => {},
      async statistics => {
        const time = statistics.getTime();
        const totalMs = await getTotalMs(tsLinks.length);
        const pct = Math.max(
          0,
          Math.min(Math.floor((time / totalMs) * 200), 100),
        );
        updateStatus('splicing_clips', {
          progress: pct,
          data: [time, totalMs, pct],
        });
      },
    );

    await session;

    // Повертаємо результат, але не оновлюємо статус тут, оскільки це вже зроблено в колбеку
    return {success: true, filePath: outputPath};
  } catch (error) {
    console.error('Помилка завантаження відео:', error);
    updateStatus('error', {
      progress: progressInfo.progress,
      data: [error.toString()],
    });

    return {success: false, error: error.toString()};
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
    return null;
  }
}

async function getPlayerDataFrom_MOON_Player(url) {
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
    return null;
  }
}
