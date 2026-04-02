import { HikkaApiComplete } from "./HikkaApiComplete";

export class HikkaSets extends HikkaApiComplete {
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

  protected static MANGA_SETS = {
    popular_year: HikkaSets.getMostPopularMangaOfTheYear,
    ongoing_manga: HikkaSets.getOngoingManga,
    romance: HikkaSets.getRomanceManga,
    action: HikkaSets.getActionManga,
    isekain: HikkaSets.getIsekaiManga,
    comedy: HikkaSets.getComedyManga,
    fantasy: HikkaSets.getFantasyManga,
    sci_fi: HikkaSets.getSciFiManga,
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
        `${HikkaApiComplete.apiUrl}anime?page=${page}&size=${size}`,
        {
          media_type: [],
          status: params.status || [],
          season: [],
          rating: [],
          years: params.years || [
            HikkaApiComplete.currentYear,
            HikkaApiComplete.currentYear,
          ],
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
      years: [HikkaApiComplete.currentYear, HikkaApiComplete.currentYear + 1],
      score: [8, 10],
      sort: ["score:desc"],
    });
  }

  public static getMostPopularAnime(page = 1, size = 1, year = 2020) {
    return HikkaSets.fetchAnime(`popular_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      sort: ["score:desc"],
      include_multiseason: false,
      only_translated: true,
    });
  }

  public static getOngoingAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`ongoing_anime_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      status: ["ongoing"],
    });
  }

  public static getXentaiAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`xentai_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["hentai"],
      only_translated: false,
    });
  }

  public static getRomanceAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`romance_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      status: ["ongoing"],
      genres: ["romance"],
    });
  }

  public static getActionAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`action_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["action"],
    });
  }

  public static getIsekainAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`isekain_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["isekai"],
    });
  }

  public static getComedyAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`comedy_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["comedy"],
    });
  }

  public static getFantasyAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`fantasy_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["fantasy"],
    });
  }

  public static getSciFiAnime(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchAnime(`sci-fi_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["sci-fi"],
    });
  }

  public static getGenreAnime() {
    return HikkaSets.GENRES;
  }

  private static fetchManga(
    cacheKey: string,
    page: number = 1,
    size: number = 1,
    params: {
      years?: number[];
      status?: string[];
      genres?: string[];
      only_translated?: boolean;
      sort?: string[];
    },
  ) {
    return HikkaSets.cachedRequest(cacheKey, async () => {
      const response = await this.axiosInstance.post(
        `${HikkaApiComplete.apiUrl}manga?page=${page}&size=${size}`,
        {
          status: params.status || [],
          years: params.years || [
            HikkaApiComplete.currentYear,
            HikkaApiComplete.currentYear,
          ],
          only_translated: params.only_translated ?? true,
          genres: params.genres || [],
          sort: params.sort || [],
        },
      );
      return response.data.list;
    }).catch(() => []);
  }

  public static getMostPopularMangaOfTheYear(page = 1, size = 1) {
    return HikkaSets.fetchManga(
      `manga_popular_year_${page}_${size}`,
      page,
      size,
      {
        years: [HikkaApiComplete.currentYear, HikkaApiComplete.currentYear + 1],
        sort: ["score:desc"],
      },
    );
  }

  public static getMostPopularManga(page = 1, size = 1, year = 2020) {
    return HikkaSets.fetchManga(`manga_popular_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      sort: ["score:desc"],
      only_translated: false,
    });
  }

  public static getOngoingManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_ongoing_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      status: ["ongoing"],
    });
  }

  public static getRomanceManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_romance_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["romance"],
    });
  }

  public static getActionManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_action_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["action"],
    });
  }

  public static getIsekaiManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_isekai_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["isekai"],
    });
  }

  public static getComedyManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_comedy_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["comedy"],
    });
  }

  public static getFantasyManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_fantasy_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["fantasy"],
    });
  }

  public static getSciFiManga(
    page = 1,
    size = 1,
    year = HikkaApiComplete.currentYear,
  ) {
    return HikkaSets.fetchManga(`manga_sci-fi_${page}_${size}`, page, size, {
      years: [year, HikkaApiComplete.currentYear],
      genres: ["sci-fi"],
    });
  }

  public static getGenreManga() {
    return HikkaSets.MANGA_SETS;
  }
}
