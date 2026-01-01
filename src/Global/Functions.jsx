import { Dimensions } from "react-native";
import Logger from "../Logger/Logger";

/**
 * Повертає висоту екрану в пікселях
 * @returns {number} Висота екрану
 */
export function GetScreenHeight() {
  return Dimensions.get("window").height;
}

/**
 * Повертає ширину екрану в пікселях
 * @returns {number} Ширина екрану
 */
export function GetScreenWidth() {
  return Dimensions.get("window").width;
}

/**
 * DEPRECATED: Функція не використовується (data.moon не існує)
 * Отримує студію за індексом з об'єкта data.moon
 * @deprecated
 */
export function getStudioByIndex(index) {
  const studios = Object.entries(data.moon);
  if (index < 0 || index >= studios.length) {
    return { error: "Студія не знайдена" };
  }
  const [name, content] = studios[index];
  return { name, content };
}

/**
 * Повертає масив ключів об'єкта (алліас для Object.keys)
 * @param {Object} obj - Об'єкт для отримання ключів
 * @returns {string[]} Масив ключів
 */
export function $(obj) {
  return Object.keys(obj);
}

/**
 * Трансформує дані епізодів з різних джерел (moon, ashdi) у компактний формат
 *
 * Вхідний формат:
 * {
 *   moon: { "Dubbing Studio": [{ episode: 1, video_url: "url1" }] },
 *   ashdi: { "Another Studio": [{ episode: 1, video_url: "url2" }] }
 * }
 *
 * Вихідний формат:
 * [
 *   { episode: 1, "Dubbing Studio": { moon: "url1" }, "Another Studio": { ashdi: "url2" } }
 * ]
 *
 * @param {Object} data - Об'єкт з даними епізодів від різних провайдерів
 * @returns {Array} Масив епізодів у компактному форматі
 */
export function TransformToCompactJson(data) {
  if (!data || (!data.moon && !data.ashdi)) {
    return [];
  }

  const result = {};

  for (const [source, shows] of Object.entries(data)) {
    if (typeof shows !== "object" || shows === null) {
      continue;
    }

    for (const [show, episodes] of Object.entries(shows)) {
      if (!Array.isArray(episodes)) {
        continue;
      }

      for (const episodeData of episodes) {
        const episodeNum = episodeData.episode;
        const videoUrl = episodeData.video_url;

        if (episodeNum == null || videoUrl == null) {
          continue;
        }

        if (!result[episodeNum]) {
          result[episodeNum] = { episode: episodeNum, [show]: {} };
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
 * Очищує назву файлу від заборонених символів та робить її безпечною для файлової системи
 *
 * Виконує наступні операції:
 * - Видаляє заборонені символи (\/:*?"<>|)
 * - Замінює пробіли на вказаний символ
 * - Транслітерує українську кирилицю на латиницю
 * - Видаляє контрольні символи
 * - Обробляє зарезервовані імена Windows (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
 *
 * @param {string} filename - Вихідна назва файлу
 * @param {boolean} [transliterate=true] - Чи виконувати транслітерацію кирилиці
 * @param {string} [replacement="_"] - Символ для заміни неприпустимих символів
 * @returns {string} Очищена та безпечна назва файлу
 *
 * @example
 * sanitizeFileName("Аніме: Моє життя/2024.mp4")
 * // => "Anime_Moe_zhyttia_2024.mp4"
 */
export function sanitizeFileName(
  filename,
  transliterate = true,
  replacement = "_"
) {
  if (!filename) return "";

  const forbiddenChars = /[\\/:*?"<>|]/g;
  let sanitized = filename.replace(forbiddenChars, replacement);
  sanitized = sanitized.replace(/\s+/g, replacement);

  if (transliterate) {
    const cyrillic =
      "абвгґдеєжзиіїйклмнопрстуфхцчшщьюяАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";
    const latin =
      "abvggdeezzyiiyklmnoprstufhtschsh_yuiaABVGGDEEZZYIIYKLMNOPRSTUFHTSCHSH_YUIA";

    sanitized = sanitized
      .split("")
      .map((char) => {
        const index = cyrillic.indexOf(char);
        return index >= 0 ? latin[index] : char;
      })
      .join("");
  }

  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f,，]/g, "");
  sanitized = sanitized.trim().replace(/\.+$/g, "");

  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
  if (reservedNames.test(sanitized)) {
    sanitized = replacement + sanitized;
  }

  if (sanitized.length === 0) {
    sanitized = "file";
  }

  Logger.debug("sanitizeFileName", "info", { sanitized });

  return sanitized;
}

/**
 * Відкриває файл через системний діалог вибору додатків
 *
 * @param {string} filePath - Повний шлях до файлу в файловій системі
 * @param {string} [mimeType="video/*"] - MIME тип файлу для фільтрації додатків
 * @returns {Promise<void>}
 *
 * @example
 * await openFileWithChooser("/storage/emulated/0/video.mp4", "video/*")
 */
export async function openFileWithChooser(filePath, mimeType = "video/*") {
  const FileOpener = require("./FileOpener").default;
  return await FileOpener.openFile(filePath, mimeType);
}
