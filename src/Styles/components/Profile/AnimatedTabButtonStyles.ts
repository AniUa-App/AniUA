import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type AnimatedTabButtonStyles = {
  /** Елемент вкладки (квадратний, центрований) */
  tabItem: ViewStyle;
};

export const useAnimatedTabButtonStyles = (): AnimatedTabButtonStyles => {
  const layout = useLayout();

  return {
    tabItem: {
      paddingVertical: layout.s(12),
      paddingHorizontal: layout.s(12),
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
