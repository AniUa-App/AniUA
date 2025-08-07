import axios from "axios";

export let SourceUrl = "api.melonecode.biz.ua/anime/source/animeua.club ";
SourceUrl = "http://62.164.215.24:8223";

export function GetAnimeGanres() {
  axios
    .get(`${SourceUrl}/get/anime/ganres`)
    .then((response) => {
      return JSON.parse(response.data);
    })
    .catch((error) => {
      return error.message;
    });
}
export async function GetAnimes(page = 1) {
  const baseUrl = "https://animeua.club"; // Замени на свою ссылку

  try {
    const response = await axios.get(`${SourceUrl}/get/animes/${page}`);
    const animes = response.data;

    // Добавляем базовый URL к ключу `image_url`
    return animes.map((anime) => ({
      ...anime,
      image_url: `${baseUrl}${anime.image_url}`,
    }));
  } catch (error) {
    console.error("Ошибка загрузки данных:", error.message);
    return []; // Возвращаем пустой массив в случае ошибки
  }
}

export function GetAnimeByName(name) {
  axios
    .get(`${SourceUrl}/get/anime/by_name/${name}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.message;
    });
}

export function GetAnimeByGenre(genre, pageNumber) {
  axios
    .get(`${SourceUrl}/get/anime/by_genre/${genre}/${pageNumber}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.message;
    });
}

export async function GetAnimeDetails(url) {
  axios
    .get(`${SourceUrl}/get/anime/details?anime_url=${url}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error.message;
    });
}
