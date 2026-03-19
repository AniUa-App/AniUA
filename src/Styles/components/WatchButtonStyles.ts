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
      borderRadius: layout.radius.md,
      overflow: "hidden",
      width: layout.sizing.touch,
      height: layout.sizing.touch,
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
