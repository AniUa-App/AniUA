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
    listContent: { paddingHorizontal: layout.s(16), paddingTop: layout.s(8) },
    emptyList: { flex: 1, justifyContent: "center" },
    emptyContainer: { alignItems: "center", justifyContent: "center" },
    emptyTitle: { fontFamily: "Nunito-SemiBold", marginBottom: layout.s(8) },
    emptySubtitle: { fontFamily: "Nunito-Regular", paddingHorizontal: layout.s(40) },
    clearButton: {
      marginRight: layout.s(16),
      flexDirection: "row",
      alignItems: "center",
      borderRadius: layout.s(16),
      width: layout.s(44),
      height: layout.s(44),
      justifyContent: "center",
    },
    clearButtonText: { fontFamily: "Nunito-Regular", marginLeft: layout.s(6) },
  };
};
