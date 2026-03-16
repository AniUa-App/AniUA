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
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(12),
      borderRadius: TV.button.borderRadius,
      minHeight: TV.button.minHeight,
    },
    triggerText: {
      fontFamily: "Nunito-SemiBold",
    },
    episodesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: layout.s(8),
    },
    episodeItem: {
      minWidth: layout.s(64),
      minHeight: TV.button.minHeight,
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(12),
      borderRadius: layout.s(8),
      alignItems: "center",
      justifyContent: "center",
    },
    episodeText: {
      fontFamily: "Nunito-SemiBold",
    },
  };
};
