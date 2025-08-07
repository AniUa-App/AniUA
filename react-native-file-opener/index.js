import { NativeModules, Platform } from 'react-native';

const { FileOpener } = NativeModules;

if (!FileOpener) {
  throw new Error('FileOpener native module is not available');
}

/**
 * React Native File Opener
 * A module for opening files with external applications
 */
class FileOpenerModule {
  /**
   * Open a file with an external application
   * @param {string} filePath - Path to the file
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<string>} - Success message
   */
  static openFile(filePath, mimeType) {
    if (Platform.OS === 'android') {
      return FileOpener.openFile(filePath, mimeType);
    } else if (Platform.OS === 'ios') {
      return FileOpener.openFile(filePath, mimeType);
    } else {
      return Promise.reject(new Error('Platform not supported'));
    }
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to the file
   * @returns {Promise<boolean>} - True if file exists
   */
  static checkFileExists(filePath) {
    if (Platform.OS === 'android') {
      return FileOpener.checkFileExists(filePath);
    } else if (Platform.OS === 'ios') {
      return FileOpener.checkFileExists(filePath);
    } else {
      return Promise.reject(new Error('Platform not supported'));
    }
  }

  /**
   * Get file information
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File information object
   */
  static getFileInfo(filePath) {
    if (Platform.OS === 'android') {
      return FileOpener.getFileInfo(filePath);
    } else if (Platform.OS === 'ios') {
      return FileOpener.getFileInfo(filePath);
    } else {
      return Promise.reject(new Error('Platform not supported'));
    }
  }

  /**
   * Get MIME type of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - MIME type
   */
  static getMimeType(filePath) {
    if (Platform.OS === 'android') {
      return FileOpener.getMimeType(filePath);
    } else if (Platform.OS === 'ios') {
      return FileOpener.getMimeType(filePath);
    } else {
      return Promise.reject(new Error('Platform not supported'));
    }
  }

  /**
   * Open a file with automatic MIME type detection
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - Success message
   */
  static openFileAuto(filePath) {
    if (Platform.OS === 'android') {
      return FileOpener.openFileAuto(filePath);
    } else if (Platform.OS === 'ios') {
      return FileOpener.openFileAuto(filePath);
    } else {
      return Promise.reject(new Error('Platform not supported'));
    }
  }
}

export default FileOpenerModule; 