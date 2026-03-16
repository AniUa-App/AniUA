import { PixelRatio, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { isTV, isTablet, isTabletLandscape } from "./Responsive";

/**
 * useLayout — єдиний хук для всіх розмірів UI.
 * Масштабування базується на фізичних пікселях:
 *   Phone/TV baseline: 1080px (FHD)
 *   Tablet portrait:   1600px (FHD+ tablet)
 *   Tablet landscape:  2048px (WQXGA/2K tablet)
 *
 * Повертає значення у dp (logical pixels) для React Native.
 */
export const useLayout = () => {
  const { width, height } = useWindowDimensions();
  const ratio = PixelRatio.get();

  return useMemo(() => {
    const physShort = Math.min(width, height) * ratio;

    const baseline = isTV()              ? 1080
                   : isTabletLandscape() ? 2048
                   : isTablet()          ? 1600
                                        : 1080;

    const scale = physShort / baseline;

    // Масштабує dp-значення і повертає dp
    const s = (dp) => Math.round(PixelRatio.roundToNearestPixel(dp * scale));

    // Ширина картки аніме (% від логічної ширини екрана)
    const cardWidth = isTV()              ? width * 0.12
                    : isTabletLandscape() ? width * 0.12
                    : isTablet()          ? width * 0.20
                                         : width * 0.35;

    return {
      /** Поточний коефіцієнт масштабу */
      scale,
      /** Масштабує довільне dp-значення */
      s,
      /** Ширина картки аніме для поточного пристрою */
      cardWidth,

      font: {
        xs:  s(11),
        sm:  s(13),
        md:  s(15),
        lg:  s(18),
        xl:  s(22),
        xxl: s(26),
      },

      spacing: {
        xs:  s(4),
        sm:  s(8),
        md:  s(12),
        lg:  s(16),
        xl:  s(24),
        xxl: s(32),
      },

      icon: {
        xs: s(14),
        sm: s(18),
        md: s(24),
        lg: s(32),
        xl: s(48),
      },

      radius: {
        sm:   s(8),
        md:   s(12),
        lg:   s(16),
        xl:   s(24),
        full: 9999,
      },

      button: {
        height:   s(48),
        heightSm: s(36),
        paddingH: s(16),
        paddingV: s(10),
        radius:   s(12),
      },

      card: {
        radius:  s(16),
        padding: s(12),
      },
    };
  }, [width, height]);
};
