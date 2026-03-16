import { useLayout } from "../../Layout";
import { Background } from "../../Colors";
import type { ViewStyle, TextStyle } from "react-native";

type ScreenControllerStyles = {
  /** Navbar Default: pill-контейнер з floating стилем */
  container: ViewStyle;
  /** Navbar MD3: рядок з вкладками (portrait/landscape) */
  container2: ViewStyle;
  /** Елемент вкладки горизонтальний */
  tabItem: ViewStyle;
  /** Елемент вкладки вертикальний (MD3) */
  tabItemVertical: ViewStyle;
  /** Порожній текстовий стиль */
  text: TextStyle;
  /** Текст підпису під іконкою */
  textBelow: TextStyle;
  /** Тінь іконки */
  iconShadow: ViewStyle;
  /** Елемент вкладки (MD3, бокова навігація) */
  tabItemVerticalSide: ViewStyle;
};

export const useScreenControllerStyles = (): ScreenControllerStyles => {
  const layout = useLayout();

  return {
    container: {
      position: "absolute",
      flexDirection: "row",
      justifyContent: "center",
      backgroundColor: Background(0.6),
      width: "80%",
      alignSelf: "center",
      bottom: layout.s(25),
      borderRadius: layout.s(8),
      paddingVertical: layout.s(12),
      overflow: "hidden",
    },
    container2: {
      position: "absolute",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      backgroundColor: Background(0.6),
      width: "100%",
      alignSelf: "center",
      paddingVertical: layout.s(8),
      paddingBottom: layout.s(25),
      borderRadius: layout.s(8),
      overflow: "hidden",
    },
    tabItem: { flexDirection: "row", alignItems: "center", height: layout.s(36) },
    tabItemVertical: { flexDirection: "column", justifyContent: "center", alignItems: "center", height: layout.s(56), borderRadius: layout.s(14) },
    text: {},
    textBelow: { fontFamily: "Nunito-SemiBold", fontSize: 12, textAlign: "center" },
    iconShadow: {},
    tabItemVerticalSide: { flexDirection: "column", justifyContent: "center", alignItems: "center", height: layout.s(64), width: layout.s(64), borderRadius: layout.s(16), marginBottom: layout.s(8) },
  };
};
