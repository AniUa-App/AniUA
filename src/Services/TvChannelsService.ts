import { NativeModules } from "react-native";
import AnimeStorage from "../Storage/AnimeStorage";
import AnimeHashStorage from "../Storage/AnimeHashStorage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import Logger from "../Logger/Logger";

const { TvChannels } = NativeModules;

const CONTEXT = "TvChannelsService";

const CHANNELS = {
  WATCH_HISTORY: "watch_history",
} as const;

interface AnimeHashEntry {
  slug: string;
  title_ua?: string;
  title_en?: string;
  title_ja?: string;
  image?: string;
  episodes_total?: number;
  episodes_released?: number;
  media_type?: string;
  genres?: Array<{ name_ua: string; name_en: string; slug: string; type: string }>;
}

/**
 * Сервіс для публікації каналів на домашньому екрані Android TV
 */
export class TvChannelsService {
  private static isTV: boolean | null = null;

  public static async checkIsTV(): Promise<boolean> {
    if (this.isTV !== null) return this.isTV;
    if (!TvChannels) {
      this.isTV = false;
      return false;
    }
    try {
      this.isTV = await TvChannels.isAndroidTV();
    } catch (e) {
      this.isTV = false;
    }
    return this.isTV;
  }

  public static async debugInfo(): Promise<Record<string, any> | null> {
    if (!TvChannels) return null;
    try {
      const info = await TvChannels.debug();
      console.log("[TV] debugInfo:", JSON.stringify(info));
      return info;
    } catch (e) {
      console.error("[TV] debugInfo error:", e);
      return null;
    }
  }

  /**
   * Отримує метадані — спочатку кеш, потім API (з затримкою щоб не рейтлімітити)
   */
  private static async getAnimeMetadata(
    slug: string
  ): Promise<AnimeHashEntry | null> {
    // 1. Кеш
    if (AnimeHashStorage.isHash(slug)) {
      return AnimeHashStorage.getHashBySlug(slug) as AnimeHashEntry;
    }

    // 2. API з невеликою затримкою
    try {
      await new Promise((r) => setTimeout(r, 200));
      const details = await HikkaApiComplete.getAnimeDetails(slug);
      if (details) {
        AnimeHashStorage.addHash(slug, details);
        return details as unknown as AnimeHashEntry;
      }
    } catch (e) {
      // silent
    }

    return null;
  }

  private static getFirstGenre(meta: AnimeHashEntry): string {
    if (!meta.genres || meta.genres.length === 0) return "";
    const genre = meta.genres.find((g) => g.type === "genre");
    return genre?.name_ua || meta.genres[0]?.name_ua || "";
  }

  /**
   * Синхронізує канал "Історія перегляду" на домашньому екрані Android TV
   */
  public static async syncWatchHistory(): Promise<void> {
    const isTv = await this.checkIsTV();
    if (!isTv) return;

    try {
      const allAnime = AnimeStorage.getAll();

      // Збираємо всі переглянуті аніме, дедуплікуємо за slug
      const seen = new Set<string>();
      const watchedSlugs = Object.entries(allAnime)
        .filter(([slug, info]) => {
          if (seen.has(slug)) return false;
          seen.add(slug);
          return info.watched_episodes && info.watched_episodes.length > 0;
        })
        .map(([slug, info]) => ({
          slug,
          watchedCount: info.watched_episodes.length,
        }));

      console.log(`[TV] Всього з історією: ${watchedSlugs.length}`);

      if (watchedSlugs.length === 0) return;

      // Спочатку беремо ті що вже в кеші (AnimeHashStorage) — вони є одразу
      const fromCache: Array<{ slug: string; watchedCount: number; meta: AnimeHashEntry }> = [];
      const needFetch: Array<{ slug: string; watchedCount: number }> = [];

      for (const item of watchedSlugs) {
        if (AnimeHashStorage.isHash(item.slug)) {
          const meta = AnimeHashStorage.getHashBySlug(item.slug) as AnimeHashEntry;
          if (meta && meta.image) {
            fromCache.push({ ...item, meta });
          }
        } else {
          needFetch.push(item);
        }
      }

      console.log(`[TV] З кешу: ${fromCache.length}, потрібно fetch: ${needFetch.length}`);

      // Фетчимо тільки ті що не в кеші (максимум 10 щоб не рейтлімітити)
      const fetchLimit = Math.min(needFetch.length, 10);
      const fetched: Array<{ slug: string; watchedCount: number; meta: AnimeHashEntry }> = [];

      for (let i = 0; i < fetchLimit; i++) {
        const item = needFetch[i];
        const meta = await this.getAnimeMetadata(item.slug);
        if (meta && meta.image) {
          fetched.push({ ...item, meta });
        }
      }

      console.log(`[TV] Fetch успішних: ${fetched.length}`);

      // Об'єднуємо і обмежуємо до 20
      const allPrograms = [...fromCache, ...fetched].slice(0, 20);

      console.log(`[TV] Всього програм для каналу: ${allPrograms.length}`);

      if (allPrograms.length === 0) return;

      const programs = allPrograms.map((item, i) => {
        const title = item.meta.title_ua || item.meta.title_en || item.meta.title_ja || item.slug;
        const genre = this.getFirstGenre(item.meta);
        const total = item.meta.episodes_total || item.meta.episodes_released || 0;

        const descParts: string[] = [];
        if (genre) descParts.push(genre);
        if (total > 0) descParts.push(`${item.watchedCount}/${total} еп.`);
        else if (item.watchedCount > 0) descParts.push(`${item.watchedCount} еп.`);

        return {
          title,
          intentUri: `aniua://anime/${item.slug}`,
          posterArtUri: item.meta.image,
          internalProviderId: item.slug,
          type: item.meta.media_type === "movie" ? "MOVIE" : "TV_SERIES",
          description: descParts.join(", ") || undefined,
          weight: allPrograms.length - i,
        };
      });

      const result = await TvChannels.syncChannel(
        {
          displayName: "Історія перегляду",
          internalProviderName: CHANNELS.WATCH_HISTORY,
          appLinkIntentUri: "aniua://home",
        },
        programs
      );

      console.log(`[TV] Канал оновлено: id=${result.channelId}, програм=${result.programIds?.length || 0}`);
    } catch (e) {
      console.error("[TV] Помилка синхронізації:", e);
    }
  }
}

export default TvChannelsService;
