export interface FileInfo {
  path: string;
  name: string;
  exists: boolean;
  isFile: boolean;
  isDirectory: boolean;
  canRead: boolean;
  canWrite: boolean;
  size: number;
  lastModified: string;
}

declare class FileOpenerModule {
  /**
   * Open a file with an external application
   * @param filePath - Path to the file
   * @param mimeType - MIME type of the file
   * @returns Promise with success message
   */
  static openFile(filePath: string, mimeType: string): Promise<string>;

  /**
   * Open a file with auto-detected MIME type
   * @param filePath - Path to the file
   * @returns Promise with success message
   */
  static openFileAuto(filePath: string): Promise<string>;

  /**
   * Check if a file exists
   * @param filePath - Path to the file
   * @returns Promise with boolean indicating if file exists
   */
  static checkFileExists(filePath: string): Promise<boolean>;

  /**
   * Get file information
   * @param filePath - Path to the file
   * @returns Promise with file information object
   */
  static getFileInfo(filePath: string): Promise<FileInfo>;

  /**
   * Get MIME type from file extension
   * @param filePath - Path to the file
   * @returns Promise with MIME type string
   */
  static getMimeType(filePath: string): Promise<string>;
}

export default FileOpenerModule; 