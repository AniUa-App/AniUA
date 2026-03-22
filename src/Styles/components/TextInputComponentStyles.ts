import type { ViewStyle, TextStyle } from "react-native";
import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";

type TextInputComponentStyles = {
  input: (isFocused: boolean) => ViewStyle & TextStyle;
  placeholderColor: string;
};

export const useTextInputComponentStyles = (): TextInputComponentStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    input: (isFocused: boolean) => ({
      height: layout.sizing.touch,
      width: "100%",
      paddingHorizontal: layout.spacing.lg,
      color: themeColors.text,
      backgroundColor: themeColors.Subtle(1),
      borderRadius: layout.radius.lg,
      borderWidth: isFocused ? 1 : 0,
      borderColor: isFocused ? themeColors.primary : "transparent",
    }),
    placeholderColor: themeColors.inActiveText,
  };
};
