import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type HistoryComponentStyles = {
  /** Контейнер індикатора завантаження */
  loaderContainer: ViewStyle;
};

export const useHistoryComponentStyles = (): HistoryComponentStyles => {
  const layout = useLayout();

  return {
    loaderContainer: {
      justifyContent: "center",
      alignItems: "center",
      padding: layout.s(30),
      height: layout.sizing.img,
    },
  };
};
