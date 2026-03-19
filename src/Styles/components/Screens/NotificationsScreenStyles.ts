import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type NotificationsScreenStyles = {
  /** Головний контейнер (flex: 1) */
  container: ViewStyle;
  /** Вміст списку з відступами */
  listContent: ViewStyle;
  /** Порожній список (flex: 1 + центрування) */
  emptyList: ViewStyle;
  /** Контейнер порожнього стану */
  emptyContainer: ViewStyle;
  /** Заголовок порожнього стану (застарілий) */
  emptyTitle: TextStyle;
  /** Підзаголовок порожнього стану (застарілий) */
  emptySubtitle: TextStyle;
  /** Кнопка очистити все */
  clearButton: ViewStyle;
  /** Текст кнопки очистити (застарілий) */
  clearButtonText: TextStyle;
};

export const useNotificationsScreenStyles = (): NotificationsScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    listContent: { paddingHorizontal: layout.spacing.lg, paddingTop: layout.spacing.sm },
    emptyList: { flex: 1, justifyContent: "center" },
    emptyContainer: { alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontFamily: "Nunito-SemiBold", marginBottom: layout.spacing.sm },
    emptySubtitle: { fontFamily: "Nunito-Regular", paddingHorizontal: layout.spacing.xl3 },
    clearButton: {
      marginRight: layout.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: layout.radius.lg,
      width: layout.sizing.touch,
      height: layout.sizing.touch,
      justifyContent: "center",
    },
    clearButtonText: { fontFamily: "Nunito-Regular", marginLeft: layout.spacing.xsm },
  };
};
