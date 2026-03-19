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
      paddingHorizontal: layout.spacing.lg,
      paddingTop: layout.spacing.xsm,
      paddingBottom: layout.spacing.md,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.spacing.md,
      width: "100%",
    },
    rowTextContainer: { paddingRight: layout.spacing.lg, maxWidth: "55%" },
    valuePill: { paddingVertical: layout.spacing.xsm, paddingHorizontal: layout.spacing.xmd, borderRadius: layout.radius.xmd, maxWidth: "45%" },
  };
};
