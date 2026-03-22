import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type AnimeGridStyles = {
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  animeGridContainer: ViewStyle;
  row: ViewStyle;
  /** flex: 1 — рівний розподіл між картками і заповнювачами */
  cardWrapper: ViewStyle;
  /** Кількість колонок по реальній ширині контейнера */
  numColumns: (containerWidth: number) => number;
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
    },
    animeGridContainer: {
      width: "100%",
      paddingVertical: layout.spacing.xs,
      gap: layout.spacing.xsm,
      minHeight: "50%",
    },
    row: {
      flexDirection: "row",
    },
    cardWrapper: {
      flex: 1,
    },
    // Ділимо реальну ширину контейнера на цільову ширину картки
    numColumns: (containerWidth) =>
      containerWidth > 0
        ? Math.max(2, Math.round(containerWidth / layout.cardWidth))
        : 3,
  };
};
