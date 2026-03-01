import React from "react";
import { StyleSheet, View } from "react-native";
import { useThemeColors } from "../Global/useTheme";

// Web fallback — Skia shaders are not available on web, render a solid background
export default function FBMBackground() {
  const themeColors = useThemeColors();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: themeColors.background },
      ]}
    />
  );
}
