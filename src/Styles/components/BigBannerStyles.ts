import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H2, H4 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle } from "react-native";

type BannerButtonStyle = {
  borderRadius: number;
  alignItems: "center";
  justifyContent: "center";
  width: number;
  height: number;
  backgroundColor: string;
};

type BigBannerStyles = {
  /** Масив кольорів градієнта (прозорий → темний) */
  gradientColors: string[];
  /** Зовнішній контейнер банера */
  container: ViewStyle;
  /** Контейнер одного елемента слайдера */
  itemContainer: ViewStyle;
  /** Градієнтний оверлей поверх зображення */
  gradientOverlay: ViewStyle;
  /** Бейдж з рейтингом (зірка + число) */
  ratingBadge: ViewStyle;
  /** Текст рейтингу (H4) */
  ratingText: TextStyle;
  /** Нижній блок з назвою та кнопкою play */
  bottomOverlay: ViewStyle;
  /** Обгортка назви (flex: 1) */
  titleContainer: ViewStyle;
  /** Назва аніме (H2) */
  title: TextStyle;
  /** Контейнер точок пагінації */
  paginationContainer: ViewStyle;
  /** Одна точка пагінації */
  paginationDot: ViewStyle;
  /** Стилі специфічні для телефону */
  mobile: { iconSize: number; playButton: BannerButtonStyle };
  /** Стилі специфічні для планшету */
  tablet: { iconSize: number; playButton: BannerButtonStyle };
};

export const useBigBannerStyles = (): BigBannerStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    gradientColors: ["transparent", (theme as any).Background?.(0.5) ?? "rgba(0,0,0,0.5)"] as string[],
    container: { backgroundColor: "#000" },
    itemContainer: { flex: 1, borderRadius: layout.s(20), overflow: "hidden" },
    gradientOverlay: { position: "absolute", borderRadius: layout.s(16) },
    ratingBadge: { position: "absolute", top: "12%", right: "8.7%", flexDirection: "row", alignItems: "center", paddingHorizontal: layout.s(10), paddingVertical: layout.s(5), borderTopLeftRadius: layout.s(16), borderBottomLeftRadius: layout.s(16), gap: layout.s(4), backgroundColor: (theme as any).Background?.(0.8) ?? theme.background },
    ratingText: { ...H4, color: theme.text },
    bottomOverlay: { margin: layout.s(18), position: "absolute", bottom: "8%", left: "8%", right: "8%", flexDirection: "row", justifyContent: "space-between" },
    titleContainer: { flex: 1 },
    title: { ...H2, color: theme.text },
    paginationContainer: { position: "absolute", bottom: layout.s(20), left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: layout.s(8), zIndex: 10 },
    paginationDot: { width: layout.s(8), height: layout.s(8), borderRadius: layout.s(4), backgroundColor: "rgba(255, 255, 255, 0.4)" },
    mobile: { iconSize: layout.s(32), playButton: { borderRadius: layout.s(16), alignItems: "center", justifyContent: "center", width: layout.s(54), height: layout.s(54), backgroundColor: theme.background } },
    tablet: { iconSize: layout.s(28), playButton: { borderRadius: layout.s(16), alignItems: "center", justifyContent: "center", width: layout.s(44), height: layout.s(44), backgroundColor: theme.background } },
  };
};
