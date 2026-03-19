import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type AnimeStatusFABStyles = {
  /** Абсолютний оверлей для закриття меню при натисканні поза FAB */
  overlay: ViewStyle;
  /** Абсолютний контейнер FAB (правий нижній кут) */
  container: ViewStyle;
  /** Сама FAB кнопка */
  fab: ViewStyle;
  /** Елемент меню зі статусом */
  menuItem: ViewStyle;
  /** Розмір FAB (width/height) */
  size: number;
  /** Розмір іконки всередині FAB */
  iconSize: number;
};

export const useAnimeStatusFABStyles = (): AnimeStatusFABStyles => {
  const layout = useLayout();

  const size = layout.sizing.md;

  return {
    size,
    iconSize: size / 2,
    overlay: {
      position: "absolute",
    },
    container: {
      position: "absolute",
      alignItems: "flex-end",
    },
    fab: {
      width: size,
      height: size,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.spacing.xmd,
      paddingHorizontal: layout.spacing.lg,
      marginVertical: layout.spacing.xs,
      borderRadius: layout.radius.md,
    },
  };
};
