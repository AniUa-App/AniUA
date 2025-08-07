import {HikkaApi} from './hikka';
import axios from 'axios';

export class HikkaSets extends HikkaApi {
  protected static GENRES = {
    popular_year: HikkaSets.getMostPopularAnimeOfTheYear,
    ongoing_anime: HikkaSets.getOngoingAnime,
    xentai: HikkaSets.getXentaiAnime,
    romance: HikkaSets.getRomanceAnime,
    action: HikkaSets.getActionAnime,
    isekain: HikkaSets.getIsekainAnime,
    comedy: HikkaSets.getComedyAnime,
    fantasy: HikkaSets.getFantasyAnime,
    sci_fi: HikkaSets.getSciFiAnime,
  };

  constructor() {
    super();
  }

  private static fetchAnime(
    cacheKey: string,
    page: number = 1,
    size: number = 1,
    params: {
      years?: number[];
      status?: string[];
      genres?: string[];
      include_multiseason?: boolean;
      only_translated?: boolean;
      score?: number[];
      sort?: string[];
    },
  ) {
    return HikkaSets.cachedRequest(cacheKey, async () => {
      const response = await this.axiosInstance.post(
        `${HikkaApi.apiUrl}anime?page=${page}&size=${size}`,
        {
          media_type: [],
          status: params.status || [],
          season: [],
          rating: [],
          years: params.years || [HikkaApi.currentYear, HikkaApi.currentYear],
          only_translated: params.only_translated ?? true,
          genres: params.genres || [],
          studios: [],
          sort: params.sort || [],
          include_multiseason: params.include_multiseason ?? false,
          score: params.score,
        },
      );
      return response.data.list;
    }).catch(() => []);
  }

  public static getMostPopularAnimeOfTheYear(page = 1, size = 1) {
    return HikkaSets.fetchAnime(`popular_year_${page}_${size}`, page, size, {
      years: [HikkaApi.currentYear, HikkaApi.currentYear],
      include_multiseason: false,
      only_translated: true,
      score: [8, 10],
      sort: ['start_date:desc'],
    });
  }

  public static getMostPopularAnime(page = 1, size = 1, year = 2020) {
    return HikkaSets.fetchAnime(`popular_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      include_multiseason: false,
      only_translated: true,
    });
  }

  public static getOngoingAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`ongoing_anime_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
    });
  }

  public static getXentaiAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`xentai_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      genres: ['hentai'],
      only_translated: false,
    });
  }

  public static getRomanceAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`romance_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['romance'],
    });
  }

  public static getActionAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`action_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['action'],
    });
  }

  public static getIsekainAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`isekain_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['isekai'],
    });
  }

  public static getComedyAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`comedy_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['comedy'],
    });
  }

  public static getFantasyAnime(
    page = 1,
    size = 1,
    year = HikkaApi.currentYear,
  ) {
    return HikkaSets.fetchAnime(`fantasy_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['fantasy'],
    });
  }

  public static getSciFiAnime(page = 1, size = 1, year = HikkaApi.currentYear) {
    return HikkaSets.fetchAnime(`sci-fi_${page}_${size}`, page, size, {
      years: [year, HikkaApi.currentYear],
      status: ['ongoing'],
      genres: ['sci-fi'],
    });
  }

  public static getGenreAnime() {
    return HikkaSets.GENRES;
  }
}
