import {View, Text} from 'react-native';
import React from 'react';
import {Dimensions} from 'react-native';

export function GetScreenHeight() {
  return Dimensions.get('window').height; // Получаем высоту экрана
}
export function GetScreenWidth() {
  return (screenWidth = Dimensions.get('window').width); // Получаем ширину экрана
}

export function getStudioByIndex(index) {
  const studios = Object.entries(data.moon);
  if (index < 0 || index >= studios.length) {
    return {error: 'Студія не знайдена'};
  }
  const [name, content] = studios[index];
  return {name, content};
}

export function $(obj) {
  return Object.keys(obj);
}

export function TransformToCompactJson(data) {
  const result = {};

  for (const [source, shows] of Object.entries(data)) {
    if (typeof shows !== 'object' || shows === null) {
      continue; // Пропускаем, если значение не является объектом
    }

    for (const [show, episodes] of Object.entries(shows)) {
      if (!Array.isArray(episodes)) {
        continue; // Пропускаем, если значение не является массивом
      }

      for (const episodeData of episodes) {
        const episodeNum = episodeData.episode;
        const videoUrl = episodeData.video_url;

        if (episodeNum == null || videoUrl == null) {
          continue; // Пропускаем, если отсутствуют ключи "episode" или "video_url"
        }

        if (!result[episodeNum]) {
          result[episodeNum] = {episode: episodeNum, [show]: {}};
        }

        if (!result[episodeNum][show]) {
          result[episodeNum][show] = {};
        }

        result[episodeNum][show][source] = videoUrl;
      }
    }
  }

  return Object.values(result);
}

/**
 * Очищує рядок від символів, неприпустимих у шляхах та іменах файлів
 * @param {string} filename - Назва файлу для очищення
 * @param {boolean} transliterate - Чи транслітерувати кирилицю (за замовчуванням - true)
 * @param {string} replacement - Символ для заміни неприпустимих символів (за замовчуванням - "_")
 * @returns {string} - Очищена назва файлу
 */
export function sanitizeFileName(
  filename,
  transliterate = true,
  replacement = '_',
) {
  if (!filename) return '';

  // Заборонені символи у більшості ОС
  const forbiddenChars = /[\\/:*?"<>|]/g;

  // Заміна заборонених символів
  let sanitized = filename.replace(forbiddenChars, replacement);

  // Заміна пробілів на вказаний символ заміни
  sanitized = sanitized.replace(/\s+/g, replacement);

  // Транслітерація кирилиці на латиницю
  if (transliterate) {
    const cyrillic =
      'абвгґдеєжзиіїйклмнопрстуфхцчшщьюяАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ';
    const latin =
      'abvggdeezzyiiyklmnoprstufhtschsh_yuiaABVGGDEEZZYIIYKLMNOPRSTUFHTSCHSH_YUIA';

    sanitized = sanitized
      .split('')
      .map(char => {
        const index = cyrillic.indexOf(char);
        return index >= 0 ? latin[index] : char;
      })
      .join('');
  }

  // Видалення контрольних символів і спеціальних послідовностей
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

  // Видалення початкових та кінцевих пробілів і крапок
  sanitized = sanitized.trim().replace(/\.+$/g, '');

  // Перевірка на зарезервовані імена файлів у Windows
  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
  if (reservedNames.test(sanitized)) {
    sanitized = replacement + sanitized;
  }

  // Якщо після очищення нічого не залишилось
  if (sanitized.length === 0) {
    sanitized = 'file';
  }

  return sanitized;
}

/**
 * Відкриває файл з діалогом вибору додатків
 * @param {string} filePath - шлях до файлу
 * @param {string} mimeType - MIME тип файлу (за замовчуванням 'video/*')
 * @returns {Promise<void>}
 */
export async function openFileWithChooser(filePath, mimeType = 'video/*') {
  const FileOpener = require('./FileOpener').default;
  return await FileOpener.openFile(filePath, mimeType);
}
