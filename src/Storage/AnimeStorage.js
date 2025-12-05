import { Storage } from "./Storage";

class AnimeStorage extends Storage {
  storageKey = "animeStorage";
  constructor() {
    super();
  }

  getInfos() {
    return this.getItem(this.storageKey, {});
  }

  setInfos(infos = {}) {
    this.setItem(this.storageKey, infos);
  }

  getInfoBySlug(slug) {
    return (
      this.getItem(this.storageKey, {})[slug] || {
        isFavorite: false,
        watched: { player: "", dubbing: "", episodes: [] },
        bookmark: "",
      }
    );
  }

  setInfoBySlug(
    slug,
    data = {
      isFavorite: false,
      watched: { player: "", dubbing: "", episodes: [] },
      downloaded: {
        episodes: [],
      },
    }
  ) {
    const animeList = this.getItem(this.storageKey, {});
    const existingInfo = animeList[slug] || {};

    // Зберігаємо існуючі значення, якщо нові не передані
    animeList[slug] = {
      isFavorite:
        data.isFavorite !== undefined
          ? data.isFavorite
          : existingInfo.isFavorite,
      watched:
        data.watched !== undefined
          ? data.watched
          : existinginfo?.watched || { player: "", dubbing: "", episodes: [] },
      downloaded:
        data.downloaded !== undefined
          ? data.downloaded
          : existingInfo.downloaded || {
              episodes: [],
            },
    };

    this.setItem(this.storageKey, animeList);
  }

  removeInfoBySlug(slug) {
    const animeList = this.getItem(this.storageKey, {});

    delete animeList[slug];

    this.setItem(this.storageKey, animeList);
  }
}

export default new AnimeStorage();
