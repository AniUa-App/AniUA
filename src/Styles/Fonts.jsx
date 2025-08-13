import { useEffect, useState, useMemo } from "react";
import { Text, View, PixelRatio } from "react-native";
import { white } from "./Colors";
import { GetScreenWidth, GetScreenHeight } from "../Global/Functions";
import { useFonts } from "expo-font";
import { useThemeColors } from "../Global/useTheme";

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
        <Text style={{ color: white }}>Завантаження шрифтів...</Text>
      </View>
    );
  }

  return null;
}

const scale = Math.min(GetScreenWidth(), GetScreenHeight()) / 350; // 375 - базова ширина дизайну

export const scaleFontSize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Визначаємо стилі заголовків з адаптивним розміром шрифту
export const H2 = {
  fontSize: scaleFontSize(24),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

export const H3 = {
  fontSize: scaleFontSize(20),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

export const H4 = {
  fontSize: scaleFontSize(16),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

export const H5 = {
  fontSize: scaleFontSize(15),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

export const H6 = {
  fontSize: scaleFontSize(14),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

export const H7 = {
  fontSize: scaleFontSize(13),
  color: white,
  fontFamily: "Nunito-SemiBold",
};

// Динамічні стилі заголовків з урахуванням теми
export function useThemedTextStyles() {
  const themeColors = useThemeColors();
  return useMemo(
    () => ({
      H2: {
        fontSize: scaleFontSize(24),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
      H3: {
        fontSize: scaleFontSize(20),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
      H4: {
        fontSize: scaleFontSize(16),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
      H5: {
        fontSize: scaleFontSize(15),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
      H6: {
        fontSize: scaleFontSize(14),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
      H7: {
        fontSize: scaleFontSize(13),
        color: themeColors.white,
        fontFamily: "Nunito-SemiBold",
      },
    }),
    [themeColors.white]
  );
}
