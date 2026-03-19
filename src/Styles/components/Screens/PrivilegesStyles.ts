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
    container: { flex: 1, paddingHorizontal: layout.s(26), paddingTop: layout.spacing.lg },
    card: { paddingHorizontal: layout.spacing.md, paddingTop: layout.spacing.sm },
    row: { flexDirection: "row", alignItems: "center", gap: layout.spacing.md, paddingVertical: layout.spacing.md },
    iconBox: { width: layout.s(34), height: layout.s(34), borderRadius: layout.radius.xmd, alignItems: "center", justifyContent: "center" },
    divider: { height: 1, marginVertical: layout.s(15), borderRadius: 1, width: "90%", alignSelf: "center" },
    primaryBtn: { alignSelf: "center", paddingHorizontal: layout.s(90), paddingVertical: layout.spacing.xmd, borderRadius: layout.radius.sm, marginTop: layout.spacing.xl },
    skipBtn: { alignSelf: "center", flexDirection: "row", gap: layout.spacing.sm, paddingHorizontal: layout.spacing.lg, paddingVertical: layout.spacing.sm, borderRadius: layout.radius.md, marginTop: layout.s(14) },
  };
};
