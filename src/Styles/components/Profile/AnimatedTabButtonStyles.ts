import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type AnimatedTabButtonStyles = {
  /** Елемент вкладки (квадратний, центрований) */
  tabItem: ViewStyle;
  icon: { size: number };
  button: {
    borderRadius: {
      borderBottomLeftRadius: number;
      borderBottomRightRadius: number;
      borderTopLeftRadius: number;
      borderTopRightRadius: number;
    };
    size: number;
  };
};

export const useAnimatedTabButtonStyles = (): AnimatedTabButtonStyles => {
  const layout = useLayout();

  return {
    tabItem: {
      paddingVertical: layout.spacing.md,
      paddingHorizontal: layout.spacing.md,
      justifyContent: "center",
      alignItems: "center",
    },
    icon: {
      size: layout.icon.lg,
    },
    button: {
      borderRadius: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: layout.radius.lg,
        borderTopRightRadius: layout.radius.lg,
      },
      size: layout.button.height,
    },
  };
};
