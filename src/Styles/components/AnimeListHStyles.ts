import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H3 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle } from "react-native";

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
      alignItems: "flex-end",
      backgroundColor: "transparent",
      width: "100%",
      marginTop: layout.spacing.sm,
    },
    title: {
      ...H3,
      padding: 0,
      marginLeft: layout.s(4),
      color: theme.text,
    },
    arrowIcon: {
      width: layout.s(38),
      height: layout.s(38),
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.accent,
    },
    arrowIconColor: theme.primary,
    listContent: {},
  };
};
