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
      gap: layout.spacing.sm,
    },
    episodeItem: {
      flexDirection: "row",
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
