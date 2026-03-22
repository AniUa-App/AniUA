import { StatusBar } from "react-native";
import type { ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayout } from "../../Layout";
import { useThemeColors } from "../../../Global/useTheme";

type SearchScreenStyles = {
  /** Головний контейнер (flex: 1) */
  container: ViewStyle;
  /** Контейнер індикатора завантаження */
  loadingContainer: ViewStyle;
  /** Контейнер списку результатів */
  resultsContainer: ViewStyle;
  /** Обгортка списку (TVFocusGuideView / flex: 1) */
  listWrapper: ViewStyle;
  /** Відступ зверху для header (safe area + status bar) */
  headerPaddingTop: number;
  /** Колір індикатора завантаження */
  loaderColor: string;
};

export const useSearchScreenStyles = (): SearchScreenStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();

  const headerPaddingTop =
    Math.max(insets.top, StatusBar.currentHeight || 0) + layout.spacing.xmd;

  return {
    container: { flex: 1 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: themeColors.accent,
    },
    resultsContainer: {
      flexGrow: 1,
      backgroundColor: themeColors.accent,
    },
    listWrapper: { flex: 1 },
    headerPaddingTop,
    loaderColor: themeColors.primary,
  };
};
