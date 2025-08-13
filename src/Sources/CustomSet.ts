import { HikkaApi } from "./hikka";
import axios from "axios";

type Genres = string[];

const Statuses: Record<string, string> = {
  Онґоінґ: "ongoing",
  Завершено: "finished",
  Анонс: "announced",
};

const Seasons: Record<string, string> = {
  Зима: "winter",
  Весна: "spring",
  Осінь: "fall",
  Літо: "summer",
};

const is_ukrainianised: Record<string, boolean> = {
  так: true,
  ні: false,
};

const Sort: Record<string, string> = {
  "Загальна оцінка": "score",
  "Дата релізу": "start_date",
  Тип: "media_type",
};

const Rating: Record<string, string> = {
  G: "g",
  PG: "pg",
  "PG-13": "pg_13",
  R: "r",
  "R+": "r_plus",
  RX: "rx",
};

const Years: [number, number] = [1965, new Date().getFullYear()];

export default interface CustomSet {
  Genres: Genres;
  Statuses: keyof typeof Statuses | Array<keyof typeof Statuses>;
  Seasons: keyof typeof Seasons | Array<keyof typeof Seasons>;
  IsUkrainianised: boolean;
  Sort: keyof typeof Sort;
  Rating: keyof typeof Rating;
  Years: [number, number];
  Score: number[];
}

export async function sendRequest(customSet: CustomSet): Promise<any> {
  const { Genres, Statuses, Seasons, IsUkrainianised, Sort, Rating, Years } =
    customSet;
}

async function _sendRequest(
  Genres: Genres,
  statuses: keyof typeof Statuses | Array<keyof typeof Statuses>,
  seasons: keyof typeof Seasons | Array<keyof typeof Seasons>,
  isUkrainianised: boolean,
  sort: keyof typeof Sort,
  rating: keyof typeof Rating,
  years: [number, number],
  page: number,
  size: number
): Promise<any> {
  const query = HikkaApi.getApiUrl() + `anime?page=${page}&size=${size}`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
  const mapUsingDict = (input: any | any[], dict: Record<string, string>) =>
    toArray(input).map((item) => dict[item as any] ?? String(item));

  const body = {
    years: years,
    only_translated: isUkrainianised,
    score: [],
    rating: mapUsingDict(rating as any, Rating),
    status: mapUsingDict(statuses as any, Statuses),
    season: mapUsingDict(seasons as any, Seasons),
    genres: Genres,
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };

  const response = await axios.post(query, body);
  return response.data;
}

async function getPagesAndSizes(
  customSet: CustomSet
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

  const query = HikkaApi.getApiUrl() + `anime?page=1&size=1`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);
  const mapUsingDict = (input: any | any[], dict: Record<string, string>) =>
    toArray(input).map((item) => dict[item as any] ?? String(item));

  const body = {
    years: years || [1965, new Date().getFullYear()],
    only_translated: isUkrainianised || true,
    score: score || [0, 10],
    rating: mapUsingDict(rating as any, Rating) || ["g"],
    status:
      mapUsingDict(statuses as any, Statuses).length > 2
        ? mapUsingDict(statuses as any, Statuses)
        : ["ongoing"],
    season: mapUsingDict(seasons as any, Seasons) || [],
    genres: genres || [],
    sort: [`${Sort[sort] ?? String(sort)}:desc`],
  };
  console.log("[CustomSet.getPagesAndSizes] body:", body);
  const response = await axios.post(query, body);
  const pages = response.data.pagination.pages;
  const size = response.data.pagination.total;
  console.log("[CustomSet.getPagesAndSizes] response:", response.data);
  return { pages, size };
}

const testSets: CustomSet[] = [
  {
    Genres: ["drama"],
    Statuses: "",
    Seasons: Seasons["Весна"],
    IsUkrainianised: is_ukrainianised["так"],
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
