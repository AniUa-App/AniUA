import { HikkaApiComplete } from "./HikkaApiComplete";
import axios from "axios";
import { CustomAnimeSet } from "../Storage/PersonalRecListStorage";
import Logger from "../Logger/Logger";

export var Genres: Record<string, string> = {};

export const Statuses: Record<string, string> = {
  Байдуже: "",
  Онґоінг: "ongoing",
  Завершено: "finished",
  Анонс: "announced",
};

export const Seasons: Record<string, string> = {
  Байдуже: "",
  Зима: "winter",
  Весна: "spring",
  Осінь: "fall",
  Літо: "summer",
};

export const is_ukrainianised: Record<string, boolean> = {
  так: true,
  ні: false,
};

export const Sort: Record<string, string> = {
  "Загальна оцінка": "score",
  "Дата релізу": "start_date",
  Тип: "media_type",
};

export const Rating: Record<string, string> = {
  G: "g",
  PG: "pg",
  "PG-13": "pg_13",
  R: "r",
  "R+": "r_plus",
  RX: "rx",
};

export const Years: [number, number] = [1965, new Date().getFullYear()];

export default interface ReqCustomSet {
  Genres: string[];
  Statuses: string | string[];
  Seasons: string | string[];
  IsUkrainianised?: boolean;
  Sort: string;
  Rating: string | string[] | [];
  Years: [number, number];
  Score: [number, number];
}

export async function sendRequest(
  customSet: CustomAnimeSet,
  type: "preview" | "full" = "preview",
  maxCount: number | null = null
): Promise<any> {
  const { animeSet } = customSet;
  let { pages, size } = customSet;
  if (type === "preview" || size < 100) {
    size = 25;
    pages = 1;
  } else if (type === "full") {
    if (size > 100) {
      let page_count = Math.ceil(size / 100);
      let response_list = [];
      if (size < 500) {
        size = 300;
      }

      for (let i = 0; i < page_count; i++) {
        if (size > 100) {
          size -= 100;
        }
        const response = await _sendRequest(
          animeSet.Genres,
          animeSet.Statuses,
          animeSet.Seasons,
          animeSet.IsUkrainianised,
          animeSet.Sort,
          animeSet.Rating,
          animeSet.Years,
          animeSet.Score,
          i + 1,
          100
        );
        response_list.push(...response.list);

        if (maxCount && response_list.length >= maxCount) {
          break;
        }
      }
      return response_list;
    }
  }
  const response = await _sendRequest(
    animeSet.Genres,
    animeSet.Statuses,
    animeSet.Seasons,
    animeSet.IsUkrainianised,
    animeSet.Sort,
    animeSet.Rating,
    animeSet.Years,
    animeSet.Score,
    pages,
    size
  );
  return response.list;
}

async function _sendRequest(
  genres: ReqCustomSet["Genres"],
  statuses: ReqCustomSet["Statuses"],
  seasons: ReqCustomSet["Seasons"],
  isUkrainianised: ReqCustomSet["IsUkrainianised"],
  sort: ReqCustomSet["Sort"],
  rating: ReqCustomSet["Rating"],
  years: ReqCustomSet["Years"],
  score: ReqCustomSet["Score"],
  page: number,
  size: number
): Promise<any> {
  const query = HikkaApiComplete.getApiUrl() + `anime?page=${page}&size=${size}`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
  const mapUsingDict = (input: any | any[], dict: Record<string, string>) =>
    toArray(input).map((item) => dict[item as any] ?? String(item)) || [];
  const dictValues = (dict: Record<string, string>) => Object.values(dict);

  const body = {
    years: years || [1965, new Date().getFullYear()],
    rating: toArray(rating as any).map(r => Rating[r as any] ?? r).filter(s => s !== ''),
    status: toArray(statuses as any).map(s => Statuses[s as any] ?? s).filter(s => s !== ''),
    score: score || [5, 10],
    only_translated: isUkrainianised || true,
    season: toArray(seasons as any).map(s => Seasons[s as any] ?? s).filter(s => s !== ''),
    genres: genres || [],
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };
  Logger.debug('CustomSet', 'Відправка запиту аніме', { body });
  const response = await axios.post(query, body);
  return response.data;
}

export async function getPagesAndSizes(
  customSet: ReqCustomSet
): Promise<{ pages: number; size: number }> {
  const {
    Genres: genres,
    Statuses: statuses,
    Seasons: seasons,
    IsUkrainianised: isUkrainianised,
    Sort: sort,
    Rating: rating,
    Years: years,
    Score: score,
  } = customSet;

  const query = HikkaApiComplete.getApiUrl() + `anime?page=1&size=1`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

  const body = {
    years: years || [1965, new Date().getFullYear()],
    rating: toArray(rating as any).map(r => Rating[r as any] ?? r).filter(s => s !== ''),
    status: toArray(statuses as any).map(s => Statuses[s as any] ?? s).filter(s => s !== ''),
    only_translated: isUkrainianised || true,
    score: score || [5, 10],
    season: toArray(seasons as any).map(s => Seasons[s as any] ?? s).filter(s => s !== ''),
    genres: genres || [],
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };
  const response = await axios.post(query, body);
  Logger.debug('CustomSet', 'Отримано відповідь про пагінацію', { data: response.data });
  if (response.data.pagination.pages === response.data.pagination.total) {
    Logger.debug('CustomSet', 'Всі результати на одній сторінці', { data: response.data });
    return { pages: 1, size: response.data.pagination.total };
  }
  const pages = response.data.pagination.pages;
  const size = response.data.pagination.total;
  return { pages, size };
}

const testSets: ReqCustomSet[] = [
  {
    Genres: ["Драма"],
    Statuses: "",
    Seasons: Seasons["Весна"],
    IsUkrainianised: is_ukrainianised["так"] as boolean,
    Sort: Sort["Загальна оцінка"],
    Rating: Rating.G,
    Years: [1965, new Date().getFullYear()],
    Score: [8, 10],
  },
];

export async function test() {
  Logger.debug('CustomSet', 'Тест функція запущена');
  try {
    const { pages, size } = await getPagesAndSizes(testSets[0]);
    Logger.debug('CustomSet', 'Результат тесту getPagesAndSizes', { pages, size });
  } catch (error: any) {
    Logger.error('CustomSet', 'Помилка getPagesAndSizes', error?.response?.data || error?.message || error);
  }
}

export async function getGenres() {
  const list = await HikkaApiComplete.getGenres();
  const genres: string[] = [];
  Genres = {};
  if (Array.isArray(list)) {
    for (const item of list) {
      const nameUa = (item as any)?.name_ua;
      const slug = (item as any)?.slug;
      if (nameUa && slug) {
        Genres[nameUa] = slug;
        genres.push(nameUa);
      }
    }
  }
  return genres;
}

export async function getGenresPairs(): Promise<Array<Record<string, string>>> {
  const list = await HikkaApiComplete.getGenres();
  if (!Array.isArray(list)) return [];
  return list
    .filter((item: any) => item?.name_ua && item?.slug)
    .map((item: any) => ({ [item.name_ua]: item.slug }));
}
