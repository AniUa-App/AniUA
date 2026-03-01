import axios from "axios";
import { resolveApiUrl } from "../cfgs/ApiProxy";

export class Api {
  private static apiUrl = resolveApiUrl("https://api.hikka.io") + "/";

  public async getMostPopularAnimeOfTheYear(page: number = 1, size: number = 1) {
    try {
      const response = await axios.post(`${Api.apiUrl}anime?page=${page}&size=${size}`, {
        years: [2025, 2025],

        include_multiseason: false,
        only_translated: true,
        score: [8, 10],
        sort: ["scored_by:desc"]
      }, {
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' }
      });

      return response.data.list;
    } catch (error: any) {
      console.error("Помилка:", error?.message || error);
      return [];
    }
  }

  public async getAnimeDetails(slug: string) {
    try {
      const response = await axios.get(`${Api.apiUrl}anime/${slug}`, {
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error: any) {
      console.error("Помилка:", error?.message || error);
      return [];
    }
  }

  public async getMostPopularAnime(page: number = 1, size: number = 1) {
    try {
      const response = await axios.post(`${Api.apiUrl}anime?page=${page}&size=${size}`, {
        years: [2001, 2025],
        include_multiseason: false,
        only_translated: true,
        score: [8, 10],
        sort: ["scored_by:desc"]

      }, {
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' }
      });

      return response.data.list;
    } catch (error: any) {
      console.error("Помилка:", error?.message || error);
      return [];
    }
  }


}
