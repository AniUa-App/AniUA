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
    label: {
      fontFamily: "Nunito-SemiBold",
      marginLeft: layout.s(6),
    },
  };
};
