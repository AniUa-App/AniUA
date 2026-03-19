import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import type { ViewStyle, TextStyle } from "react-native";

type HikkaAuthButtonStyles = {
  /** Кнопка авторизації (зелена для авторизованих, фіолетова для неавторизованих) */
  button: ViewStyle;
  /** Стиль кнопки у стані завантаження (opacity 0.6) */
  buttonDisabled: ViewStyle;
  /** Текст кнопки */
  buttonText: TextStyle;
  /** Контейнер інформації про авторизованого користувача */
  userInfo: ViewStyle;
  /** Ім'я користувача */
  username: TextStyle;
};

export const useHikkaAuthButtonStyles = (
  isAuthenticated: boolean,
): HikkaAuthButtonStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    button: {
      backgroundColor: isAuthenticated ? theme.green : theme.purple,
      paddingVertical: layout.spacing.md,
      paddingHorizontal: layout.spacing.xl,
      borderRadius: layout.radius.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: layout.sizing.touch,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.text,
      fontSize: layout.font.lg,
      fontWeight: "600",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      color: theme.text,
      fontSize: layout.font.lg,
      fontWeight: "600",
      marginRight: layout.spacing.sm,
    },
  };
};
