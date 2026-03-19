import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H2, H3, H3_05 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle } from "react-native";
import { background } from "../Colors";

type AnimeListHStyles = {
  /** Ширина картки аніме (залежить від типу пристрою) */
  cardWidth: number;
  /** Розмір іконки стрілки */
  iconSize: number;
  /** Обгортка всього компонента */
  container: ViewStyle;
  /** Рядок з назвою списку та стрілкою */
  header: ViewStyle;
  /** Назва списку (H3) */
  title: TextStyle;
  /** Круглий контейнер іконки стрілки */
  arrowIcon: ViewStyle;
  /** Колір іконки стрілки */
  arrowIconColor: string;
  /** contentContainerStyle для FlatList */
  listContent: ViewStyle;
};

export const useAnimeListHStyles = (): AnimeListHStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    cardWidth: layout.cardWidth,
    iconSize: layout.icon.md,
    container: {},
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "transparent",
      width: "100%",
      marginTop: layout.spacing.sm,
    },
    title: {
      ...H2,
      padding: 0,
      marginLeft: layout.spacing.md,
      color: theme.text,
      paddingVertical: layout.paddings.xs,
    },
    arrowIcon: {
      width: layout.sizing.touchSm,
      height: layout.sizing.touchSm,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.accent,
    },
    arrowIconColor: theme.primary,
    listContent: {},
  };
};
