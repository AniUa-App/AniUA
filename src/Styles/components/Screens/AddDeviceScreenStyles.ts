import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type AddDeviceScreenStyles = {
  /** Повноекранний фон камери */
  fullScreen: ViewStyle;
  /** Центрований контейнер для статус-екранів */
  centeredContainer: ViewStyle;
  /** Накладання поверх камери */
  overlayContainer: ViewStyle;
  /** Частина затемненого накладання */
  overlayPart: ViewStyle;
  /** Середній рядок зі скан-вікном */
  middleRow: ViewStyle;
  /** Вікно сканування */
  scanWindow: ViewStyle;
  /** Кутовий маркер */
  corner: ViewStyle;
  /** Верхній лівий кут */
  cornerTL: ViewStyle;
  /** Верхній правий кут */
  cornerTR: ViewStyle;
  /** Нижній лівий кут */
  cornerBL: ViewStyle;
  /** Нижній правий кут */
  cornerBR: ViewStyle;
  /** Верхній контент (заголовок) */
  topContent: ViewStyle;
  /** Кнопка "назад" */
  backButton: ViewStyle;
  /** Заголовок сканування */
  scanTitle: TextStyle;
  /** Підзаголовок сканування */
  scanSubtitle: TextStyle;
  /** Кнопка надати доступ до камери */
  permissionButton: ViewStyle;
  /** Кнопка "спробувати ще раз" */
  retryButton: ViewStyle;
  /** DEV: нижній контент */
  debugBottomContent: ViewStyle;
  /** DEV: кнопка вставити з буферу */
  debugPasteButton: ViewStyle;
  /** DEV: контейнер редагування */
  debugEditContainer: ViewStyle;
  /** DEV: поле вводу IP */
  debugInput: ViewStyle;
  /** DEV: кнопка підключитися */
  debugConnectButton: ViewStyle;
};

export const useAddDeviceScreenStyles = (scanAreaSize: number): AddDeviceScreenStyles => {
  const layout = useLayout();

  return {
    fullScreen: { flex: 1, backgroundColor: "#000" },
    centeredContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.spacing.xxl },
    overlayContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    overlayPart: { backgroundColor: "rgba(0,0,0,0.6)" },
    middleRow: { flexDirection: "row", height: scanAreaSize },
    scanWindow: { width: scanAreaSize, height: scanAreaSize },
    corner: { position: "absolute", width: layout.s(24), height: layout.s(24), borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: layout.radius.sm },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: layout.radius.sm },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: layout.radius.sm },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: layout.radius.sm },
    topContent: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: layout.s(60), paddingHorizontal: layout.spacing.xl, alignItems: "center" },
    backButton: {
      position: "absolute",
      top: layout.spacing.xl4,
      width: layout.sizing.touch,
      height: layout.sizing.touch,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      left: layout.spacing.lg,
      zIndex: 1,
    },
    scanTitle: { color: "#fff", fontFamily: "Nunito-Bold", fontSize: 24, textAlign: "center", marginTop: layout.spacing.lg },
    scanSubtitle: { color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: layout.spacing.sm, paddingHorizontal: layout.spacing.lg },
    permissionButton: { marginTop: layout.spacing.xl, paddingVertical: layout.s(14), paddingHorizontal: layout.spacing.xxl, borderRadius: layout.radius.lg },
    retryButton: { marginTop: layout.spacing.xl, paddingVertical: layout.s(14), paddingHorizontal: layout.spacing.xxl, borderRadius: layout.radius.lg },
    debugBottomContent: { position: "absolute", bottom: layout.s(60), left: 0, right: 0, alignItems: "center" },
    debugPasteButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.spacing.xmd,
      paddingHorizontal: layout.spacing.xlg,
      borderRadius: layout.radius.md,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    debugEditContainer: { alignItems: "center", width: "100%" },
    debugInput: {
      width: "80%",
      borderWidth: 1,
      borderRadius: layout.radius.md,
      paddingVertical: layout.spacing.md,
      paddingHorizontal: layout.spacing.lg,
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Nunito-SemiBold",
    },
    debugConnectButton: { marginTop: layout.spacing.xlg, paddingVertical: layout.s(14), paddingHorizontal: layout.spacing.xl3, borderRadius: layout.radius.lg },
  };
};
