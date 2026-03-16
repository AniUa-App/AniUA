import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type SearchScreenStyles = {
  /** Головний контейнер (flex: 1) */
  container: ViewStyle;
  /** Контейнер індикатора завантаження */
  loadingContainer: ViewStyle;
  /** Контейнер списку результатів */
  resultsContainer: ViewStyle;
};

export const useSearchScreenStyles = (): SearchScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    resultsContainer: { flexGrow: 1 },
  };
};
