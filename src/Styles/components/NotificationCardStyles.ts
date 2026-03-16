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
      borderRadius: layout.s(16),
      padding: layout.s(12),
      marginBottom: layout.s(10),
    },
    poster: {
      width: layout.s(70),
      height: layout.s(100),
      borderRadius: layout.s(12),
    },
    posterPlaceholder: {
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      marginLeft: layout.s(12),
      justifyContent: "center",
    },
    title: {
      fontFamily: "Nunito-SemiBold",
      fontSize: H6.fontSize,
      lineHeight: layout.s(18),
      marginBottom: layout.s(4),
    },
    body: {
      fontFamily: "Nunito-Medium",
      fontSize: H7.fontSize,
      marginBottom: layout.s(4),
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(4),
      marginBottom: layout.s(4),
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
      top: layout.s(12),
      right: layout.s(12),
      width: layout.s(8),
      height: layout.s(8),
      borderRadius: layout.s(4),
    },
    deleteAction: {
      justifyContent: "center",
      alignItems: "center",
      width: layout.s(80),
      height: "100%",
      borderRadius: layout.s(16),
      marginBottom: layout.s(10),
    },
  };
};
