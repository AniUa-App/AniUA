import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle } from "react-native";

type TVEpisodesSelectorStyles = {
  /** Кнопка відкриття модалки (trigger) */
  triggerButton: ViewStyle;
  /** Текст кнопки */
  triggerText: TextStyle;
  /** Сітка серій */
  episodesGrid: ViewStyle;
  /** Елемент серії */
  episodeItem: ViewStyle;
  /** Номер серії */
  episodeText: TextStyle;
};

export const useTVEpisodesSelectorStyles = (): TVEpisodesSelectorStyles => {
  const layout = useLayout();

  return {
    triggerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.spacing.md,
      borderRadius: TV.button.borderRadius,
      minHeight: TV.button.minHeight,
    },
    triggerText: {
      fontFamily: "Nunito-SemiBold",
    },
    episodesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: layout.spacing.sm,
    },
    episodeItem: {
      minWidth: layout.sizing.md,
      minHeight: TV.button.minHeight,
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.spacing.md,
      borderRadius: layout.radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    episodeText: {
      fontFamily: "Nunito-SemiBold",
    },
  };
};
