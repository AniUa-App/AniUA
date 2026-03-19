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
    container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.spacing.xxl },
    backButton: {
      position: "absolute",
      top: layout.spacing.lg,
      left: layout.spacing.lg,
      padding: layout.spacing.sm,
      width: layout.sizing.touch,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      height: layout.sizing.touch,
    },
    title: { fontFamily: "Nunito-Bold", fontSize: 28, textAlign: "center", marginBottom: layout.spacing.sm },
    subtitle: { textAlign: "center", lineHeight: 22, marginBottom: layout.spacing.xxl, paddingHorizontal: layout.spacing.lg },
    qrContainer: { alignItems: "center", justifyContent: "center", minHeight: layout.s(260) },
    qrWrapper: { padding: layout.spacing.lg, borderRadius: layout.radius.lg, backgroundColor: "white" },
    statusContainer: { alignItems: "center", justifyContent: "center" },
    retryButton: { marginTop: layout.spacing.xl, paddingVertical: layout.s(14), paddingHorizontal: layout.spacing.xxl, borderRadius: layout.radius.lg },
    hint: { marginTop: layout.spacing.xl, textAlign: "center" },
    debugContainer: { alignItems: "center", marginTop: layout.spacing.md },
    debugCopyButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.spacing.sm,
      paddingHorizontal: layout.spacing.lg,
      borderRadius: layout.radius.md,
      borderWidth: 1,
    },
  };
};
