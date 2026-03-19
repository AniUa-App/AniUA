import { PixelRatio, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { isTV, isTablet, isTabletLandscape } from "./Responsive";

/**
 * useLayout — єдиний хук для всіх розмірів UI.
 *
 * Масштабування базується на логічних dp (device-independent pixels).
 * Використовується moderateScale: розмір масштабується лише частково
 * (factor=0.5), щоб уникнути надмірного збільшення на великих екранах.
 *
 * Формула: dp + (dp * linearScale - dp) * factor
 *   factor=0  → завжди повертає dp (без масштабування)
 *   factor=1  → повний лінійний масштаб
 *   factor=0.5 → половина різниці (рекомендовано)
 *
 * Baseline (dp):
 *   Phone:            390dp  (типова ширина Android-телефону)
 *   Tablet portrait:  600dp
 *   Tablet landscape: 800dp
 *   TV:               540dp
 */
export const useLayout = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height); // логічні dp, коротка сторона

    const baseline = isTV()
      ? 540
      : isTabletLandscape()
        ? 800
        : isTablet()
          ? 600
          : 390;

    const linearScale = shortSide / baseline;

    // moderateScale — половинний лінійний масштаб з pixel-snapping
    const s = (dp, factor = 0.5) => {
      const moderated = dp + (dp * linearScale - dp) * factor;
      return Math.round(PixelRatio.roundToNearestPixel(moderated));
    };

    // Ширина картки аніме (% від логічної ширини екрана)
    const cardWidth = isTV()
      ? width * 0.12
      : isTabletLandscape()
        ? width * 0.12
        : isTablet()
          ? width * 0.2
          : width * 0.35;

    return {
      /** Поточний коефіцієнт лінійного масштабу */
      scale: linearScale,
      /** Масштабує довільне dp-значення (moderateScale, factor=0.5) */
      s,
      /** Ширина картки аніме для поточного пристрою */
      cardWidth,

      font: {
        xs: s(11),
        sm: s(13),
        md: s(15),
        lg: s(18),
        xl: s(22),
        xxl: s(26),
      },

      spacing: {
        xxs: s(2),
        xs: s(4),
        xsm: s(6),
        sm: s(8),
        xmd: s(10),
        md: s(12),
        lg: s(16),
        xlg: s(20),
        xl: s(24),
        xxl: s(32),
        xl3: s(40),
        xl4: s(48),
        xl5: s(50),
        xl6: s(64),
      },

      icon: {
        xs: s(14),
        sm: s(18),
        xmd: s(28),
        md: s(24),
        lg: s(32),
        xl: s(48),
        xxl: s(64),
      },

      radius: {
        xxs: s(2),
        xs: s(4),
        sm: s(8),
        xmd: s(10),
        md: s(12),
        lg: s(16),
        xlg: s(18),
        xxlg: s(20),
        xl: s(24),
        full: 9999,
      },

      /** Фіксовані розміри компонентів (не залежать від контексту) */
      sizing: {
        touchXs: s(32),
        touchSm: s(38),
        touch: s(44),
        touchMd: s(50),
        touchLg: s(54),
        sm: s(60),
        md: s(64),
        lg: s(90),
        xl: s(100),
        xxl: s(140),
        img: s(200),
      },

      paddings: {
        xxs: s(4),
        xs: s(8),
        sm: s(12),
        md: s(16),
        lg: s(20),
        xl: s(24),
        xxl: s(32),
      },

      button: {
        height: s(48),
        heightSm: s(36),
        paddingH: s(16),
        paddingV: s(10),
        radius: s(12),
      },

      card: {
        radius: s(16),
        padding: s(12),
      },
    };
  }, [width, height]);
};
