import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type QRLoginScreenStyles = {
  /** Головний контейнер з центруванням */
  container: ViewStyle;
  /** Кнопка "назад" */
  backButton: ViewStyle;
  /** Заголовок екрану */
  title: TextStyle;
  /** Підзаголовок екрану */
  subtitle: TextStyle;
  /** Контейнер QR-коду */
  qrContainer: ViewStyle;
  /** Обгортка QR-коду */
  qrWrapper: ViewStyle;
  /** Контейнер статусу */
  statusContainer: ViewStyle;
  /** Кнопка "спробувати ще раз" */
  retryButton: ViewStyle;
  /** Підказка внизу */
  hint: TextStyle;
  /** DEV: контейнер дебаг кнопки */
  debugContainer: ViewStyle;
  /** DEV: кнопка копіювати */
  debugCopyButton: ViewStyle;
};

export const useQRLoginScreenStyles = (): QRLoginScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.s(32) },
    backButton: {
      position: "absolute",
      top: layout.s(16),
      left: layout.s(16),
      padding: layout.s(8),
      width: layout.s(44),
      borderRadius: layout.s(16),
      justifyContent: "center",
      alignItems: "center",
      height: layout.s(44),
    },
    title: { fontFamily: "Nunito-Bold", fontSize: 28, textAlign: "center", marginBottom: layout.s(8) },
    subtitle: { textAlign: "center", lineHeight: 22, marginBottom: layout.s(32), paddingHorizontal: layout.s(16) },
    qrContainer: { alignItems: "center", justifyContent: "center", minHeight: layout.s(260) },
    qrWrapper: { padding: layout.s(16), borderRadius: layout.s(16), backgroundColor: "white" },
    statusContainer: { alignItems: "center", justifyContent: "center" },
    retryButton: { marginTop: layout.s(24), paddingVertical: layout.s(14), paddingHorizontal: layout.s(32), borderRadius: layout.s(16) },
    hint: { marginTop: layout.s(24), textAlign: "center" },
    debugContainer: { alignItems: "center", marginTop: layout.s(12) },
    debugCopyButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.s(8),
      paddingHorizontal: layout.s(16),
      borderRadius: layout.s(12),
      borderWidth: 1,
    },
  };
};
