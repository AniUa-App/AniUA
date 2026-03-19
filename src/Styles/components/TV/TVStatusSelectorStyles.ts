import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle } from "react-native";

type TVStatusSelectorStyles = {
  /** ScrollView з вкладками статусів */
  scrollView: ViewStyle;
  /** contentContainerStyle списку вкладок */
  container: ViewStyle;
  /** Одна вкладка статусу */
  tab: ViewStyle;
  /** Вміст вкладки (іконка + текст) */
  tabContent: ViewStyle;
  /** Підпис статусу */
  label: TextStyle;
};

export const useTVStatusSelectorStyles = (): TVStatusSelectorStyles => {
  const layout = useLayout();

  return {
    scrollView: {
      flexGrow: 0,
      flexShrink: 0,
    },
    container: {
      paddingHorizontal: TV.padding.screen,
      paddingVertical: layout.spacing.lg,
      height: layout.s(55),
      gap: layout.spacing.sm,
    },
    tab: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: layout.spacing.md,
      height: layout.button.heightSm,
      borderRadius: layout.radius.xlg,
    },
    tabContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontFamily: "Nunito-SemiBold",
      marginLeft: layout.spacing.xsm,
    },
  };
};
