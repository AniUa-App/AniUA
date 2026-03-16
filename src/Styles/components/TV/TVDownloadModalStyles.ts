import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle } from "react-native";

type TVDownloadModalStyles = {
  /** Кнопка відкриття модалки (trigger) */
  triggerButton: ViewStyle;
  /** Сітка серій для завантаження */
  episodesGrid: ViewStyle;
  /** Елемент серії */
  episodeItem: ViewStyle;
  /** Номер серії */
  episodeText: TextStyle;
};

export const useTVDownloadModalStyles = (): TVDownloadModalStyles => {
  const layout = useLayout();

  return {
    triggerButton: {
      alignItems: "center",
      justifyContent: "center",
      width: TV.button.minWidth,
      height: TV.button.minHeight,
      borderRadius: TV.button.borderRadius,
    },
    episodesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: layout.s(8),
    },
    episodeItem: {
      flexDirection: "row",
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
