import { NativeModules } from 'react-native';

const { FileOpener } = NativeModules;

function ensureAvailable() {
  if (!FileOpener) {
    return Promise.reject(new Error('FileOpener native module is not available'));
  }
  return null;
}

/**
 * React Native File Opener
 * A module for opening files with external applications
 * Note: This module is Android-only
 */
class FileOpenerModule {
  /**
   * Open a file with an external application
   * @param {string} filePath - Path to the file
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<string>} - Success message
   */
  static openFile(filePath, mimeType) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.openFile(filePath, mimeType);
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} - True if file exists
   */
  static checkFileExists(filePath) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.checkFileExists(filePath);
  }

  /**
   * Get file information
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File information object
   */
  static getFileInfo(filePath) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.getFileInfo(filePath);
  }

  /**
   * Get MIME type of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - MIME type
   */
  static getMimeType(filePath) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.getMimeType(filePath);
  }

  /**
   * Open a file with automatic MIME type detection
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Success message
   */
  static openFileAuto(filePath) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.openFileAuto(filePath);
  }

  /**
   * Open a file with app chooser dialog (always shows picker)
   * @param {string} filePath - Path to the file
   * @param {string} mimeType - MIME type of the file
   * @param {string} title - Title for the chooser dialog
   * @returns {Promise<string>} - Success message
   */
  static openFileWithChooser(filePath, mimeType = 'video/*', title = 'Відкрити за допомогою') {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.openFileWithChooser(filePath, mimeType, title);
  }

  /**
   * Share a file with other apps
   * @param {string} filePath - Path to the file
   * @param {string} mimeType - MIME type of the file
   * @param {string} title - Title for the share dialog
   * @returns {Promise<string>} - Success message
   */
  static shareFile(filePath, mimeType = 'video/*', title = 'Поділитися') {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.shareFile(filePath, mimeType, title);
  }

  /**
   * Open a video file with app chooser
   * @param {string} filePath - Path to the video file
   * @param {string} title - Title for the chooser dialog
   * @returns {Promise<string>} - Success message
   */
  static openVideoWithChooser(filePath, title = 'Відкрити відео') {
    return this.openFileWithChooser(filePath, 'video/*', title);
  }

  /**
   * Open a folder in file manager
   * @param {string} folderPath - Path to the folder
   * @returns {Promise<string>} - Success message
   */
  static openFolder(folderPath) {
    const error = ensureAvailable();
    if (error) return error;
    return FileOpener.openFolder(folderPath);
  }
}

export default FileOpenerModule; 