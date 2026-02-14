const fs = require("fs");
const path = require("path");

console.log("🔧 Налаштування react-native-tv-channels...");

// Функція для безпечного додавання тексту в файл
function addToFile(filePath, searchText, addText, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Файл не знайдено: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes(addText.trim())) {
    console.log(`✅ ${description} вже додано`);
    return true;
  }

  if (content.includes(searchText)) {
    content = content.replace(searchText, searchText + "\n" + addText);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${description} додано`);
    return true;
  } else {
    console.log(`❌ Не вдалося знайти місце для додавання: ${description}`);
    return false;
  }
}

// Знаходимо MainApplication.kt динамічно
function findMainApplication() {
  const baseDir = "android/app/src/main/java/aniua/yuzka/site";
  const candidates = [
    path.join(baseDir, "beta", "MainApplication.kt"),
    path.join(baseDir, "release", "MainApplication.kt"),
    path.join(baseDir, "MainApplication.kt"),
  ];

  // Також шукаємо рекурсивно
  function findRecursive(dir) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === "MainApplication.kt") {
        return fullPath;
      }
      if (entry.isDirectory()) {
        const found = findRecursive(fullPath);
        if (found) return found;
      }
    }
    return null;
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log(`📍 MainApplication.kt знайдено: ${candidate}`);
      return candidate;
    }
  }

  const found = findRecursive(baseDir);
  if (found) {
    console.log(`📍 MainApplication.kt знайдено (рекурсивно): ${found}`);
    return found;
  }

  console.log(`❌ MainApplication.kt не знайдено в ${baseDir}`);
  return null;
}

// Налаштування Android
console.log("\n📱 Налаштування Android...");

// 1. Додати в settings.gradle
addToFile(
  "android/settings.gradle",
  "include ':app'",
  "include ':react-native-tv-channels'\nproject(':react-native-tv-channels').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-tv-channels/android')",
  "Налаштування в settings.gradle"
);

// 2. Додати в build.gradle
addToFile(
  "android/app/build.gradle",
  "implementation jscFlavor",
  "    implementation project(':react-native-tv-channels')",
  "Залежність в build.gradle"
);

// 3-4. Додати імпорт та пакет в MainApplication.kt
const mainAppPath = findMainApplication();
if (mainAppPath) {
  addToFile(
    mainAppPath,
    "import expo.modules.ReactNativeHostWrapper",
    "import com.tvchannels.TvChannelsPackage",
    "Імпорт TvChannelsPackage"
  );

  addToFile(
    mainAppPath,
    "// packages.add(MyReactNativePackage())",
    "            packages.add(TvChannelsPackage())",
    "Додавання TvChannelsPackage в getPackages()"
  );
}

console.log("\n✅ Налаштування react-native-tv-channels завершено!");
