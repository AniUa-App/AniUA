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
      gap: layout.s(8),
      height: layout.s(38),
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(12),
      borderWidth: 1,
      borderRadius: layout.s(18),
      marginTop: layout.s(8),
      gap: layout.s(5),
    },
  };
};
