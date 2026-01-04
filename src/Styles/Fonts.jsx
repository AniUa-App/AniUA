import { useEffect, useState, useMemo } from "react";
import { Text, View, PixelRatio, useWindowDimensions } from "react-native";
import { text } from "./Colors";
import { useFonts } from "expo-font";
import { useThemeColors } from "../Global/useTheme";
import { isTablet, isTabletLandscape } from "./Responsive";
import { FontWeight } from "@shopify/react-native-skia";

export function useCustomFonts() {
  const [fontsLoaded] = useFonts({
    "Nunito-Black": require("../../assets/fonts/Nunito-Black.ttf"),
    "Nunito-BlackItalic": require("../../assets/fonts/Nunito-BlackItalic.ttf"),
    "Nunito-Bold": require("../../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-BoldItalic": require("../../assets/fonts/Nunito-BoldItalic.ttf"),
    "Nunito-ExtraBold": require("../../assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraBoldItalic": require("../../assets/fonts/Nunito-ExtraBoldItalic.ttf"),
    "Nunito-ExtraLight": require("../../assets/fonts/Nunito-ExtraLight.ttf"),
    "Nunito-ExtraLightItalic": require("../../assets/fonts/Nunito-ExtraLightItalic.ttf"),
    "Nunito-Italic": require("../../assets/fonts/Nunito-Italic.ttf"),
    "Nunito-Light": require("../../assets/fonts/Nunito-Light.ttf"),
    "Nunito-LightItalic": require("../../assets/fonts/Nunito-LightItalic.ttf"),
    "Nunito-Medium": require("../../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-MediumItalic": require("../../assets/fonts/Nunito-MediumItalic.ttf"),
    "Nunito-Regular": require("../../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("../../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-SemiBoldItalic": require("../../assets/fonts/Nunito-SemiBoldItalic.ttf"),
    "RobotoCondensed-Black": require("../../assets/fonts/RobotoCondensed-Black.ttf"),
  });

  return fontsLoaded;
}

// Перевірка завантаження шрифтів
export function Fonts() {
  const fontsLoaded = useCustomFonts();

  if (!fontsLoaded) {
    return (
      <View>
        <Text style={{ color: text }}>Завантаження шрифтів...</Text>
      </View>
    );
  }

  return null;
}

// Hook для отримання динамічного scale та scaleFontSize
export const useScaleFontSize = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const scale = Math.min(width, height) / 390;
    const scale_landscape = Math.min(width, height) / 650;

    const scaleFontSize = (size) => {
      const newSize = size * (isTablet() ? scale_landscape : scale);
      return Math.round(PixelRatio.roundToNearestPixel(newSize));
    };

    return scaleFontSize;
  }, [width, height]);
};

// Функція для обчислення розміру шрифту (для StaticStyles - буде виконано один раз)
const getStaticFontSize = (size, width, height) => {
  const scale = Math.min(width, height) / 390;
  const scale_landscape = Math.min(width, height) / 650;
  const newSize = size * (isTablet() ? scale_landscape : scale);
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Статичні стилі заголовків (для зворотної сумісності)
// УВАГА: ці стилі не будуть оновлюватися при зміні розміру екрану!
// Використовуйте useDynamicTextStyles() для адаптивних стилів
const { width: staticWidth, height: staticHeight } =
  require("react-native").Dimensions.get("window");

export const H2 = {
  fontSize: getStaticFontSize(24, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-SemiBold",
};

export const H3 = {
  fontSize: getStaticFontSize(20, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-SemiBold",
};

export const H4 = {
  fontSize: getStaticFontSize(18, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-SemiBold",
};

export const H5 = {
  fontSize: getStaticFontSize(15, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-Light",
};

export const H6 = {
  fontSize: getStaticFontSize(14, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-Light",
};

export const H7 = {
  fontSize: getStaticFontSize(13, staticWidth, staticHeight),
  color: text,
  fontFamily: "Nunito-SemiBold",
};

// Hook для динамічних стилів заголовків (оновлюються при зміні розміру екрану)
export function useDynamicTextStyles() {
  const scaleFontSize = useScaleFontSize();

  return useMemo(
    () => ({
      H2: {
        fontSize: scaleFontSize(24),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
      H3: {
        fontSize: scaleFontSize(20),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
      H4: {
        fontSize: scaleFontSize(16),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
      H5: {
        fontSize: scaleFontSize(15),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
      H6: {
        fontSize: scaleFontSize(14),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
      H7: {
        fontSize: scaleFontSize(13),
        color: text,
        fontFamily: "Nunito-SemiBold",
      },
    }),
    [scaleFontSize]
  );
}

// Динамічні стилі заголовків з урахуванням теми (оновлюються при зміні розміру екрану)
export function useThemedTextStyles() {
  const themeColors = useThemeColors();
  const scaleFontSize = useScaleFontSize();

  return useMemo(
    () => ({
      H2: {
        fontSize: scaleFontSize(24),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
      H3: {
        fontSize: scaleFontSize(20),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
      H4: {
        fontSize: scaleFontSize(16),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
      H5: {
        fontSize: scaleFontSize(15),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
      H6: {
        fontSize: scaleFontSize(14),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
      H7: {
        fontSize: scaleFontSize(13),
        color: themeColors.text,
        fontFamily: "Nunito-SemiBold",
      },
    }),
    [themeColors.text, scaleFontSize]
  );
}
