import React from "react";
import { View, Text, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "../Widgets/Button";
import { Image } from "../Widgets/LoadersWidgets";
import { H6 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";

/**
 * Компонент для відображення картки персонажа
 * @param {Object} props
 * @param {Object} props.item - Об'єкт з даними персонажа { character: {...} }
 * @param {number} [props.imageSize=80] - Розмір зображення
 */
export default function CharacterCard({ item, width, height }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();

  const character = item?.character;
  if (!character?.slug) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        Linking.openURL(`https://aniua.yuzka.site/characters/${character.slug}`)
      }
    >
      <Image style={[styles.image, { width, height }]} uri={character.image} />
    </TouchableOpacity>
  );
}

const styles = {
  container: {
    marginRight: 12,
    alignItems: "center",
  },
  image: {
    borderRadius: 12,
    marginBottom: 8,
  },
};
