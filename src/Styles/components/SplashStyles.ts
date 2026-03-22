import type { ViewStyle, ImageStyle, TextStyle } from "react-native";
import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { SvgProps } from "react-native-svg";

type SplashStyles = {
  container: ViewStyle;
  logo: (isNotFirstLaunch: boolean) => ImageStyle;
  moonIcon: ImageStyle;
  hikkaIcon: SvgProps;
  partnersRow: ViewStyle;
  welcomeTextContainer: ViewStyle;
  welcomeTextFont: TextStyle;
  versionContainer: (insetsBottom: number) => ViewStyle;
  versionText: TextStyle;
  warningIcon: ViewStyle;
};

export const useSplashStyles = (): SplashStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    logo: () => ({
      width: layout.s(300),
      height: layout.s(300),
      marginTop: -layout.s(100),
    }),

    moonIcon: {
      width: layout.sizing.md,
      height: layout.sizing.md,
    },

    hikkaIcon: {
      width: layout.s(220),
      height: layout.sizing.md,
    },

    partnersRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: layout.spacing.xmd,
      marginTop: layout.spacing.sm,
    },

    welcomeTextContainer: {
      position: "absolute",
      alignSelf: "center",
      marginTop: layout.s(220),
      flexDirection: "column",
    },

    welcomeTextFont: {
      fontSize: layout.s(64),
      color: themeColors.text,
    },

    versionContainer: (insetsBottom: number) => ({
      position: "absolute",
      bottom: Math.max(insetsBottom, layout.spacing.xlg) + layout.spacing.xmd,
      alignItems: "center",
      flexDirection: "row",
      gap: layout.spacing.xsm,
    }),

    versionText: {
      color: themeColors.text,
    },

    warningIcon: {
      top: layout.spacing.xxs,
    },
  };
};
