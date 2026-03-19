import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type MainScreenCustomisationStyles = {
  /** Кнопки керування списками */
  actionButtons: ViewStyle;
  /** Контейнер індикатора завантаження */
  loaderContainer: ViewStyle;
  /** Порожній стан без списків */
  emptyState: ViewStyle;
  /** Заголовок bottom sheet */
  sheetHeader: ViewStyle;
  /** Рядок введення назви */
  inputRow: ViewStyle;
  /** Контейнер поля вводу */
  inputContainer: ViewStyle;
  /** Кнопка дії */
  actionButton: ViewStyle;
  /** Контейнер фільтрів */
  filtersContainer: ViewStyle;
};

export const useMainScreenCustomisationStyles = (): MainScreenCustomisationStyles => {
  const layout = useLayout();

  return {
    actionButtons: { gap: layout.spacing.xxs },
    loaderContainer: { paddingVertical: layout.spacing.xxl, alignItems: "center", justifyContent: "center" },
    emptyState: { paddingVertical: layout.spacing.xxl, alignItems: "center", justifyContent: "center" },
    sheetHeader: { paddingHorizontal: layout.spacing.lg, paddingBottom: layout.spacing.lg, alignItems: "center" },
    inputRow: { flexDirection: "row", paddingHorizontal: layout.spacing.lg, marginBottom: layout.spacing.lg, gap: layout.spacing.md, alignItems: "center" },
    inputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: layout.sizing.touch,
      paddingHorizontal: layout.spacing.lg,
      borderRadius: layout.radius.md,
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    actionButton: { width: layout.sizing.touch, height: layout.sizing.touch, borderRadius: layout.radius.md, alignItems: "center", justifyContent: "center" },
    filtersContainer: { paddingHorizontal: layout.spacing.lg },
  };
};
