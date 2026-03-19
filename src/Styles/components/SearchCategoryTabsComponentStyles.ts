import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type SearchCategoryTabsComponentStyles = {
  /** ScrollView категорій */
  scrollView: ViewStyle;
  /** Контейнер рядка вкладок */
  container: ViewStyle;
  /** Базові стилі вкладки */
  tab: ViewStyle;
  /** Вкладка в активному стані */
  tabActive: ViewStyle;
  /** Вкладка в неактивному стані */
  tabInactive: ViewStyle;
  /** Вміст вкладки (іконка + мітка) */
  tabContent: ViewStyle;
  /** Мітка вкладки */
  tabLabel: TextStyle;
  /** Розмір іконки вкладки */
  iconSize: number;
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
        paddingHorizontal: layout.spacing.lg,
        paddingVertical: layout.spacing.lg,
        height: layout.s(55),
        gap: layout.spacing.sm,
      },
      tab: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: layout.spacing.md,
        borderRadius: layout.radius.xlg,
      },
      tabActive: {
        height: layout.s(40),
        paddingBottom: layout.spacing.xxs,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },
      tabInactive: {
        height: layout.s(34),
      },
      tabContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      tabLabel: {
        marginLeft: layout.spacing.xsm,
      },
      iconSize: layout.icon.sm,
    };
  };
