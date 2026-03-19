import { useLayout } from "../Layout";
import { H3 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type CharacterComponentStyles = {
  /** Картка персонажа (рядок) */
  cardContainer: ViewStyle;
  /** Зображення персонажа */
  characterImage: ImageStyle;
  /** Блок з інформацією про персонажа */
  infoContainer: ViewStyle;
  /** Ім'я персонажа (H3, по центру) */
  name: TextStyle;
};

export const useCharacterComponentStyles = (): CharacterComponentStyles => {
  const layout = useLayout();

  return {
    cardContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      padding: layout.spacing.xmd,
      borderRadius: layout.radius.xlg,
      marginVertical: layout.s(5),
      marginHorizontal: layout.spacing.xmd,
      alignItems: "flex-start",
    },
    characterImage: {
      borderRadius: layout.radius.xlg,
      marginRight: layout.spacing.xmd,
    },
    infoContainer: {
      flex: 1,
      paddingTop: layout.s(5),
    },
    name: {
      ...H3,
      marginBottom: layout.spacing.sm,
      textAlign: "center",
    },
  };
};
