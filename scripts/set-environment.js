const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

// Отримуємо хеш поточного коміту
const getGitHash = () => {
  try {
    const fullHash = execSync('git rev-parse HEAD').toString().trim();
    const shortHash = execSync('git rev-parse --short HEAD').toString().trim();
    return {fullHash, shortHash};
  } catch (error) {
    console.warn('Не вдалося отримати хеш Git:', error);
    return {fullHash: 'unknown', shortHash: 'unknown'};
  }
};

// Створюємо змінні середовища для збірки
const createEnvFile = () => {
  const {fullHash, shortHash} = getGitHash();
  const envVars = {
    COMMIT_HASH: fullHash,
    COMMIT_HASH_SHORT: shortHash,
    BUILD_DATE: new Date().toISOString(),
  };

  // Створюємо .env файл
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(path.resolve(__dirname, '../.env'), envContent);
  console.log('Створено .env файл з наступними змінними:', envVars);
};

createEnvFile();
