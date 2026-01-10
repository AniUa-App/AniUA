import { Storage } from "./Storage";
import { getDocumentDirectory } from "../FIleSystem/FileSystem";
import ReqCustomSet from "../Sources/CustomSet";

const DEFAULT_LISTS: CustomAnimeSet[] = [
  {
    name: "Онґоінги",
    animeSet: {
      Genres: [],
      Statuses: "ongoing",
      Seasons: "",
      Sort: "score",
      Rating: [],
      Years: [2024, new Date().getFullYear()],
      Score: [0, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
  {
    name: "Найпопулярніші",
    animeSet: {
      Genres: [],
      Statuses: "",
      Seasons: "",
      Sort: "score",
      Rating: [],
      Years: [2020, new Date().getFullYear()],
      Score: [8, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
  {
    name: "Романтика",
    animeSet: {
      Genres: ["romance"],
      Statuses: "",
      Seasons: "",
      Sort: "score",
      Rating: [],
      Years: [2020, new Date().getFullYear()],
      Score: [0, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
  {
    name: "Бойовики",
    animeSet: {
      Genres: ["action"],
      Statuses: "",
      Seasons: "",
      Sort: "score",
      Rating: [],
      Years: [2020, new Date().getFullYear()],
      Score: [0, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
  {
    name: "Фантастика",
    animeSet: {
      Genres: ["sci-fi"],
      Statuses: "",
      Seasons: "",
      Sort: "score",
      Rating: [],
      Years: [2020, new Date().getFullYear()],
      Score: [0, 10],
    },
    type: "horizontal",
    pages: 1,
    size: 50,
    isArrow: true,
  },
];

class PersonalRecListStorage extends Storage {
  storageKey = "userConfig.customAnimeRecommendations";
  constructor() {
    super();
  }

  initializeDefaultLists() {
    const settings = this.getItem(this.storageKey, []);
    if (!settings || settings.length === 0) {
      this.setItem(this.storageKey, DEFAULT_LISTS);
      return true;
    }
    return false;
  }

  resetToDefaultLists() {
    this.setItem(this.storageKey, DEFAULT_LISTS);
    return true;
  }

  getDefaultLists() {
    return DEFAULT_LISTS;
  }

  newSettingsList(animeSet: CustomAnimeSet) {
    const settings = this.getItem(this.storageKey, []);
    const newSettings = [...settings, animeSet];
    this.setItem(this.storageKey, newSettings);
  }

  getSettingsList() {
    const settings = this.getItem(this.storageKey, []);
    return settings;
  }

  deleteSettingsList(animeSet: CustomAnimeSet) {
    const settings = this.getItem(this.storageKey, []);
    const newSettings = settings.filter((set: CustomAnimeSet) => {
      return set.name !== animeSet.name;
    });
    this.setItem(this.storageKey, newSettings);
  }

  editSettingsList(name: string, animeSet: CustomAnimeSet) {
    const settings = this.getItem(this.storageKey, []);
    const newSettings = settings.map((set: CustomAnimeSet) => {
      if (set.name === name) {
        return animeSet;
      }
      return set;
    });
    this.setItem(this.storageKey, newSettings);
  }

  clearStorage() {
    this.setItem(this.storageKey, []);
  }
}

export default new PersonalRecListStorage();

export interface CustomAnimeSet {
  name: string;
  animeSet: ReqCustomSet;
  type: "horizontal" | "vertical";
  pages: number;
  size: number;
  isArrow: boolean;
}
