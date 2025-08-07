import axios from 'axios';

export async function getPlayerData(url) {
  try {
    // Отримуємо HTML-контент за посиланням
    const response = await axios.get(url, {
      headers: {
        'Accept-Language': 'uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3',
      },
      decompress: true,
    });

    const htmlContent = response.data;

    // Шукаємо дані плеєра за допомогою регулярних виразів
    const playerData = {};

    // Використовуємо регулярні вирази для пошуку параметрів плеєра
    const idMatch = htmlContent.match(/id:\s*"([^"]+)"/);
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
    const posterMatch = htmlContent.match(/poster:\s*"([^"]+)"/);
    const subtitleMatch = htmlContent.match(/subtitle:\s*"([^"]+)"/);
    const forbiddenQualityMatch = htmlContent.match(
      /forbidden_quality:\s*"([^"]+)"/,
    );
    const defaultQualityMatch = htmlContent.match(
      /default_quality:\s*"([^"]+)"/,
    );

    // Заповнюємо об'єкт даними, якщо вони знайдені
    if (idMatch) playerData.id = idMatch[1];
    if (fileMatch) playerData.file = fileMatch[1];
    if (posterMatch) playerData.poster = posterMatch[1];
    if (subtitleMatch) playerData.subtitle = subtitleMatch[1];
    if (forbiddenQualityMatch)
      playerData.forbiddenQuality = forbiddenQualityMatch[1];
    if (defaultQualityMatch) playerData.defaultQuality = defaultQualityMatch[1];

    // Перевіряємо, чи знайдено хоча б один параметр
    return Object.keys(playerData).length > 0 ? playerData : null;
  } catch (error) {
    console.error('Помилка при отриманні даних плеєра:', error);
    return null;
  }
}
