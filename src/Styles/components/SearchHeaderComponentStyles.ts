import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type SearchHeaderComponentStyles = {
  /** Рядок заголовка пошуку */
  header: ViewStyle;
  /** Кнопка (назад/фільтр) */
  button: ViewStyle;
  /** Контейнер поля пошуку */
  searchInputContainer: ViewStyle;
};

export const useSearchHeaderComponentStyles =
  (): SearchHeaderComponentStyles => {
    const layout = useLayout();

    return {
      header: {
        flexDirection: "row",
        paddingHorizontal: layout.s(16),
      },
      button: {
        padding: layout.s(6),
        borderRadius: layout.s(16),
      },
      searchInputContainer: {
        flex: 1,
        borderRadius: layout.s(16),
        paddingHorizontal: layout.s(12),
      },
    };
  };
