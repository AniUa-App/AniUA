import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { TouchableOpacity } from "../Widgets/Button";
import { H3, H4 } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { useWindowDimensions } from "react-native";
import { isTabletLandscape, isTablet, useIsTV } from "../Styles/Responsive";
import { TV } from "../Styles/TVStyles";
import { useThemeColors } from "../Global/useTheme";

const CharacterComponent = React.memo(function CharacterComponent({
  item,
  onPress,
  onFocus,
}) {
  if (!item) return null;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const isTVDevice = useIsTV();

  const name = item.name_ua || item.name_en || item.name_ja || item.name;
  const image = item.image;
  const description = item.description_ua || item.description || "";

  const imageDims = isTVDevice
    ? { width: width * 0.15, height: height * 0.4 }
    : isTabletLandscape()
      ? { width: width * 0.1, height: height * 0.25 }
      : isTablet()
        ? { width: width * 0.15, height: height * 0.18 }
        : { width: width * 0.3, height: height * 0.2 };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          backgroundColor: themeColors.background,
        },
        isTVDevice && {
          padding: TV.padding.card,
          marginVertical: 4,
          marginHorizontal: TV.padding.card,
        },
      ]}
      onPress={() => onPress?.(item)}
      onFocus={onFocus}
      disabled={!onPress}
    >
      <Image
        uri={image}
        style={[
          styles.characterImage,
          imageDims,
          isTVDevice && {
            marginRight: TV.padding.card,
          },
        ]}
      />
      <View style={[styles.infoContainer, isTVDevice && { paddingTop: 8 }]}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[styles.name, isTVDevice && { marginBottom: 12 }]}
        >
          {name}
        </Text>
        {description ? (
          <Text
            numberOfLines={isTVDevice ? 8 : 5}
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
