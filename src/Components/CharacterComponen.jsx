import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { TouchableOpacity } from "../Widgets/Button";
import { H3, H4 } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { useWindowDimensions } from "react-native";
import { isTabletLandscape, isTablet } from "../Styles/Responsive";
import { useThemeColors } from "../Global/useTheme";

const CharacterComponent = React.memo(function CharacterComponent({
  item,
  onPress,
}) {
  if (!item) return null;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();

  const name = item.name_ua || item.name_en || item.name_ja || item.name;
  const image = item.image;
  const description = item.description_ua || item.description || "";

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          backgroundColor: themeColors.background,
        },
      ]}
      onPress={() => onPress?.(item)}
      disabled={!onPress}
    >
      <Image
        uri={image}
        style={[
          styles.characterImage,
          isTabletLandscape()
            ? { width: width * 0.1, height: height * 0.25 }
            : isTablet()
              ? { width: width * 0.15, height: height * 0.18 }
              : { width: width * 0.3, height: height * 0.2 },
        ]}
      />
      <View style={styles.infoContainer}>
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.name}>
          {name}
        </Text>
        {description ? (
          <Text
            numberOfLines={5}
            ellipsizeMode="tail"
            style={[H4, { color: themeColors.inActiveText }]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

export default CharacterComponent;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 18,
    marginVertical: 5,
    marginHorizontal: 10,
    alignItems: "flex-start",
  },
  characterImage: {
    borderRadius: 18,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    paddingTop: 5,
  },
  name: {
    ...H3,
    marginBottom: 8,
    textAlign: "center",
  },
});
