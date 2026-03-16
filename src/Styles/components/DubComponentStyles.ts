import { useLayout } from "../Layout";
import type { ViewStyle, ImageStyle } from "react-native";

type DubComponentStyles = {
  /** Рядок результату озвучення */
  resultItem: ViewStyle;
  /** Контейнер зображення команди озвучення */
  resultImageContainer: ViewStyle;
  /** Зображення логотипу команди */
  resultImage: ImageStyle;
  /** Блок з текстовою інформацією */
  resultInfo: ViewStyle;
};

export const useDubComponentStyles = (): DubComponentStyles => {
  const layout = useLayout();

  return {
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: layout.s(8),
      paddingHorizontal: layout.s(12),
      borderRadius: layout.s(18),
      marginBottom: layout.s(8),
    },
    resultImageContainer: {
      width: layout.s(50),
      height: layout.s(50),
      borderRadius: layout.s(18),
      justifyContent: "center",
      alignItems: "center",
      marginRight: layout.s(12),
      overflow: "hidden",
    },
    resultImage: {
      width: "100%",
      height: "100%",
    },
    resultInfo: {
      flex: 1,
      marginRight: layout.s(8),
    },
  };
};
