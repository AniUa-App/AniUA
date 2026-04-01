import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "./Button";
import React from "react";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4 } from "../Styles/Fonts";
import { useNavigation } from "@react-navigation/native";
import { Image } from "./LoadersWidgets";
import {
  isTabletLandscape,
  isTablet,
  useIsTablet,
  useIsTV,
} from "../Styles/Responsive";
import { useWindowDimensions } from "react-native";
import { prefetchBloomImage } from "./BloomImage";

const MangaPreviewWidget = React.memo(function MangaPreviewWidget({
  manga,
  type,
  maxHeight,
  maxWidth,
  gridMode = false,
  cardWidth = null,
  onFocus,
}) {
  if (!manga || !manga.slug) return null;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const isTabletDevice = useIsTablet();
  const isTVDevice = useIsTV();
  const navigation = useNavigation();

  var title;

  const getImageDimensions = () => {
    if (gridMode && cardWidth) {
      const imgWidth = cardWidth - 16;
      const imgHeight = imgWidth * 1.4;
      return { width: imgWidth, height: imgHeight };
    }
    if (maxWidth) {
      const imgWidth = maxWidth * 0.28;
      const imgHeight = imgWidth * 1.4;
      return { width: imgWidth, height: imgHeight };
    }
    if (isTVDevice) {
      title =
        (manga.title_ua || manga.title_en || manga.title_original).length > 30
          ? (
              manga.title_ua ||
              manga.title_en ||
              manga.title_original
            ).substring(0, 30) + "..."
          : manga.title_ua || manga.title_en || manga.title_original;
      return { width: width * 0.12, height: height * 0.3 };
    } else if (isTabletLandscape()) {
      title = manga.title_ua || manga.title_en || manga.title_original;
      return { width: width * 0.12, height: height * 0.3 };
    } else if (isTablet()) {
      title =
        (manga.title_ua || manga.title_en || manga.title_original).length > 25
          ? (
              manga.title_ua ||
              manga.title_en ||
              manga.title_original
            ).substring(0, 25) + "..."
          : manga.title_ua || manga.title_en || manga.title_original;
      return { width: width * 0.2, height: height * 0.2 };
    } else {
      title =
        (manga.title_ua || manga.title_en || manga.title_original).length > 20
          ? (
              manga.title_ua ||
              manga.title_en ||
              manga.title_original
            ).substring(0, 20) + "..."
          : manga.title_ua || manga.title_en || manga.title_original;
      return { width: width * 0.35, height: height * 0.25 };
    }
  };

  const imageDims = getImageDimensions();

  const getStatusText = (status) => {
    switch (status) {
      case "finished":
        return "Завершено";
      case "ongoing":
        return "Онґоінг";
      case "announced":
        return "Анонс";
      default:
        return status || "Невідомо";
    }
  };

  return (
    <TouchableOpacity
      style={[
        gridMode ? styles.gridCardContainer : styles.cardContainer,
        { backgroundColor: themeColors.background },
        gridMode && cardWidth ? { width: cardWidth } : null,
      ]}
      onPress={() => {
        prefetchBloomImage(manga.image);
        navigation.navigate("HiddenStack", {
          screen: "MangaPreview",
          params: { manga, _fromTap: true },
        });
      }}
      onFocus={onFocus}
    >
      <Image
        uri={manga.image}
        style={[
          styles.mangaImage,
          { width: imageDims.width, height: imageDims.height },
        ]}
      />
      <View
        style={[gridMode ? styles.gridInfoContainer : styles.infoContainer]}
      >
        <Text
          selectable={true}
          numberOfLines={gridMode ? 2 : 4}
          ellipsizeMode="tail"
          style={[H3, { marginBottom: gridMode ? 4 : maxHeight ? 0 : 20 }]}
        >
          {title}
        </Text>
        {!gridMode && (
          <>
            <Text selectable={true} style={[H4, { marginBottom: 8 }]}>
              Статус:{" "}
              <Text
                selectable={true}
                style={[styles.highlight, { color: themeColors.primary }]}
              >
                {getStatusText(manga.status)}
              </Text>
            </Text>
            {manga.chapters && (
              <Text selectable={true} style={[H4, { marginBottom: 8 }]}>
                Розділів:{" "}
                <Text
                  selectable={true}
                  style={[styles.highlight, { color: themeColors.primary }]}
                >
                  {manga.chapters}
                </Text>
              </Text>
            )}
          </>
        )}
        {gridMode && manga.year && (
          <Text
            selectable={true}
            style={[H4, { color: themeColors.inActiveText }]}
          >
            {manga.year}
          </Text>
        )}
        {!gridMode && manga.genres && manga.genres.length > 0 && (
          <Text
            selectable={true}
            numberOfLines={maxHeight ? 1 : 2}
            ellipsizeMode="tail"
            style={[H4]}
          >
            Жанри:{" "}
            <Text
              selectable={true}
              style={[styles.highlight, { color: themeColors.primary }]}
            >
              {manga.genres.map((genre) => genre.name_ua).join(", ")}
            </Text>
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default MangaPreviewWidget;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 18,
    marginVertical: 2,
    marginHorizontal: 8,
    alignItems: "flex-start",
    position: "relative",
  },
  mangaImage: {
    borderRadius: 18,
    marginRight: 10,
    marginLeft: 1,
  },
  infoContainer: {
    flex: 1,
    paddingTop: 5,
  },
  highlight: {},
  gridCardContainer: {
    flexDirection: "column",
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 18,
    marginVertical: 4,
    alignItems: "center",
    position: "relative",
  },
  gridInfoContainer: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
});
