import { Episode, Team } from "../../Api/AniuaApi";

export interface BottomSheetEpisodesRef {
  open: () => void;
  close: () => void;
}

export interface BottomSheetEpisodesProps {
  /** Аніме для завантаження епізодів */
  anime: any;
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
  onSelectEpisode?: (episode: Episode, useBuiltIn: boolean, allEpisodes: Episode[]) => void;
  /** Callback при довгому натисканні на епізод */
  onLongPressEpisode?: (episode: Episode) => void;
  /** Callback при зміні команди */
  onTeamChange?: (teamName: string) => void;
  /** Callback при зміні плеєра */
  onPlayerChange?: (player: string) => void;
  /** Callback при зміні toggle вбудованого плеєра */
  onBuiltInPlayerToggle?: (enabled: boolean) => void;
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
}

export interface PlayerTabsProps {
  availablePlayers: string[];
  activePlayer: Player;
  onPlayerSelect: (player: string) => void;
}

// EpisodeItemProps тепер визначені в EpisodeItem.tsx
