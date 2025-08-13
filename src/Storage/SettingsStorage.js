import { Storage } from "./Storage";
import { getDocumentDirectory } from "../FIleSystem/FileSystem";

class SettingsStorage extends Storage {
  storageKey = "settingsStorage";
  constructor() {
    super();
  }

  async initializeParameters() {
    try {
      // Безпечне отримання шляху з перевіркою
      const documentDir = await getDocumentDirectory();
      const path = documentDir ? `${documentDir}episodes/` : "episodes/";

      this.setDefaultParameters({
        pathToSaveEpisodes: path,
      });
    } catch (error) {
      console.warn("Помилка ініціалізації параметрів SettingsStorage:", error);
      // Встановлюємо резервні значення
      this.setDefaultParameters({
        pathToSaveEpisodes: "episodes/",
      });
    }
  }

  setDefaultParameters(structure) {
    try {
      this.setItem(this.storageKey, structure);
    } catch (error) {
      console.error("Error setting default parameters:", error);
    }
  }

  getParameter(parameter) {
    try {
      const settings = this.getItem(this.storageKey, {});
      return settings[parameter] || "";
    } catch (error) {
      console.error("Error getting parameter:", error);
      return "";
    }
  }

  setParameter(parameter, value) {
    try {
      const settings = this.getItem(this.storageKey, {});
      this.setItem(this.storageKey, {
        ...settings,
        [parameter]: value,
      });
    } catch (error) {
      console.error("Error setting parameter:", error);
    }
  }
  setDefaultUserConfig() {
    try {
      this.setItem("userConfig.recommendations", {
        isEnabled: true,
        isDefaultBigBanner: true,
      });
    } catch (error) {
      console.error("Error setting default parameters:", error);
    }
  }
}

export default new SettingsStorage();
