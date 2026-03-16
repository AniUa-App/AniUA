import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type SnackbarWidgetStyles = {
  /** Абсолютно позиціонований контейнер snackbar */
  container: ViewStyle;
  /** Нижня позиція (застаріло, не використовується безпосередньо) */
  containerBottom: ViewStyle;
  /** Верхня позиція */
  containerTop: ViewStyle;
  /** Сам snackbar (фон + вміст) */
  snackbar: ViewStyle;
  /** Текст повідомлення */
  message: TextStyle;
  /** Контейнер кнопок дії */
  actionsContainer: ViewStyle;
  /** Кнопка дії */
  actionButton: ViewStyle;
  /** Кнопка підтвердження */
  confirmButton: ViewStyle;
  /** Кнопка відхилення */
  declineButton: ViewStyle;
  /** Текст кнопки (uppercase) */
  actionText: TextStyle;
  /** Кнопка закриття */
  closeButton: ViewStyle;
  /** Посилання у тексті повідомлення */
  link: TextStyle;
};

export const useSnackbarWidgetStyles = (): SnackbarWidgetStyles => {
  const layout = useLayout();

  return {
    container: {
      position: "absolute",
      left: layout.s(16),
      right: layout.s(16),
      zIndex: 9999,
    },
    containerBottom: {
      bottom: layout.s(10),
    },
    containerTop: {
      top: layout.s(24),
    },
    snackbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: layout.s(14),
      paddingLeft: layout.s(20),
      paddingRight: layout.s(12),
      borderRadius: layout.s(12),
    },
    message: {
      flex: 1,
      marginRight: layout.s(12),
      lineHeight: layout.s(20),
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(4),
    },
    actionButton: {
      paddingVertical: layout.s(8),
      paddingHorizontal: layout.s(12),
      borderRadius: layout.s(8),
    },
    confirmButton: {
      minWidth: layout.s(50),
      alignItems: "center",
    },
    declineButton: {
      minWidth: layout.s(50),
      alignItems: "center",
    },
    actionText: {
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    closeButton: {
      padding: layout.s(8),
      borderRadius: layout.s(20),
      alignItems: "center",
      justifyContent: "center",
    },
    link: {
      textDecorationLine: "underline",
    },
  };
};
