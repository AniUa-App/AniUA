import type { ViewStyle } from "react-native";

type TVCardStyles = {
  /** Картка TV (overflow hidden для обрізання анімацій) */
  card: ViewStyle;
};

export const useTVCardStyles = (): TVCardStyles => {
  return {
    card: {
      overflow: "hidden",
    },
  };
};
