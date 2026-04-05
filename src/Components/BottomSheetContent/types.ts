import { Episode, Team } from "../../Api/AniuaApi";

export interface BottomSheetContentRef {
  open: () => void;
  close: () => void;
}

export interface BottomSheetContentProps {
  /** Дані для картки (аніме/манґа) */
  item: any;
  /** Тип контенту */
  contentType: "anime" | "manga";
  /** Поточний вибраний епізод */
  currentEpisode?: number;
  /** Поточна вибрана команда */
  currentTeam?: string;
  /** Поточний вибраний плеєр */
  currentPlayer?: string;
  /** Використовувати вбудований плеєр для відтворення */
  useBuiltInPlayer?: boolean;
  /** Масив номерів переглянутих епізодів */
  watchedEpisodes?: number[];
  /** Callback при виборі епізоду */
  onSelectEpisode?: (
    episode: Episode,
    useBuiltIn: boolean,
    allEpisodes: Episode[],
  ) => void;
  /** Callback при довгому натисканні на епізод */
  onLongPressEpisode?: (episode: Episode) => void;
  /** Callback при зміні команди */
  onTeamChange?: (teamName: string) => void;
  /** Callback при зміні плеєра */
  onPlayerChange?: (player: string) => void;
  /** Callback при зміні toggle вбудованого плеєра */
  onBuiltInPlayerToggle?: (enabled: boolean) => void;
  /** Callback для манґи — повертає вибрану групу розділів */
  onSelectChapters?: (chapters: any[]) => void;
  /** Список переглянутих епізодів/розділів */
  watchedContent?: number[];
  /** Попередньо завантажені розділи манґи */
  prefetchedChapters?: any[];
  /** Провайдери (опціонально, щоб не фетчити) */
  providers?: any[];
}

export interface Player {
  name: string;
  icon: React.ReactNode;
}

export interface DubbingButtonProps {
  dubbingName: string;
  team: Team | null;
  currentPlayer: Player;
  onPress: () => void;
  useBuiltIn: boolean;
  onPlayerTypeToggle: (isBuiltIn: boolean) => void;
  hasTVPreferredFocus?: boolean;
}

export interface PlayerTabsProps {
  availablePlayers: string[];
  activePlayer: Player;
  onPlayerSelect: (player: string) => void;
  hasTVPreferredFocus?: boolean;
  nextFocusUp?: number;
  firstTabInnerRef?: React.Ref<any>;
  providers?: any[];
}

// EpisodeItemProps тепер визначені в EpisodeItem.tsx
