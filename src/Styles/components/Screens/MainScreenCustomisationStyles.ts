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
    actionButtons: { gap: layout.s(2) },
    loaderContainer: { paddingVertical: layout.s(32), alignItems: "center", justifyContent: "center" },
    emptyState: { paddingVertical: layout.s(32), alignItems: "center", justifyContent: "center" },
    sheetHeader: { paddingHorizontal: layout.s(16), paddingBottom: layout.s(16), alignItems: "center" },
    inputRow: { flexDirection: "row", paddingHorizontal: layout.s(16), marginBottom: layout.s(16), gap: layout.s(12), alignItems: "center" },
    inputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: layout.s(44),
      paddingHorizontal: layout.s(16),
      borderRadius: layout.s(12),
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    actionButton: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(12), alignItems: "center", justifyContent: "center" },
    filtersContainer: { paddingHorizontal: layout.s(16) },
  };
};
