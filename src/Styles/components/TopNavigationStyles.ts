import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H5 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle } from "react-native";

type TopNavigationStyles = {
  /** Розмір іконок (дзвінок, пошук) */
  iconSize: number;
  /** Горизонтальний рядок навігації */
  container: ViewStyle;
  /** Кругла кнопка іконки */
  iconButton: ViewStyle;
  /** Бейдж непрочитаних сповіщень */
  badge: ViewStyle;
  /** Текст у бейджі */
  badgeText: TextStyle;
  /** SegmentedControl (вибір категорії) */
  segmentedControl: ViewStyle;
  /** Стиль повзунка SegmentedControl */
  segmentedSlider: ViewStyle;
  /** Шрифт неактивного табу (H5) */
  fontStyle: TextStyle;
  /** Шрифт активного табу (H5) */
  activeFontStyle: TextStyle;
};

export const useTopNavigationStyles = (): TopNavigationStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    iconSize: layout.s(28),
    container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: layout.s(16), paddingBottom: layout.s(8) },
    iconButton: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(16), justifyContent: "center", alignItems: "center", backgroundColor: (theme as any).Text?.(0.08) ?? theme.subtle },
    badge: { position: "absolute", top: layout.s(6), right: layout.s(6), minWidth: layout.s(18), height: layout.s(18), borderRadius: layout.s(9), justifyContent: "center", alignItems: "center", paddingHorizontal: layout.s(4), backgroundColor: theme.primary },
    badgeText: { color: "#fff", fontSize: layout.s(10), fontFamily: "Nunito-Bold" },
    segmentedControl: { width: "70%", height: layout.s(44) },
    segmentedSlider: { borderRadius: layout.s(16) },
    fontStyle: { ...H5, color: (theme as any).Text?.(0.5) ?? theme.inActiveText },
    activeFontStyle: { ...H5, fontWeight: "normal" as const, color: theme.text },
  };
};
