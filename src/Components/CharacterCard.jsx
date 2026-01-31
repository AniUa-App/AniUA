import React, { useState } from "react";
import { View, Text, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "../Widgets/Button";
import { Image } from "../Widgets/LoadersWidgets";
import { H6 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import { useThemeColors } from "../Global/useTheme";
import { background } from "../Styles/Colors";

/**
 * Компонент для відображення картки персонажа
 * @param {Object} props
 * @param {Object} props.item - Об'єкт з даними персонажа { character: {...} }
 * @param {number} [props.imageSize=80] - Розмір зображення
 */
export default function CharacterCard({ item, width, height }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [showAnimeDetails, setShowAnimeDetails] = useState(
    SettingsStorage.getParameter("hideAnimeListDetails") !== "true"
  );

  const character = item?.character;
  if (!character?.slug) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        navigation.navigate("HiddenStack", {
          screen: "CharacterScreen",
          params: { slug: character.slug },
        })
      }
    >
      <Image style={[styles.image, { width, height }]} uri={character.image} />
      {showAnimeDetails && (
        <Text
          selectable={true}
          style={[
            H6,
            {
              color: themeColors.primary,
              alignItems: "flex-start",
              textAlign: "start",
              width: "100%",
              paddingHorizontal: 8,
            },
          ]}
        >
          {`${character.name_ua || character.name_en || character.name_ja}`}
        </Text>
      )}
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
