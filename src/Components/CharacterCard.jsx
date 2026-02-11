import React, { useState } from "react";
import { View, Text, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "../Widgets/Button";
import { Image } from "../Widgets/LoadersWidgets";
import { H6 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import { useThemeColors } from "../Global/useTheme";
import { background } from "../Styles/Colors";
import { useIsTV } from "../Styles/Responsive";
import { TV } from "../Styles/TVStyles";

/**
 * Компонент для відображення картки персонажа
 * @param {Object} props
 * @param {Object} props.item - Об'єкт з даними персонажа { character: {...} }
 * @param {number} [props.imageSize=80] - Розмір зображення
 */
export default function CharacterCard({ item, width, height }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const isTV = useIsTV();
  const [showAnimeDetails, setShowAnimeDetails] = useState(
    SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
  );

  const character = item?.character;
  if (!character?.slug) return null;

  const cardWidth = isTV && width ? width * 1.4 : width;
  const cardHeight = isTV && height ? height * 1.4 : height;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isTV && { marginRight: TV.padding.card, maxWidth: cardWidth },
      ]}
      onPress={() =>
        navigation.navigate("HiddenStack", {
          screen: "CharacterScreen",
          params: { slug: character.slug },
        })
      }
    >
      <Image
        style={[styles.image, { width: cardWidth, height: cardHeight }]}
        uri={character.image}
      />
      {showAnimeDetails && (
        <Text
          selectable={true}
          numberOfLines={2}
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
