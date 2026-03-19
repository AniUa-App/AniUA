import { useLayout } from "../Layout";
import type { ViewStyle, ImageStyle } from "react-native";

type YouTubeVideosStyles = {
  /** Контейнер відео картки */
  videoContainer: ViewStyle;
  /** Мініатюра відео (100% ширина та висота) */
  thumbnail: ImageStyle;
  /** Контейнер кнопки відтворення (absoluteFillObject) */
  playButtonContainer: ViewStyle;
  /** Кнопка відтворення (кругла) */
  playButton: ViewStyle;
  /** Відступ між елементами списку */
  separator: ViewStyle;
};

export const useYouTubeVideosStyles = (): YouTubeVideosStyles => {
  const layout = useLayout();

  return {
    videoContainer: {
      borderRadius: layout.radius.md,
      overflow: "hidden",
      position: "relative",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
    },
    playButtonContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    playButton: {
      width: layout.sizing.md,
      height: layout.sizing.md,
      borderRadius: layout.s(32),
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: layout.spacing.xs,
    },
    separator: {
      width: layout.s(12),
    },
  };
};
