import { useLayout } from "../../Layout";
import { useThemeColors } from "../../../Global/useTheme";
import { H4, H5, H6 } from "../../Fonts";
import type { ViewStyle, TextStyle } from "react-native";

type ProfileStatsPhoneStyles = {
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
};

type ProfileStatsTabletsStyles = {
  statsContainer: ViewStyle;
  statsRow: ViewStyle;
  statsList: ViewStyle;
  chartContainer: ViewStyle;
  chartCenter: ViewStyle;
  statItem: ViewStyle;
  chartStatItem: ViewStyle;
  iconContainer: ViewStyle;
  textContainer: ViewStyle;
  statLabel: TextStyle;
  statValue: TextStyle;
  chartCenterValue: TextStyle;
  chartCenterLabel: TextStyle;
  /** Розміри SVG кругової діаграми */
  chart: {
    size: number;
    strokeWidth: number;
    radius: number;
    circumference: number;
    center: number;
  };
};

export const useProfileStatsPhoneStyles = (): ProfileStatsPhoneStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    statsContainer: {
      flexDirection: "row",
      width: "100%",
      flexWrap: "wrap",
      justifyContent: "center",
      marginHorizontal: layout.spacing.xlg,
      marginTop: layout.spacing.xlg,
      gap: layout.spacing.sm,
    },
    statItem: {
      alignItems: "center",
      paddingVertical: layout.spacing.md,
      paddingHorizontal: layout.s(14),
      borderRadius: layout.radius.lg,
      gap: layout.spacing.xs,
      backgroundColor: theme.accent,
    },
    statValue: {
      ...H4,
      color: theme.text,
      fontWeight: "700",
    },
    statLabel: {
      ...H6,
      color: theme.text,
      opacity: 0.7,
    },
  };
};

export const useProfileStatsTabletsStyles = (): ProfileStatsTabletsStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    statsContainer: {
      flexDirection: "column",
      marginHorizontal: layout.spacing.lg,
      marginTop: layout.spacing.xlg,
      borderRadius: layout.radius.lg,
      padding: layout.spacing.lg,
      backgroundColor: theme.accent,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(84),
    },
    statsList: {
      gap: layout.spacing.lg,
    },
    chartContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    chartCenter: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: layout.s(38),
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.md,
      alignSelf: "flex-start",
    },
    chartStatItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.md,
      alignSelf: "flex-start",
      marginTop: layout.spacing.sm,
      justifyContent: "center",
      marginLeft: layout.spacing.lg,
    },
    iconContainer: {
      padding: layout.spacing.sm,
      borderRadius: layout.radius.xmd,
    },
    textContainer: {
      flex: 1,
    },
    statLabel: {
      ...H6,
      color: theme.text,
      opacity: 0.7,
    },
    statValue: {
      ...H5,
      color: theme.text,
    },
    chartCenterValue: {
      ...H4,
      color: theme.text,
      fontWeight: "700",
    },
    chartCenterLabel: {
      ...H6,
      color: theme.text,
      opacity: 0.5,
    },
    chart: (() => {
      const size = layout.s(120);
      const strokeWidth = layout.s(14);
      const radius = (size - strokeWidth) / 2;
      return {
        size,
        strokeWidth,
        radius,
        circumference: 2 * Math.PI * radius,
        center: size / 2,
      };
    })(),
  };
};
