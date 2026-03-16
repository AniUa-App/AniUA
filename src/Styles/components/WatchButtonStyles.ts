import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type WatchButtonStyles = {
  /** Зовнішній контейнер кнопки перегляду та завантаження */
  container: ViewStyle;
  /** Кнопка перегляду (flex: 1) */
  watchButton: ViewStyle;
  /** Кнопка завантаження (праворуч) */
  downloadButton: ViewStyle;
};

export const useWatchButtonStyles = (): WatchButtonStyles => {
  const layout = useLayout();

  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: layout.s(12),
      overflow: "hidden",
      width: layout.s(44),
      height: layout.s(44),
    },
    watchButton: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    downloadButton: {
      width: "18%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderLeftWidth: 1,
    },
  };
};
