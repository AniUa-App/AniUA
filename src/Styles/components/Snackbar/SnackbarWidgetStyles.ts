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
      left: layout.spacing.lg,
      right: layout.spacing.lg,
      zIndex: 9999,
    },
    containerBottom: {
      bottom: layout.spacing.xmd,
    },
    containerTop: {
      top: layout.spacing.xl,
    },
    snackbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: layout.s(14),
      paddingLeft: layout.spacing.xlg,
      paddingRight: layout.spacing.md,
      borderRadius: layout.radius.md,
    },
    message: {
      flex: 1,
      marginRight: layout.spacing.md,
      lineHeight: layout.spacing.xlg,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.xs,
    },
    actionButton: {
      paddingVertical: layout.spacing.sm,
      paddingHorizontal: layout.spacing.md,
      borderRadius: layout.radius.sm,
    },
    confirmButton: {
      minWidth: layout.sizing.touchMd,
      alignItems: "center",
    },
    declineButton: {
      minWidth: layout.sizing.touchMd,
      alignItems: "center",
    },
    actionText: {
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    closeButton: {
      padding: layout.spacing.sm,
      borderRadius: layout.radius.xxlg,
      alignItems: "center",
      justifyContent: "center",
    },
    link: {
      textDecorationLine: "underline",
    },
  };
};
