import { StatusBar } from "react-native";
import type { ViewStyle, TextStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../Global/useTheme";
import { useLayout } from "../Layout";
import { H3 } from "../Fonts";

type HeaderStyles = {
  container: ViewStyle;
  backButton: ViewStyle;
  title: TextStyle;
  icon: {
    size: number;
  };
};

export const useHeaderStyles = (): HeaderStyles => {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets?.() || { top: 0 };
  const layout = useLayout();

  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      backgroundColor: "transparent",
      paddingTop:
        Math.max(insets.top, StatusBar.currentHeight || 0) + layout.spacing.xmd,
      paddingVertical: layout.spacing.xmd,
      paddingLeft: layout.spacing.lg,
    },
    backButton: {
      backgroundColor: themeColors.accent,
      width: layout.sizing.touchSm,
      height: layout.sizing.touchSm,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: layout.radius.lg,
    },
    title: {
      ...H3,
      color: themeColors.text,
      paddingLeft: layout.spacing.xmd,
      flex: 1,
    },
    icon: {
      size: layout.icon.lg,
    },
  };
};
