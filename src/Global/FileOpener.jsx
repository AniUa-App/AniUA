import FileOpener from "react-native-file-opener";
import Logger from "../Logger/Logger";

/**
 * Обгортка для роботи з файлами
 */
class FileOpenerHelper {
  /**
   * Відкрити файл з автоматичним визначенням типу
   * @param {string} filePath - шлях до файлу
   * @returns {Promise<string>} - результат операції
   */
  static async openFile(filePath) {
    try {
      // Спочатку перевіряємо чи існує файл
      const exists = await FileOpener.checkFileExists(filePath);
      if (!exists) {
        throw new Error(`!Файл не існує: ${filePath}`);
      }

      // Отримуємо інформацію про файл
      const fileInfo = await FileOpener.getFileInfo(filePath);
      Logger.debug('FileOpener', 'Інформація про файл', { fileInfo });

      // Відкриваємо файл з автоматичним визначенням типу
      const result = await FileOpener.openFileAuto(filePath);
      Logger.info('FileOpener', 'Файл відкрито успішно', { result });
      return result;
    } catch (error) {
      Logger.error('FileOpener', 'Помилка відкриття файлу', error);
      throw error;
    }
  }

  /**
   * Відкрити файл з вказаним MIME типом
   * @param {string} filePath - шлях до файлу
   * @param {string} mimeType - MIME тип файлу
   * @returns {Promise<string>} - результат операції
   */
  static async openFileWithMimeType(filePath, mimeType) {
    try {
      const result = await FileOpener.openFile(filePath, mimeType);
      Logger.info('FileOpener', 'Файл відкрито успішно', { result });
      return result;
    } catch (error) {
      Logger.error('FileOpener', 'Помилка відкриття файлу', error);
      throw error;
    }
  }

  /**
   * Відкрити відео файл
   * @param {string} filePath - шлях до відео файлу
   * @returns {Promise<string>} - результат операції
   */
  static async openVideo(filePath) {
    const videoMimeTypes = {
      mp4: "video/mp4",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
      mov: "video/quicktime",
      wmv: "video/x-ms-wmv",
      flv: "video/x-flv",
      webm: "video/webm",
    };

    const extension = filePath.split(".").pop()?.toLowerCase();
    const mimeType = videoMimeTypes[extension] || "video/mp4";

    return this.openFileWithMimeType(filePath, mimeType);
  }

  /**
   * Відкрити аудіо файл
   * @param {string} filePath - шлях до аудіо файлу
   * @returns {Promise<string>} - результат операції
   */
  static async openAudio(filePath) {
    const audioMimeTypes = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      aac: "audio/aac",
      flac: "audio/flac",
      m4a: "audio/mp4",
    };

    const extension = filePath.split(".").pop()?.toLowerCase();
    const mimeType = audioMimeTypes[extension] || "audio/mpeg";

    return this.openFileWithMimeType(filePath, mimeType);
  }

  /**
   * Відкрити зображення
   * @param {string} filePath - шлях до зображення
   * @returns {Promise<string>} - результат операції
   */
  static async openImage(filePath) {
    const imageMimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",
    };

    const extension = filePath.split(".").pop()?.toLowerCase();
    const mimeType = imageMimeTypes[extension] || "image/jpeg";

    return this.openFileWithMimeType(filePath, mimeType);
  }

  /**
   * Відкрити документ
   * @param {string} filePath - шлях до документа
   * @returns {Promise<string>} - результат операції
   */
  static async openDocument(filePath) {
    const documentMimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      rtf: "application/rtf",
    };

    const extension = filePath.split(".").pop()?.toLowerCase();
    const mimeType = documentMimeTypes[extension] || "application/octet-stream";

    return this.openFileWithMimeType(filePath, mimeType);
  }

  /**
   * Перевірити чи існує файл
   * @param {string} filePath - шлях до файлу
   * @returns {Promise<boolean>} - чи існує файл
   */
  static async fileExists(filePath) {
    try {
      return await FileOpener.checkFileExists(filePath);
    } catch (error) {
      Logger.error('FileOpener', 'Помилка перевірки файлу', error);
      return false;
    }
  }

  /**
   * Отримати інформацію про файл
   * @param {string} filePath - шлях до файлу
   * @returns {Promise<Object>} - інформація про файл
   */
  static async getFileInfo(filePath) {
    try {
      return await FileOpener.getFileInfo(filePath);
    } catch (error) {
      Logger.error('FileOpener', 'Помилка отримання інформації про файл', error);
      throw error;
    }
  }

  /**
   * Отримати MIME тип файлу
   * @param {string} filePath - шлях до файлу
   * @returns {Promise<string>} - MIME тип
   */
  static async getMimeType(filePath) {
    try {
      return await FileOpener.getMimeType(filePath);
    } catch (error) {
      Logger.error('FileOpener', 'Помилка отримання MIME типу', error);
      throw error;
    }
  }

  /**
   * Відкрити файл залежно від його типу
   * @param {string} filePath - шлях до файлу
   * @returns {Promise<string>} - результат операції
   */
  static async openFileByType(filePath) {
    const extension = filePath.split(".").pop()?.toLowerCase();

    // Визначаємо тип файлу за розширенням
    if (
      ["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"].includes(extension)
    ) {
      return this.openVideo(filePath);
    } else if (
      ["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension)
    ) {
      return this.openAudio(filePath);
    } else if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)
    ) {
      return this.openImage(filePath);
    } else if (
      [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "rtf",
      ].includes(extension)
    ) {
      return this.openDocument(filePath);
    } else {
      // Для невідомих типів використовуємо автоматичне визначення
      return this.openFile(filePath);
    }
  }
}

export default FileOpenerHelper;
