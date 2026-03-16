import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle } from "react-native";

type TVDubbingSelectorStyles = {
  /** Кнопка відкриття модалки (trigger) */
  triggerButton: ViewStyle;
  /** Текст поточного дубляжу */
  triggerText: TextStyle;
  /** Секція одного плеєра */
  playerSection: ViewStyle;
  /** Заголовок плеєра */
  playerTitle: TextStyle;
  /** Елемент вибору дубляжу */
  dubbingItem: ViewStyle;
  /** Текст дубляжу */
  dubbingText: TextStyle;
};

export const useTVDubbingSelectorStyles = (): TVDubbingSelectorStyles => {
  const layout = useLayout();

  return {
    triggerButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(12),
      borderRadius: TV.button.borderRadius,
      minHeight: TV.button.minHeight,
    },
    triggerText: {
      fontFamily: "Nunito-SemiBold",
    },
    playerSection: {
      marginBottom: layout.s(16),
    },
    playerTitle: {
      fontFamily: "Nunito-SemiBold",
      marginBottom: layout.s(8),
      textTransform: "uppercase",
    },
    dubbingItem: {
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(14),
      borderRadius: layout.s(8),
      marginBottom: layout.s(4),
      minHeight: TV.button.minHeight,
      justifyContent: "center",
    },
    dubbingText: {
      fontFamily: "Nunito-Medium",
    },
  };
};
