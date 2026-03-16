import type { ViewStyle } from "react-native";

type GradientShadowComponentStyles = {
  /** Зовнішня обгортка з тінями */
  wrapper: ViewStyle;
  /** Тінь зверху */
  shadowTop: ViewStyle;
  /** Тінь знизу */
  shadowBottom: ViewStyle;
  /** Тінь ліворуч */
  shadowLeft: ViewStyle;
  /** Тінь праворуч */
  shadowRight: ViewStyle;
};

export const useGradientShadowComponentStyles =
  (): GradientShadowComponentStyles => {
    return {
      wrapper: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      },
      shadowTop: {
        position: "absolute",
        top: 0,
      },
      shadowBottom: {
        position: "absolute",
        bottom: 0,
      },
      shadowLeft: {
        position: "absolute",
        left: 0,
      },
      shadowRight: {
        position: "absolute",
        right: 0,
      },
    };
  };
