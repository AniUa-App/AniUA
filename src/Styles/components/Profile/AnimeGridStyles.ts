import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type AnimeGridStyles = {
  /** Контейнер пустого стану */
  emptyState: ViewStyle;
  /** Текст пустого стану */
  emptyStateText: TextStyle;
  /** Контейнер сітки аніме */
  animeGridContainer: ViewStyle;
  /** Один елемент сітки */
  animeGridItem: ViewStyle;
};

export const useAnimeGridStyles = (): AnimeGridStyles => {
  const layout = useLayout();

  return {
    emptyState: {
      width: "100%",
      alignItems: "center",
      paddingTop: layout.spacing.xl3,
      minHeight: "50%",
    },
    emptyStateText: {
      textAlign: "center",
      marginTop: layout.spacing.sm,
    },
    animeGridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingTop: layout.spacing.md,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      minHeight: "50%",
    },
    animeGridItem: {
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
