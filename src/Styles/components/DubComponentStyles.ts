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
      padding: layout.spacing.sm,
      paddingHorizontal: layout.spacing.md,
      borderRadius: layout.radius.xlg,
      marginBottom: layout.spacing.sm,
    },
    resultImageContainer: {
      width: layout.sizing.touchMd,
      height: layout.sizing.touchMd,
      borderRadius: layout.radius.xlg,
      justifyContent: "center",
      alignItems: "center",
      marginRight: layout.spacing.md,
      overflow: "hidden",
    },
    resultImage: {
      width: "100%",
      height: "100%",
    },
    resultInfo: {
      flex: 1,
      marginRight: layout.spacing.sm,
    },
  };
};
