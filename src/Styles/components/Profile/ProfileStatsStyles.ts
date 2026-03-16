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
      marginHorizontal: layout.s(20),
      marginTop: layout.s(20),
      gap: layout.s(8),
    },
    statItem: {
      alignItems: "center",
      paddingVertical: layout.s(12),
      paddingHorizontal: layout.s(14),
      borderRadius: layout.s(16),
      gap: layout.s(4),
    },
  };
};

export const useProfileStatsTabletsStyles = (): ProfileStatsTabletsStyles => {
  const layout = useLayout();

  return {
    statsContainer: {
      flexDirection: "column",
      marginHorizontal: layout.s(16),
      marginTop: layout.s(20),
      borderRadius: layout.s(16),
      padding: layout.s(16),
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(84),
    },
    statsList: {
      gap: layout.s(16),
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
      gap: layout.s(12),
      alignSelf: "flex-start",
    },
    iconContainer: {
      padding: layout.s(8),
      borderRadius: layout.s(10),
    },
    textContainer: {
      flex: 1,
    },
  };
};
