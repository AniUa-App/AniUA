import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type ProfileStatsPhoneStyles = {
  /** Контейнер статистики для телефону */
  statsContainer: ViewStyle;
  /** Елемент статистики */
  statItem: ViewStyle;
};

type ProfileStatsTabletsStyles = {
  /** Контейнер статистики для планшету/TV */
  statsContainer: ViewStyle;
  /** Рядок зі списком та графіком */
  statsRow: ViewStyle;
  /** Список статистики */
  statsList: ViewStyle;
  /** Контейнер кругової діаграми */
  chartContainer: ViewStyle;
  /** Центр кругової діаграми */
  chartCenter: ViewStyle;
  /** Елемент статистики */
  statItem: ViewStyle;
  /** Елемент статистики під графіком (з додатковими відступами) */
  chartStatItem: ViewStyle;
  /** Контейнер іконки */
  iconContainer: ViewStyle;
  /** Контейнер тексту */
  textContainer: ViewStyle;
};

export const useProfileStatsPhoneStyles = (): ProfileStatsPhoneStyles => {
  const layout = useLayout();

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
    },
  };
};

export const useProfileStatsTabletsStyles = (): ProfileStatsTabletsStyles => {
  const layout = useLayout();

  return {
    statsContainer: {
      flexDirection: "column",
      marginHorizontal: layout.spacing.lg,
      marginTop: layout.spacing.xlg,
      borderRadius: layout.radius.lg,
      padding: layout.spacing.lg,
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
  };
};
