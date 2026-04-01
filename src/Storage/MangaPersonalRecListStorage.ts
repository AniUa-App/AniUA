import { Storage } from "./Storage";
import { CustomMangaSet } from "../Sources/MangaCustomSet";

const DEFAULT_MANGA_LISTS: CustomMangaSet[] = [
  {
    name: "Популярна манґа",
    mangaSet: {
      Genres: [],
      Statuses: "",
      Sort: "Загальна оцінка",
      Years: [2010, new Date().getFullYear()],
      Score: [7, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
  {
    name: "Онґоінги",
    mangaSet: {
      Genres: [],
      Statuses: "ongoing",
      Sort: "Дата релізу",
      Years: [2020, new Date().getFullYear()],
      Score: [0, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
];

class MangaPersonalRecListStorage extends Storage {
  storageKey = "userConfig.customMangaRecommendations";

  constructor() {
    super();
  }

  initializeDefaultLists() {
    const settings = this.getItem(this.storageKey, []);
    if (!settings || settings.length === 0) {
      this.setItem(this.storageKey, DEFAULT_MANGA_LISTS);
      return true;
    }
    return false;
  }

  resetToDefaultLists() {
    this.setItem(this.storageKey, DEFAULT_MANGA_LISTS);
    return true;
  }

  getDefaultLists() {
    return DEFAULT_MANGA_LISTS;
  }

  newSettingsList(mangaSet: CustomMangaSet) {
    const settings = this.getItem(this.storageKey, []);
    this.setItem(this.storageKey, [...settings, mangaSet]);
  }

  getSettingsList(): CustomMangaSet[] {
    return this.getItem(this.storageKey, []);
  }

  deleteSettingsList(mangaSet: CustomMangaSet) {
    const settings = this.getItem(this.storageKey, []);
    this.setItem(
      this.storageKey,
      settings.filter((s: CustomMangaSet) => s.name !== mangaSet.name),
    );
  }

  editSettingsList(name: string, mangaSet: CustomMangaSet) {
    const settings = this.getItem(this.storageKey, []);
    this.setItem(
      this.storageKey,
      settings.map((s: CustomMangaSet) => (s.name === name ? mangaSet : s)),
    );
  }

  clearStorage() {
    this.setItem(this.storageKey, []);
  }
}

export default new MangaPersonalRecListStorage();
