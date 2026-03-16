import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type PrivilegesStyles = {
  /** Головний контейнер з відступами */
  container: ViewStyle;
  /** Картка з переліком переваг */
  card: ViewStyle;
  /** Рядок переваги */
  row: ViewStyle;
  /** Контейнер іконки */
  iconBox: ViewStyle;
  /** Роздільник між секціями */
  divider: ViewStyle;
  /** Основна кнопка дії */
  primaryBtn: ViewStyle;
  /** Кнопка "Пропустити" */
  skipBtn: ViewStyle;
};

export const usePrivilegesStyles = (): PrivilegesStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, paddingHorizontal: layout.s(26), paddingTop: layout.s(16) },
    card: { paddingHorizontal: layout.s(12), paddingTop: layout.s(8) },
    row: { flexDirection: "row", alignItems: "center", gap: layout.s(12), paddingVertical: layout.s(12) },
    iconBox: { width: layout.s(34), height: layout.s(34), borderRadius: layout.s(10), alignItems: "center", justifyContent: "center" },
    divider: { height: 1, marginVertical: layout.s(15), borderRadius: 1, width: "90%", alignSelf: "center" },
    primaryBtn: { alignSelf: "center", paddingHorizontal: layout.s(90), paddingVertical: layout.s(10), borderRadius: layout.s(8), marginTop: layout.s(24) },
    skipBtn: { alignSelf: "center", flexDirection: "row", gap: layout.s(8), paddingHorizontal: layout.s(16), paddingVertical: layout.s(8), borderRadius: layout.s(12), marginTop: layout.s(14) },
  };
};
