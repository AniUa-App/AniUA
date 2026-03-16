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
    centeredContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.s(32) },
    overlayContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    overlayPart: { backgroundColor: "rgba(0,0,0,0.6)" },
    middleRow: { flexDirection: "row", height: scanAreaSize },
    scanWindow: { width: scanAreaSize, height: scanAreaSize },
    corner: { position: "absolute", width: layout.s(24), height: layout.s(24), borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: layout.s(8) },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: layout.s(8) },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: layout.s(8) },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: layout.s(8) },
    topContent: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: layout.s(60), paddingHorizontal: layout.s(24), alignItems: "center" },
    backButton: {
      position: "absolute",
      top: layout.s(48),
      width: layout.s(44),
      height: layout.s(44),
      borderRadius: layout.s(16),
      justifyContent: "center",
      alignItems: "center",
      left: layout.s(16),
      zIndex: 1,
    },
    scanTitle: { color: "#fff", fontFamily: "Nunito-Bold", fontSize: 24, textAlign: "center", marginTop: layout.s(16) },
    scanSubtitle: { color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: layout.s(8), paddingHorizontal: layout.s(16) },
    permissionButton: { marginTop: layout.s(24), paddingVertical: layout.s(14), paddingHorizontal: layout.s(32), borderRadius: layout.s(16) },
    retryButton: { marginTop: layout.s(24), paddingVertical: layout.s(14), paddingHorizontal: layout.s(32), borderRadius: layout.s(16) },
    debugBottomContent: { position: "absolute", bottom: layout.s(60), left: 0, right: 0, alignItems: "center" },
    debugPasteButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.s(10),
      paddingHorizontal: layout.s(20),
      borderRadius: layout.s(12),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.5)",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    debugEditContainer: { alignItems: "center", width: "100%" },
    debugInput: {
      width: "80%",
      borderWidth: 1,
      borderRadius: layout.s(12),
      paddingVertical: layout.s(12),
      paddingHorizontal: layout.s(16),
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Nunito-SemiBold",
    },
    debugConnectButton: { marginTop: layout.s(20), paddingVertical: layout.s(14), paddingHorizontal: layout.s(40), borderRadius: layout.s(16) },
  };
};
