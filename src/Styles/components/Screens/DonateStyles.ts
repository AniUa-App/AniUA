import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type DonateStyles = {
  /** Головний контейнер з центруванням */
  container: ViewStyle;
  /** Контейнер для поля вводу суми */
  inputContainer: ViewStyle;
  /** Поле вводу суми */
  amountInput: TextStyle;
  /** Символ валюти */
  currency: TextStyle;
  /** Основна кнопка пожертви */
  primaryButton: ViewStyle;
  /** Текст основної кнопки */
  primaryButtonText: TextStyle;
  /** Підпис знизу */
  caption: TextStyle;
};

export const useDonateStyles = (): DonateStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    inputContainer: {
      width: "40%",
      height: "8%",
      borderRadius: layout.s(8),
      marginTop: layout.s(20),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: layout.s(8),
      paddingHorizontal: layout.s(16),
      gap: layout.s(8),
    },
    amountInput: { flex: 1, textAlign: "center", fontSize: 40, lineHeight: 40, paddingVertical: 0, textAlignVertical: "center" },
    currency: { fontSize: 55, lineHeight: 55 },
    primaryButton: {
      width: "70%",
      borderRadius: layout.s(8),
      paddingVertical: layout.s(12),
      alignItems: "center",
      justifyContent: "center",
      marginTop: layout.s(26),
    },
    primaryButtonText: { textAlign: "center", fontSize: 18, lineHeight: 22 },
    caption: { alignSelf: "center", marginTop: layout.s(16), lineHeight: 18 },
  };
};
