import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type LoginScreenStyles = {
  /** Головний контейнер (portrait) */
  container: ViewStyle;
  /** Головний контейнер (wide layout) */
  containerWide: ViewStyle;
  /** Основний контент (portrait) */
  mainContent: ViewStyle;
  /** Основний контент (wide layout) */
  mainContentWide: ViewStyle;
  /** Позиція логотипу (portrait) */
  logoContainer: ViewStyle;
  /** Позиція логотипу (wide) */
  logoContainerWide: ViewStyle;
  /** Зображення логотипу */
  logo: ViewStyle;
  /** Зображення логотипу (wide) */
  logoWide: ViewStyle;
  /** Контент (wide) */
  contentWide: ViewStyle;
  /** Заголовок "Вітаємо в AniUA" */
  title: TextStyle;
  /** Підзаголовок */
  subtitle: TextStyle;
  /** Контейнер кнопок */
  buttonsContainer: ViewStyle;
  /** Загальний стиль кнопок */
  button: ViewStyle;
  /** Кнопка QR-коду */
  qrButton: ViewStyle;
  /** Вміст кнопки QR */
  qrButtonContent: ViewStyle;
  /** Текст кнопки QR */
  qrButtonText: TextStyle;
  /** Текст кнопки входу */
  loginButtonText: TextStyle;
  /** Кнопка пропустити */
  skipButton: ViewStyle;
  /** Текст кнопки пропустити */
  skipButtonText: TextStyle;
  /** Контейнер вибору теми */
  themeOptionsContainer: ViewStyle;
  /** Контейнер вибору теми (wide) */
  themeOptionsContainerWide: ViewStyle;
  /** Кнопка теми */
  themeOption: ViewStyle;
  /** Кружечок основного кольору теми */
  themePrimaryDot: ViewStyle;
};

export const useLoginScreenStyles = (): LoginScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: layout.s(32) },
    containerWide: { justifyContent: "center", paddingVertical: layout.s(32) },
    mainContent: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
    mainContentWide: { flex: 0, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: layout.s(48) },
    logoContainer: { position: "absolute", top: "20%" },
    logoContainerWide: { position: "relative", top: undefined, flex: 1, alignItems: "center", justifyContent: "center" },
    logo: { width: layout.s(280), height: layout.s(280) },
    logoWide: { width: layout.s(320), height: layout.s(320) },
    contentWide: { flex: 1, justifyContent: "center" },
    title: { fontFamily: "Nunito-Bold", fontSize: 32, textAlign: "center" },
    subtitle: { textAlign: "center", lineHeight: 24 },
    buttonsContainer: { width: "100%", gap: layout.s(16), paddingTop: layout.s(16) },
    button: { width: "100%", paddingVertical: layout.s(16), borderRadius: layout.s(18), alignItems: "center", justifyContent: "center" },
    qrButton: { backgroundColor: "transparent", borderWidth: 1.5 },
    qrButtonContent: { flexDirection: "row", alignItems: "center", gap: layout.s(8) },
    qrButtonText: { fontFamily: "Nunito-SemiBold", fontSize: 18 },
    loginButtonText: { fontFamily: "Nunito-Bold", fontSize: 18 },
    skipButton: { backgroundColor: "transparent", borderWidth: 0 },
    skipButtonText: { fontFamily: "Nunito-SemiBold", fontSize: 18 },
    themeOptionsContainer: { flexDirection: "row", gap: layout.s(16), justifyContent: "center" },
    themeOptionsContainerWide: { position: "absolute", bottom: layout.s(32), alignSelf: "center" },
    themeOption: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(16), justifyContent: "center", alignItems: "center" },
    themePrimaryDot: { width: layout.s(24), height: layout.s(24), borderRadius: layout.s(12) },
  };
};
