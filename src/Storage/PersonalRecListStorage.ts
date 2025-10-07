import { Storage } from "./Storage";
import { getDocumentDirectory } from "../FIleSystem/FileSystem";
import ReqCustomSet from "../Sources/CustomSet";

class PersonalRecListStorage extends Storage {
  storageKey = "userConfig.customAnimeRecommendations";
  constructor() {
    super();
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
