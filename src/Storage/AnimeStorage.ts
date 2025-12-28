import { Storage } from "./Storage";

export interface DownloadedEpisode {
  episode: number;
  video_path: string;
  dubbing?: string;
  player?: string;
}

export interface AnimeInfo {
  watched_episodes: number[];
  player: string;
  dub_team: string;
  downloaded_episodes: DownloadedEpisode[];
  useBuiltIn: boolean;
}

type AnimeStorageData = Record<string, AnimeInfo>;

const DEFAULT_INFO: AnimeInfo = {
  watched_episodes: [],
  player: "",
  dub_team: "",
  downloaded_episodes: [],
  useBuiltIn: false, // Web player by default
};

class AnimeStorage extends Storage {
  private readonly storageKey = "animeStorage";

  getAll(): AnimeStorageData {
    return this.getItem(this.storageKey, {});
  }

  setAll(data: AnimeStorageData): void {
    this.setItem(this.storageKey, data);
  }

  get(slug: string): AnimeInfo {
    return this.getAll()[slug] ?? { ...DEFAULT_INFO };
  }

  set(slug: string, data: Partial<AnimeInfo>): void {
    const storage = this.getAll();
    const existing = storage[slug] ?? { ...DEFAULT_INFO };

    storage[slug] = {
      watched_episodes: data.watched_episodes ?? existing.watched_episodes,
      player: data.player ?? existing.player,
      dub_team: data.dub_team ?? existing.dub_team,
      downloaded_episodes: data.downloaded_episodes ?? existing.downloaded_episodes,
      useBuiltIn: data.useBuiltIn ?? existing.useBuiltIn,
    };

    this.setAll(storage);
  }

  remove(slug: string): void {
    const storage = this.getAll();
    delete storage[slug];
    this.setAll(storage);
  }

  getWatchedEpisodes(slug: string): number[] {
    return this.get(slug).watched_episodes;
  }

  getWatchedCount(slug: string): number {
    return this.getWatchedEpisodes(slug).length;
  }

  // Legacy aliases for backward compatibility
  getInfos = this.getAll.bind(this);
  setInfos = this.setAll.bind(this);
  getInfoBySlug = this.get.bind(this);
  setInfoBySlug = this.set.bind(this);
  removeInfoBySlug = this.remove.bind(this);
}

export default new AnimeStorage();
