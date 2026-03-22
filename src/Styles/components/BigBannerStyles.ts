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

type BloomImageConfig = {
  /** Коефіцієнт ширини відносно BANNER_WIDTH */
  widthScale: number;
  /** Коефіцієнт висоти відносно BANNER_HEIGHT */
  heightScale: number;
  blurRadius: number;
  borderRadius: number;
  blurBorderRadius: number;
  glowScale: number;
  fadePercent: number;
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
  /** Пропси для BloomImage (однакові для mobile і tablet) */
  bloomImage: BloomImageConfig;
  /** Стилі специфічні для телефону */
  mobile: { iconSize: number; playButton: BannerButtonStyle };
  /** Стилі специфічні для планшету */
  tablet: { iconSize: number; playButton: BannerButtonStyle };
};

export const useBigBannerStyles = (): BigBannerStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    gradientColors: [
      "transparent",
      (theme as any).Background?.(0.5) ?? "rgba(0,0,0,0.5)",
    ] as string[],
    container: { backgroundColor: "#000" },
    itemContainer: {
      flex: 1,
      borderRadius: layout.radius.xxlg,
      overflow: "hidden",
    },
    gradientOverlay: { position: "absolute", borderRadius: layout.radius.lg },
    ratingBadge: {
      position: "absolute",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      right: layout.s(48),
      top: layout.s(78),
      flex: 1,
      paddingHorizontal: layout.spacing.xmd,
      maxWidth: layout.sizing.lg,
      paddingVertical: layout.s(5),
      borderRadius: layout.radius.lg,
      gap: layout.spacing.xs,
      backgroundColor: (theme as any).Background?.(0.8) ?? theme.background,
    },
    ratingText: { ...H4, color: theme.text },
    bottomOverlay: {
      margin: layout.s(18),
      position: "absolute",
      bottom: "8%",
      left: "8%",
      right: "8%",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    titleContainer: { flex: 1 },
    title: { ...H2, color: theme.text },
    paginationContainer: {
      position: "absolute",
      bottom: layout.spacing.xlg,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: layout.spacing.sm,
      zIndex: 10,
    },
    paginationDot: {
      width: layout.s(8),
      height: layout.s(8),
      borderRadius: layout.radius.xs,
    },
    bloomImage: {
      widthScale: 0.9,
      heightScale: 0.85,
      blurRadius: 100,
      borderRadius: layout.radius.lg,
      blurBorderRadius: 0,
      glowScale: 1.15,
      fadePercent: 0.2,
    },
    mobile: {
      iconSize: layout.icon.lg,
      playButton: {
        borderRadius: layout.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        width: layout.sizing.touchLg,
        height: layout.sizing.touchLg,
        backgroundColor: theme.background,
      },
    },
    tablet: {
      iconSize: layout.icon.xmd,
      playButton: {
        borderRadius: layout.radius.lg,
        alignItems: "center",
        justifyContent: "center",
        width: layout.sizing.touch,
        height: layout.sizing.touch,
        backgroundColor: theme.background,
      },
    },
  };
};
