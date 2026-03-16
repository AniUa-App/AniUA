import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type AppInfoStyles = {
  /** Заголовок з іконкою застосунку */
  header: ViewStyle;
  /** Рядок інформації */
  row: ViewStyle;
  /** Контейнер тексту рядка */
  rowTextContainer: ViewStyle;
  /** Пігулка зі значенням */
  valuePill: ViewStyle;
};

export const useAppInfoStyles = (): AppInfoStyles => {
  const layout = useLayout();

  return {
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(16),
      paddingTop: layout.s(6),
      paddingBottom: layout.s(12),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(12),
      width: "100%",
    },
    rowTextContainer: { paddingRight: layout.s(16), maxWidth: "55%" },
    valuePill: { paddingVertical: layout.s(6), paddingHorizontal: layout.s(10), borderRadius: layout.s(10), maxWidth: "45%" },
  };
};
