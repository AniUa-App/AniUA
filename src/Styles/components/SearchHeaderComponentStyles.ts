import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type SearchHeaderComponentStyles = {
  /** Рядок заголовка пошуку */
  header: ViewStyle;
  /** Кнопка (назад/фільтр) */
  button: ViewStyle;
  /** Контейнер поля пошуку */
  searchInputContainer: ViewStyle;
  icon: {
    size: number;
  };
};

export const useSearchHeaderComponentStyles =
  (): SearchHeaderComponentStyles => {
    const layout = useLayout();

    return {
      header: {
        flexDirection: "row",
        paddingHorizontal: layout.spacing.lg,
      },
      button: {
        width: layout.sizing.touch,
        height: layout.sizing.touch,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: layout.radius.lg,
      },
      searchInputContainer: {
        flex: 1,
        borderRadius: layout.radius.lg,
        paddingHorizontal: layout.spacing.md,
      },
      icon: {
        size: layout.icon.lg,
      },
    };
  };
