import {
  getAnalytics,
  logEvent,
  setUserId,
  setAnalyticsCollectionEnabled,
} from "@react-native-firebase/analytics";
import MainConfig from "../cfgs/MainConfig";
import Logger from "../Logger/Logger";

const TAG = "AnalyticsService";

export type AnalyticsEventName =
  | "anime_open"
  | "episode_start"
  | "search"
  | "bookmark_change"
  | "download_start"
  | "download_complete"
  | "login"
  | "sign_up"
  | "qr_login";

class AnalyticsService {
  private static isDebug(): boolean {
    return MainConfig.debug.isDebug;
  }

  private static getDeviceParams(): Record<string, string> {
    return {
      app_version: MainConfig.devInfo.version,
      git_hash: MainConfig.devInfo.gitShortHash || MainConfig.devInfo.gitHash,
      device_model: MainConfig.devInfo.model,
      os_version:
        `${MainConfig.devInfo.systemName} ${MainConfig.devInfo.systemVersion}`.trim(),
    };
  }

  static logEvent(name: string, params?: Record<string, any>): void {
    Logger.debug(TAG, name, params);
    if (this.isDebug()) return;
    logEvent(getAnalytics(), name, params).catch(() => {});
  }

  static logScreen(screenName: string, screenClass?: string): void {
    Logger.debug(TAG, "screen_view", { screenName, screenClass });
    if (this.isDebug()) return;
    logEvent(getAnalytics(), "screen_view", {
      firebase_screen: screenName,
      firebase_screen_class: screenClass ?? screenName,
    }).catch(() => {});
  }

  static setUserId(id: string | null): void {
    Logger.debug(TAG, "setUserId", { id });
    if (this.isDebug()) return;
    setUserId(getAnalytics(), id).catch(() => {});
  }

  static setEnabled(enabled: boolean): void {
    setAnalyticsCollectionEnabled(getAnalytics(), enabled).catch(() => {});
  }

  static logAnimeOpen(
    slug: string,
    title: string,
    genres?: string[],
    isBookmarked?: boolean,
  ): void {
    const params: Record<string, any> = { slug, title };
    if (genres && genres.length > 0) {
      params.genres = genres.join(", ");
    }
    if (isBookmarked !== undefined) {
      params.is_bookmarked = isBookmarked;
    }
    this.logEvent("anime_open", params);
  }

  static logEpisodeStart(
    slug: string,
    episode: number,
    team: string,
    player: "builtin" | "web",
    source: string,
  ): void {
    this.logEvent("episode_start", { slug, episode, team, player, source });
  }

  static logSearch(query: string): void {
    this.logEvent("search", { query });
  }

  static logBookmarkChange(slug: string, action: string, status: string): void {
    this.logEvent("bookmark_change", { slug, action, status });
  }

  static logDownload(
    slug: string,
    episode: number,
    event: "start" | "complete",
  ): void {
    const name = event === "start" ? "download_start" : "download_complete";
    this.logEvent(name, { slug, episode });
  }

  static logLogin(method: "hikka" | "qr"): void {
    this.logEvent("login", { method, ...this.getDeviceParams() });
  }

  static logSignUp(): void {
    this.logEvent("sign_up", this.getDeviceParams());
  }
}

export default AnalyticsService;
