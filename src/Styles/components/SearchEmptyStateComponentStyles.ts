import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type SearchEmptyStateComponentStyles = {
  /** Контейнер пустого стану пошуку */
  container: ViewStyle;
  /** Текст підказки */
  text: TextStyle;
};

export const useSearchEmptyStateComponentStyles =
  (): SearchEmptyStateComponentStyles => {
    const layout = useLayout();

    return {
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "60%",
      },
      text: {
        opacity: 0.6,
        marginTop: layout.s(16),
      },
    };
  };
