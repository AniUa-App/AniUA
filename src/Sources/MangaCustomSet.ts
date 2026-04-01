import { HikkaApiComplete } from "./HikkaApiComplete";
import axios from "axios";
import Logger from "../Logger/Logger";
import { getGenres } from "./CustomSet";

export { getGenres };

export const MangaStatuses: Record<string, string> = {
  Байдуже: "",
  Онґоінг: "ongoing",
  Завершено: "finished",
  Анонс: "announced",
};

export const MangaSort: Record<string, string> = {
  "Загальна оцінка": "score",
  "Дата релізу": "start_date",
};

export interface ReqMangaCustomSet {
  Genres: string[];
  Statuses: string | string[];
  Sort: string;
  Years: [number, number];
  Score: [number, number];
}

export interface CustomMangaSet {
  name: string;
  mangaSet: ReqMangaCustomSet;
  type: "horizontal" | "vertical";
  pages: number;
  size: number;
  isArrow: boolean;
}

async function _sendMangaRequest(
  genres: string[],
  statuses: string | string[],
  sort: string,
  years: [number, number],
  score: [number, number],
  page: number,
  size: number,
): Promise<any> {
  const query = HikkaApiComplete.getApiUrl() + `manga?page=${page}&size=${size}`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

  const body = {
    years: years || [1965, new Date().getFullYear()],
    status: toArray(statuses as any)
      .map((s) => MangaStatuses[s as any] ?? s)
      .filter((s) => s !== ""),
    score: score || [0, 10],
    genres: genres || [],
    sort: [`${MangaSort[sort] ?? String(sort)}:desc`],
  };

  Logger.debug("MangaCustomSet", "Відправка запиту манґи", { body });
  const response = await axios.post(query, body);
  return response.data;
}

export async function sendMangaRequest(
  customSet: CustomMangaSet,
  type: "preview" | "full" = "preview",
  maxCount: number | null = null,
): Promise<any> {
  const { mangaSet } = customSet;
  let { pages, size } = customSet;

  if (type === "preview" || size < 100) {
    size = 25;
    pages = 1;
  } else if (type === "full") {
    if (size > 100) {
      const page_count = Math.ceil(size / 100);
      const response_list: any[] = [];
      if (size < 500) size = 300;

      for (let i = 0; i < page_count; i++) {
        if (size > 100) size -= 100;
        const response = await _sendMangaRequest(
          mangaSet.Genres,
          mangaSet.Statuses,
          mangaSet.Sort,
          mangaSet.Years,
          mangaSet.Score,
          i + 1,
          100,
        );
        response_list.push(...(response.list || []));
        if (maxCount && response_list.length >= maxCount) break;
      }
      return response_list;
    }
  }

  const response = await _sendMangaRequest(
    mangaSet.Genres,
    mangaSet.Statuses,
    mangaSet.Sort,
    mangaSet.Years,
    mangaSet.Score,
    pages,
    size,
  );
  return response.list || [];
}

export async function getMangaPagesAndSizes(
  customSet: ReqMangaCustomSet,
): Promise<{ pages: number; size: number }> {
  const { Genres, Statuses, Sort, Years, Score } = customSet;

  const query = HikkaApiComplete.getApiUrl() + `manga?page=1&size=1`;
  const toArray = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

  const body = {
    years: Years || [1965, new Date().getFullYear()],
    status: toArray(Statuses as any)
      .map((s) => MangaStatuses[s as any] ?? s)
      .filter((s) => s !== ""),
    score: Score || [0, 10],
    genres: Genres || [],
    sort: [`${MangaSort[Sort] ?? String(Sort)}:desc`],
  };

  const response = await axios.post(query, body);
  Logger.debug("MangaCustomSet", "Отримано відповідь про пагінацію", {
    data: response.data,
  });

  const pagination = response.data?.pagination;
  if (!pagination) return { pages: 1, size: 25 };
  if (pagination.pages === pagination.total) {
    return { pages: 1, size: pagination.total };
  }
  return { pages: pagination.pages, size: pagination.total };
}
