import { useThemeColors } from "../../Global/useTheme";
import { H6 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle } from "react-native";

type AppRootStyles = {
  /** Кореневий контейнер застосунку */
  root: ViewStyle;
  /** Текст у snackbar (H6) */
  snackbarText: TextStyle;
  /** Колір посилань у snackbar */
  snackbarLinkColor: string;
};

export const useAppRootStyles = (): AppRootStyles => {
  const theme = useThemeColors();

  return {
    root: { flex: 1 },
    snackbarText: { ...H6, color: theme.text },
    snackbarLinkColor: theme.primary,
  };
};
