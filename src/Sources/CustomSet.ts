import { HikkaApi } from "./hikka";
import axios from "axios";
import { CustomAnimeSet } from "../Storage/PersonalRecListStorage";

export var Genres: Record<string, string> = {};

export const Statuses: Record<string, string> = {
  Неважливо: "",
  Онґоінґ: "ongoing",
  Завершено: "finished",
  Анонс: "announced",
};

export const Seasons: Record<string, string> = {
  Неважливо: "",
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
  Statuses: keyof typeof Statuses | Array<keyof typeof Statuses>;
  Seasons: keyof typeof Seasons | Array<keyof typeof Seasons>;
  IsUkrainianised: boolean;
  Sort: keyof typeof Sort;
  Rating: keyof typeof Rating | [];
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
  const query = HikkaApi.getApiUrl() + `anime?page=${page}&size=${size}`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
  const mapUsingDict = (input: any | any[], dict: Record<string, string>) =>
    toArray(input).map((item) => dict[item as any] ?? String(item)) || [];

  const body = {
    years: years || [1965, new Date().getFullYear()],
    rating: mapUsingDict(rating as any, Rating) || [],
    status:
      mapUsingDict(statuses as any, Statuses).length > 2
        ? mapUsingDict(statuses as any, Statuses)
        : [],
    score: score || [5, 10],
    only_translated: isUkrainianised || true,
    season:
      seasons && mapUsingDict(seasons as any, Seasons).length > 2
        ? mapUsingDict(seasons as any, Seasons)
        : [],
    genres: genres || [],
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };
  console.log(body, "body");
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

  console.log(years, "years");

  const query = HikkaApi.getApiUrl() + `anime?page=1&size=1`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
  const mapUsingDict = (input: any | any[], dict: Record<string, string>) =>
    toArray(input).map((item) => dict[item as any] ?? String(item)) || [];

  const body = {
    years: years || [1965, new Date().getFullYear()],
    rating: mapUsingDict(rating as any, Rating) || [],
    status:
      mapUsingDict(statuses as any, Statuses).length > 2
        ? mapUsingDict(statuses as any, Statuses)
        : [],
    only_translated: isUkrainianised || true,
    score: score || [5, 10],

    season:
      seasons && mapUsingDict(seasons as any, Seasons).length > 2
        ? mapUsingDict(seasons as any, Seasons)
        : [],
    genres: genres || [],
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };
  const response = await axios.post(query, body);
  if (response.data.pagination.pages === response.data.pagination.total) {
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
  console.log("[CustomSet.test] start");
  try {
    const { pages, size } = await getPagesAndSizes(testSets[0]);
    console.log("[CustomSet.test] pages,size:", pages, size);
  } catch (error: any) {
    console.error(
      "[CustomSet.test] getPagesAndSizes error:",
      error?.response?.data || error?.message || error
    );
  }
}

export async function getGenres() {
  const list = await HikkaApi.getGenres();
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
  const list = await HikkaApi.getGenres();
  if (!Array.isArray(list)) return [];
  return list
    .filter((item: any) => item?.name_ua && item?.slug)
    .map((item: any) => ({ [item.name_ua]: item.slug }));
}
