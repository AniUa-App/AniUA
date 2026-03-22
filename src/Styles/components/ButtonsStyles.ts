import type { ViewStyle, TextStyle } from "react-native";
import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H5 } from "../Fonts";

type ButtonsStyles = {
  /** Контейнер сітки кнопок */
  grid: ViewStyle;
  /** Окрема кнопка в сітці */
  gridButton: ViewStyle;
};

type SegmentedLabelStyles = {
  /** Висота контролу */
  height: number;
  /** Стиль слайдера (активний сегмент) */
  slider: ViewStyle;
  /** Шрифт неактивного сегмента */
  fontStyle: TextStyle;
  /** Шрифт активного сегмента */
  activeFontStyle: TextStyle;
  /** Колір tint (активний колір) */
  tintColor: string;
};

type SegmentedImageStyles = {
  /** Зовнішній контейнер */
  container: ViewStyle;
  /** Підсвітка активного сегмента */
  activeHighlight: (selectedIndex: number, itemWidthPct: number) => ViewStyle;
  /** Кнопка сегмента */
  segmentButton: ViewStyle;
  /** Текст сегмента */
  segmentText: TextStyle;
};

export const useButtonsStyles = (): ButtonsStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    grid: {
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      padding: layout.spacing.xlg,
      gap: layout.spacing.xmd,
    },
    gridButton: {
      minWidth: "20%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: themeColors.primary,
      borderRadius: layout.radius.sm,
      padding: layout.spacing.xmd,
      minHeight: layout.sizing.touchMd,
    },
  };
};

export const useSegmentedLabelStyles = (): SegmentedLabelStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    height: layout.sizing.touch,
    slider: {
      borderRadius: layout.radius.lg,
      paddingHorizontal: layout.spacing.sm,
    },
    fontStyle: {
      ...H5,
      color: themeColors.Text(0.5),
    },
    activeFontStyle: {
      ...H5,
      fontWeight: "normal",
      color: themeColors.text,
    },
    tintColor: themeColors.primary,
  };
};

export const useSegmentedImageStyles = (): SegmentedImageStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    container: {
      width: "100%",
      alignSelf: "center",
      height: layout.sizing.touchMd,
      borderRadius: layout.radius.sm,
      overflow: "hidden",
      backgroundColor: themeColors.subtle,
      position: "relative",
      flexDirection: "row",
    },
    activeHighlight: (selectedIndex, itemWidthPct) => ({
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${selectedIndex * itemWidthPct}%`,
      width: `${itemWidthPct}%`,
      backgroundColor: themeColors.primary,
      opacity: 0.25,
      borderRadius: layout.radius.sm,
    }),
    segmentButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      height: layout.sizing.touchMd,
    },
    segmentText: {
      color: themeColors.text,
    },
  };
};
