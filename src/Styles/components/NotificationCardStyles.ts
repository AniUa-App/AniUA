import { useLayout } from "../Layout";
import { H6, H7 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type NotificationCardStyles = {
  /** Зовнішній контейнер картки сповіщення */
  container: ViewStyle;
  /** Постер аніме */
  poster: ImageStyle;
  /** Плейсхолдер постеру (без зображення) */
  posterPlaceholder: ViewStyle;
  /** Блок з текстовою інформацією */
  content: ViewStyle;
  /** Заголовок (назва аніме) */
  title: TextStyle;
  /** Тіло сповіщення (інфо про серію) */
  body: TextStyle;
  /** Рядок команди озвучення */
  teamRow: ViewStyle;
  /** Назва команди озвучення */
  team: TextStyle;
  /** Час отримання сповіщення */
  time: TextStyle;
  /** Індикатор непрочитаного повідомлення */
  unreadDot: ViewStyle;
  /** Область свайпу для видалення */
  deleteAction: ViewStyle;
};

export const useNotificationCardStyles = (): NotificationCardStyles => {
  const layout = useLayout();

  return {
    container: {
      flexDirection: "row",
      borderRadius: layout.radius.lg,
      padding: layout.spacing.md,
      marginBottom: layout.spacing.xmd,
    },
    poster: {
      width: layout.s(70),
      height: layout.sizing.xl,
      borderRadius: layout.radius.md,
    },
    posterPlaceholder: {
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      marginLeft: layout.spacing.md,
      justifyContent: "center",
    },
    title: {
      fontFamily: "Nunito-SemiBold",
      fontSize: H6.fontSize,
      lineHeight: layout.s(18),
      marginBottom: layout.spacing.xs,
    },
    body: {
      fontFamily: "Nunito-Medium",
      fontSize: H7.fontSize,
      marginBottom: layout.spacing.xs,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.xs,
      marginBottom: layout.spacing.xs,
    },
    team: {
      fontFamily: "Nunito-Regular",
      fontSize: H7.fontSize,
    },
    time: {
      fontFamily: "Nunito-Regular",
      fontSize: H7.fontSize,
    },
    unreadDot: {
      position: "absolute",
      top: layout.spacing.md,
      right: layout.spacing.md,
      width: layout.s(8),
      height: layout.s(8),
      borderRadius: layout.radius.xs,
    },
    deleteAction: {
      justifyContent: "center",
      alignItems: "center",
      width: layout.s(80),
      height: "100%",
      borderRadius: layout.radius.lg,
      marginBottom: layout.spacing.xmd,
    },
  };
};
