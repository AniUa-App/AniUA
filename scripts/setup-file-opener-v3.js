const fs = require('fs');
const path = require('path');

console.log('🔧 Налаштування react-native-file-opener (v3)...');

// Функція для безпечного додавання тексту в файл
function addToFile(filePath, searchText, addText, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл не знайдено: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(addText)) {
    console.log(`✅ ${description} вже додано`);
    return true;
  }

  if (content.includes(searchText)) {
    content = content.replace(searchText, searchText + '\n' + addText);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${description} додано`);
    return true;
  } else {
    console.log(`❌ Не вдалося знайти місце для додавання: ${description}`);
    return false;
  }
}

// Функція для створення файлу
function createFile(filePath, content, description) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} вже існує`);
    return true;
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ ${description} створено`);
  return true;
}

// Функція для правильного додавання FileProvider
function addFileProvider(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ AndroidManifest.xml не знайдено: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Перевіряємо чи FileProvider вже є
  if (content.includes('androidx.core.content.FileProvider')) {
    console.log(`✅ FileProvider вже додано`);
    return true;
  }

  // Знаходимо правильне місце для додавання - після відкриваючого тегу application
  const applicationTag = '<application android:name=".MainApplication"';
  const fileProviderContent = `    <provider
        android:name="androidx.core.content.FileProvider"
        android:authorities="\${applicationId}.fileprovider"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data
            android:name="android.support.FILE_PROVIDER_PATHS"
            android:resource="@xml/file_paths" />
    </provider>`;

  // Шукаємо місце після відкриваючого тегу application
  const lines = content.split('\n');
  let insertIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(applicationTag)) {
      insertIndex = i + 1;
      break;
    }
  }

  if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, fileProviderContent);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ FileProvider додано в AndroidManifest.xml`);
    return true;
  } else {
    console.log(`❌ Не вдалося знайти тег application в AndroidManifest.xml`);
    return false;
  }
}

// Налаштування Android
console.log('\n📱 Налаштування Android...');

// 1. Додати в settings.gradle
addToFile(
  'android/settings.gradle',
  'include \':app\'',
  'include \':react-native-file-opener\'\nproject(\':react-native-file-opener\').projectDir = new File(rootProject.projectDir, \'../node_modules/react-native-file-opener/android\')',
  'Налаштування в settings.gradle'
);

// 2. Додати в build.gradle
addToFile(
  'android/app/build.gradle',
  'implementation jscFlavor',
  '    implementation project(\':react-native-file-opener\')',
  'Залежність в build.gradle'
);

// 3. Створити file_paths.xml
const filePathsContent = `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <external-files-path name="external_files_path" path="." />
    <external-cache-path name="external_cache" path="." />
    <files-path name="files" path="." />
    <cache-path name="cache" path="." />
    <external-path name="downloads" path="Download/" />
    <external-path name="documents" path="Documents/" />
</paths>`;

createFile(
  'android/app/src/main/res/xml/file_paths.xml',
  filePathsContent,
  'file_paths.xml'
);

// 4. Додати FileProvider в AndroidManifest.xml (покращена версія)
addFileProvider('android/app/src/main/AndroidManifest.xml');

// 5. Додати імпорт в MainApplication.kt
addToFile(
  'android/app/src/main/java/com/aniua/MainApplication.kt',
  'import expo.modules.ReactNativeHostWrapper',
  'import com.fileopener.FileOpenerPackage',
  'Імпорт FileOpenerPackage'
);

// 6. Додати пакет в getPackages()
addToFile(
  'android/app/src/main/java/com/aniua/MainApplication.kt',
  'return packages',
  '            packages.add(FileOpenerPackage())\n            return packages',
  'Додавання FileOpenerPackage в getPackages()'
);

console.log('\n✅ Налаштування react-native-file-opener завершено!');
console.log('\n📝 Наступні кроки:');
console.log('1. Запустіть: npx expo run:android');
console.log('2. Або: npx expo run:ios');
console.log('\n💡 Використання в коді:');
console.log('import FileOpener from \'react-native-file-opener\';');
console.log('await FileOpener.openFileAuto(filePath);'); 