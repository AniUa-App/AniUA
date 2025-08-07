# React Native File Opener

Універсальний React Native модуль для відкриття файлів у зовнішніх додатках. Підтримує як Android, так і iOS платформи.

## Особливості

- ✅ Підтримка Android та iOS
- ✅ Автоматичне визначення MIME типу файлу
- ✅ Перевірка існування файлу
- ✅ Отримання інформації про файл
- ✅ Сумісність з Expo (після prebuild)
- ✅ TypeScript підтримка
- ✅ Обробка помилок

## Встановлення

### Для Expo проектів (рекомендовано)

```bash
# Встановлюємо модуль
npm install react-native-file-opener

# Виконуємо prebuild для генерації нативного коду
npx expo prebuild

# Для iOS також потрібно встановити pods
cd ios && pod install && cd ..
```

### Для чистих React Native проектів

```bash
npm install react-native-file-opener
# або
yarn add react-native-file-opener
```

#### Android

Додайте в `android/settings.gradle`:

```gradle
include ':react-native-file-opener'
project(':react-native-file-opener').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-file-opener/android')
```

Додайте в `android/app/build.gradle`:

```gradle
dependencies {
    implementation project(':react-native-file-opener')
}
```

Додайте в `android/app/src/main/java/com/yourapp/MainApplication.java`:

```java
import com.fileopener.FileOpenerPackage;

// В методі getPackages():
packages.add(new FileOpenerPackage());
```

#### iOS

```bash
cd ios && pod install
```

## Використання

### Базове використання

```javascript
import FileOpener from "react-native-file-opener";

// Відкрити файл з вказаним MIME типом
FileOpener.openFile("/path/to/file.pdf", "application/pdf")
  .then(() => console.log("Файл відкрито успішно"))
  .catch((error) => console.error("Помилка:", error));

// Автоматичне визначення MIME типу
FileOpener.openFileAuto("/path/to/file.pdf")
  .then(() => console.log("Файл відкрито успішно"))
  .catch((error) => console.error("Помилка:", error));
```

### Перевірка існування файлу

```javascript
FileOpener.checkFileExists("/path/to/file.pdf").then((exists) => {
  if (exists) {
    console.log("Файл існує");
  } else {
    console.log("Файл не існує");
  }
});
```

### Отримання інформації про файл

```javascript
FileOpener.getFileInfo("/path/to/file.pdf").then((info) => {
  console.log("Шлях:", info.path);
  console.log("Назва:", info.name);
  console.log("Розмір:", info.size);
  console.log("Остання зміна:", info.lastModified);
  console.log("Можна читати:", info.canRead);
  console.log("Можна писати:", info.canWrite);
});
```

### Отримання MIME типу

```javascript
FileOpener.getMimeType("/path/to/file.pdf").then((mimeType) => {
  console.log("MIME тип:", mimeType); // "application/pdf"
});
```

## API

### `openFile(filePath: string, mimeType: string): Promise<string>`

Відкриває файл з вказаним MIME типом.

**Параметри:**

- `filePath` (string) - шлях до файлу
- `mimeType` (string) - MIME тип файлу

**Повертає:** Promise з повідомленням про успіх

### `openFileAuto(filePath: string): Promise<string>`

Відкриває файл з автоматичним визначенням MIME типу.

**Параметри:**

- `filePath` (string) - шлях до файлу

**Повертає:** Promise з повідомленням про успіх

### `checkFileExists(filePath: string): Promise<boolean>`

Перевіряє чи існує файл.

**Параметри:**

- `filePath` (string) - шлях до файлу

**Повертає:** Promise з boolean значенням

### `getFileInfo(filePath: string): Promise<FileInfo>`

Отримує інформацію про файл.

**Параметри:**

- `filePath` (string) - шлях до файлу

**Повертає:** Promise з об'єктом FileInfo

### `getMimeType(filePath: string): Promise<string>`

Отримує MIME тип файлу на основі розширення.

**Параметри:**

- `filePath` (string) - шлях до файлу

**Повертає:** Promise з MIME типом

## Типи

```typescript
interface FileInfo {
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
```

## Підтримувані формати

- **Документи:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, HTML, CSS, JS, JSON, XML
- **Зображення:** JPG, JPEG, PNG, GIF, BMP, WEBP
- **Відео:** MP4, AVI, MKV
- **Аудіо:** MP3, WAV, OGG
- **Архіви:** ZIP, RAR, 7Z

## Налаштування для Android

### Автоматичне налаштування (Expo)

При використанні з Expo, всі необхідні налаштування виконуються автоматично після `expo prebuild`.

### Ручне налаштування

Якщо у вас ще немає FileProvider, додайте в `android/app/src/main/AndroidManifest.xml`:

```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

Створіть файл `android/app/src/main/res/xml/file_paths.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <external-files-path name="external_files_path" path="." />
    <external-cache-path name="external_cache" path="." />
    <files-path name="files" path="." />
    <cache-path name="cache" path="." />
</paths>
```

### Дозволи

Додайте необхідні дозволи в `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Налаштування для iOS

Для iOS додаткові налаштування не потрібні. Модуль використовує QuickLook для попереднього перегляду файлів та системні додатки для їх відкриття.

## Обробка помилок

Модуль може повертати наступні помилки:

- `FILE_NOT_FOUND` - файл не існує
- `FILE_NOT_READABLE` - файл не можна прочитати
- `NO_APP_FOUND` - не знайдено додаток для відкриття файлу
- `OPEN_FAILED` - не вдалося відкрити файл
- `ERROR` - загальна помилка

## Приклади

### Відкриття PDF файлу

```javascript
import FileOpener from "react-native-file-opener";

const openPDF = async (filePath) => {
  try {
    await FileOpener.openFile(filePath, "application/pdf");
    console.log("PDF відкрито успішно");
  } catch (error) {
    console.error("Помилка відкриття PDF:", error);
  }
};
```

### Відкриття зображення

```javascript
const openImage = async (filePath) => {
  try {
    await FileOpener.openFileAuto(filePath);
    console.log("Зображення відкрито успішно");
  } catch (error) {
    console.error("Помилка відкриття зображення:", error);
  }
};
```

### Перевірка та відкриття файлу

```javascript
const checkAndOpenFile = async (filePath) => {
  try {
    const exists = await FileOpener.checkFileExists(filePath);
    if (exists) {
      await FileOpener.openFileAuto(filePath);
      console.log("Файл відкрито успішно");
    } else {
      console.log("Файл не існує");
    }
  } catch (error) {
    console.error("Помилка:", error);
  }
};
```

## Ліцензія

MIT

## Підтримка

Якщо у вас є питання або проблеми, створіть issue на GitHub.
