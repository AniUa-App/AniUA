# Інструкція встановлення react-native-file-opener для AniUA

## Автоматичне встановлення (рекомендовано)

```bash
# 1. Встановлюємо модуль
npm install ./react-native-file-opener --legacy-peer-deps

# 2. Виконуємо prebuild
npx expo prebuild

# 3. Запускаємо автоматичний скрипт налаштування
npm run setup-file-opener

# 4. Запускаємо додаток
npx expo run:android
# або
npx expo run:ios
```

## Ручне встановлення

Якщо автоматичний скрипт не працює, виконайте наступні кроки:

### Крок 1: Встановлення модуля

```bash
npm install ./react-native-file-opener --legacy-peer-deps
```

### Крок 2: Виконання Expo prebuild

```bash
npx expo prebuild
```

### Крок 3: Додавання необхідних файлів після prebuild

#### Android

Після `expo prebuild` потрібно додати наступні файли:

##### 1. Додати в `android/settings.gradle`:

```gradle
include ':react-native-file-opener'
project(':react-native-file-opener').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-file-opener/android')
```

##### 2. Додати в `android/app/build.gradle` в секцію dependencies:

```gradle
implementation project(':react-native-file-opener')
```

##### 3. Створити файл `android/app/src/main/res/xml/file_paths.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <external-files-path name="external_files_path" path="." />
    <external-cache-path name="external_cache" path="." />
    <files-path name="files" path="." />
    <cache-path name="cache" path="." />
    <external-path name="downloads" path="Download/" />
    <external-path name="documents" path="Documents/" />
</paths>
```

##### 4. Додати FileProvider в `android/app/src/main/AndroidManifest.xml`:

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

##### 5. Додати імпорт та пакет в `android/app/src/main/java/com/aniua/MainApplication.kt`:

```kotlin
import com.fileopener.FileOpenerPackage

// В методі getPackages():
packages.add(FileOpenerPackage())
```

#### iOS

Для iOS додаткові налаштування не потрібні, оскільки модуль використовує autolinking.

## Використання в коді

```javascript
import FileOpener from "react-native-file-opener";

// Приклад використання
const openFile = async (filePath) => {
  try {
    await FileOpener.openFileAuto(filePath);
    console.log("Файл відкрито успішно");
  } catch (error) {
    console.error("Помилка:", error);
  }
};

// Або з вказаним MIME типом
const openPDF = async (filePath) => {
  try {
    await FileOpener.openFile(filePath, "application/pdf");
    console.log("PDF відкрито успішно");
  } catch (error) {
    console.error("Помилка:", error);
  }
};
```

## Доступні методи

- `FileOpener.openFile(filePath, mimeType)` - відкрити файл з вказаним MIME типом
- `FileOpener.openFileAuto(filePath)` - автоматичне визначення MIME типу
- `FileOpener.checkFileExists(filePath)` - перевірити існування файлу
- `FileOpener.getFileInfo(filePath)` - отримати інформацію про файл
- `FileOpener.getMimeType(filePath)` - отримати MIME тип файлу

## Підтримувані формати

- **Документи:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, HTML, CSS, JS, JSON, XML
- **Зображення:** JPG, JPEG, PNG, GIF, BMP, WEBP
- **Відео:** MP4, AVI, MKV
- **Аудіо:** MP3, WAV, OGG
- **Архіви:** ZIP, RAR, 7Z

## Важливі примітки

1. **Після кожного `expo prebuild`** потрібно повторно запускати `npm run setup-file-opener`
2. **Для iOS** додаткові налаштування не потрібні
3. **Модуль підтримує** всі популярні формати файлів
4. **Автоматичне визначення MIME типу** працює для більшості форматів

## Усунення неполадок

### Помилка "Module not found"

- Переконайтеся, що модуль встановлено: `npm install ./react-native-file-opener --legacy-peer-deps`
- Перезапустіть Metro: `npx expo start --clear`

### Помилка "FileProvider not found"

- Запустіть скрипт налаштування: `npm run setup-file-opener`
- Переконайтеся, що файл `file_paths.xml` створено

### Помилка "No app found to open file"

- Переконайтеся, що на пристрої встановлено додаток для відкриття цього типу файлів
- Спробуйте використати `openFileAuto` замість `openFile`
