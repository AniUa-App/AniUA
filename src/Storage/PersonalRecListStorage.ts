import { Storage } from "./Storage";
import { getDocumentDirectory } from "../FIleSystem/FileSystem";
import ReqCustomSet from "../Sources/CustomSet";

class PersonalRecListStorage extends Storage {
  storageKey = "userConfig.customAnimeRecommendations";
  constructor() {
    super();
  }

  newSettingsList(AnimeSet: CustomAnimeSet) {
    const settings = this.getItem(this.storageKey, []);
    const newSettings = [...settings, AnimeSet];
    this.setItem(this.storageKey, newSettings);
  }

  getSettingsList() {
    const settings = this.getItem(this.storageKey, []);
    return settings;
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
