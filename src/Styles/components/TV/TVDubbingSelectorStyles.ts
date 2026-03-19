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
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.spacing.md,
      borderRadius: TV.button.borderRadius,
      minHeight: TV.button.minHeight,
    },
    triggerText: {
      fontFamily: "Nunito-SemiBold",
    },
    playerSection: {
      marginBottom: layout.spacing.lg,
    },
    playerTitle: {
      fontFamily: "Nunito-SemiBold",
      marginBottom: layout.spacing.sm,
      textTransform: "uppercase",
    },
    dubbingItem: {
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.s(14),
      borderRadius: layout.radius.sm,
      marginBottom: layout.spacing.xs,
      minHeight: TV.button.minHeight,
      justifyContent: "center",
    },
    dubbingText: {
      fontFamily: "Nunito-Medium",
    },
  };
};
