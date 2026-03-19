import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type FilterChipsStyles = {
  /** Контейнер горизонтального списку фільтрів */
  filtersContainer: ViewStyle;
  /** Один чіп фільтра */
  filterChip: ViewStyle;
};

export const useFilterChipsStyles = (): FilterChipsStyles => {
  const layout = useLayout();

  return {
    filtersContainer: {
      flexDirection: "row",
      gap: layout.spacing.sm,
      height: layout.sizing.touchSm,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.spacing.md,
      borderWidth: 1,
      borderRadius: layout.radius.xlg,
      marginTop: layout.spacing.sm,
      gap: layout.s(5),
    },
  };
};
