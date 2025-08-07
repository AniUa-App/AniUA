import {logger} from 'react-native-logs';
import * as FileSystem from 'expo-file-system';
import SettingsStorage from '../Storage/SettingsStorage';

class Logger {
  private logger: any;
  private logHistory: string[] = [];
  public pathToLogFile: string = '';

  constructor() {
    this.logger = logger.createLogger();
    
    try {
      // Безпечне отримання параметра
      this.pathToLogFile = SettingsStorage.getParameter('pathToLogFile') || '';
    } catch (error) {
      console.warn('Помилка ініціалізації Logger:', error);
      this.pathToLogFile = '';
    }
  }

  log(message: string): void {
    try {
      this.logHistory.push(this.logger.log(message));
    } catch (error) {
      console.warn('Помилка логування:', error);
    }
  }

  error(message: string): void {
    try {
      this.logHistory.push(this.logger.error(message));
    } catch (error) {
      console.warn('Помилка логування помилки:', error);
    }
  }

  warn(message: string): void {
    try {
      this.logHistory.push(this.logger.warn(message));
    } catch (error) {
      console.warn('Помилка логування попередження:', error);
    }
  }

  private async writeLogToFile(): Promise<void> {
    try {
      if (!this.pathToLogFile) {
        console.warn('Шлях до лог файлу не встановлено');
        return;
      }

      // Перевіряємо чи існує директорія для логів
      const dirInfo = await FileSystem.getInfoAsync(this.pathToLogFile);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.pathToLogFile, { intermediates: true });
      }

      const logContent = this.logHistory.join('\n');
      const logFileName = `log=${new Date().toISOString()}.txt`;
      const logFilePath = `${this.pathToLogFile}/${logFileName}`;
      
      await FileSystem.writeAsStringAsync(logFilePath, logContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (error) {
      console.warn('Помилка запису лог файлу:', error);
    }
  }

  setPathToLogFile(path: string): void {
    this.pathToLogFile = path;
  }

  getPathToLogFile(): string {
    return this.pathToLogFile;
  }
}

export default new Logger();
