import type { ViewStyle } from "react-native";
import { useThemeColors } from "../../Global/useTheme";

/** Дефолтні пропси для BloomImage */
export const BLOOM_DEFAULTS = {
  borderRadius: 16,
  blurRadius: 10,
  glowScale: 1.03,
  glowOpacity: 2,
  fadePercent: 0.2,
} as const;

/** Дефолтні пропси для BloomImageAdvanced */
export const BLOOM_ADVANCED_DEFAULTS = {
  width: 225,
  height: 350,
  borderRadius: 16,
  blurRadius: 20,
  glowScale: 1.08,
  glowOpacity: 0.7,
} as const;

/**
 * Identity ColorMatrix для Skia (без зміни кольорів).
 * Використовується в BloomImage для збереження оригінальних кольорів glow-шару.
 */
export const BLOOM_COLOR_MATRIX = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
] as const;

/**
 * ColorMatrix для BloomImageAdvanced (підсилення кольорів glow-шару).
 */
export const BLOOM_ADVANCED_COLOR_MATRIX = [
  1.3, 0, 0, 0, 0.05,
  0, 1.3, 0, 0, 0.05,
  0, 0, 1.3, 0, 0.05,
  0, 0, 0, 1, 0,
] as const;

type BloomLoaderStyle = {
  container: ViewStyle;
};

/** Стилі для placeholder-лоадера (показується поки зображення не завантажилось) */
export const useBloomImageStyles = (
  width: number,
  height: number,
  borderRadius: number,
): BloomLoaderStyle => {
  const themeColors = useThemeColors();

  return {
    container: {
      width,
      height,
      alignItems: "center",
      justifyContent: "center",
      borderRadius,
      zIndex: 2,
      backgroundColor: themeColors.background,
    },
  };
};
