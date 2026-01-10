import { Dimensions } from "react-native";

export const TABS = [
  { id: "list", icon: "MonitorPlay" },
  { id: "favorites", icon: "Heart" },
];

export const FILTERS = [
  { id: "watching", label: "Дивлюсь", icon: "PlayCircle", colorKey: "primary" },
  {
    id: "planned",
    label: "У планах",
    icon: "PlusCircle",
    colorKey: "yellowBookmark",
  },
  {
    id: "completed",
    label: "Оглянуто",
    icon: "CheckCircle",
    colorKey: "orangeBookmark",
  },
  {
    id: "on_hold",
    label: "Відкладено",
    icon: "PauseCircle",
    colorKey: "blueBookmark",
  },
  {
    id: "dropped",
    label: "Закинуто",
    icon: "XCircle",
    colorKey: "redBookmark",
  },
];

export const FAVORITES_FILTERS = [
  { id: "anime", label: "Аніме", icon: "FilmStrip", colorKey: "primary" },
];

const { width, height } = Dimensions.get("window");
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
