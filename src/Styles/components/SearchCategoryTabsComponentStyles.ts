import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type SearchCategoryTabsComponentStyles = {
  /** ScrollView категорій */
  scrollView: ViewStyle;
  /** Контейнер рядка вкладок */
  container: ViewStyle;
  /** Одна вкладка категорії */
  tab: ViewStyle;
  /** Вміст вкладки (іконка + мітка) */
  tabContent: ViewStyle;
};

export const useSearchCategoryTabsComponentStyles =
  (): SearchCategoryTabsComponentStyles => {
    const layout = useLayout();

    return {
      scrollView: {
        flexGrow: 0,
        flexShrink: 0,
      },
      container: {
        paddingHorizontal: layout.s(16),
        paddingVertical: layout.s(16),
        height: layout.s(55),
        gap: layout.s(8),
      },
      tab: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: layout.s(12),
        height: layout.s(36),
        borderRadius: layout.s(18),
      },
      tabContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
    };
  };
