import { Episode, Team } from "../../Api/AniuaApi";

export interface BottomSheetDownloadRef {
  open: () => void;
  close: () => void;
}

export interface BottomSheetDownloadProps {
  /** Slug аніме для завантаження епізодів */
  slug: string;
  /** Дані аніме для завантаження */
  anime: any;
  /** Інформація про збережене аніме */
  info: any;
  /** Callback для оновлення info */
  onInfoChange?: (info: any) => void;
  /** Callback при успішному завантаженні */
  onDownloadComplete?: (episode: Episode, info: any) => void;
  /** Callback при помилці завантаження */
  onDownloadError?: (error: string, episode: Episode) => void;
}

export interface DownloadStatus {
  episode: number;
  status: "idle" | "downloading" | "completed" | "error";
  progress: number;
  error?: string;
}

export interface Player {
  name: string;
  icon: React.ReactNode;
}

export interface DownloadEpisodeItemProps {
  episode: Episode;
  anime: any;
  isDownloaded: boolean;
  downloadStatus?: DownloadStatus;
  onDownloadPress: () => void;
  onOpenPress?: () => void;
  onSharePress?: () => void;
}
