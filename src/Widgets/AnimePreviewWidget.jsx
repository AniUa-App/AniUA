import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "./Button";
import React, { useRef } from "react";
import { useThemeColors } from "../Global/useTheme";
import Icon from "../Styles/Icons";
import { H3, H4 } from "../Styles/Fonts";
import { useNavigation } from "@react-navigation/native";
import { Image } from "./LoadersWidgets";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { useState, useEffect } from "react";
import EpisodesBottomSheet from "./EpisodesBottomSheetWidget";
import * as FileSystem from "expo-file-system";
import FileOpener from "../Global/FileOpener";
import {
  isTabletLandscape,
  isTablet,
  useIsTablet,
  useIsTV,
} from "../Styles/Responsive";
import { TV } from "../Styles/TVStyles";
import { useWindowDimensions } from "react-native";
import Logger from "../Logger/Logger";
import { prefetchBloomImage } from "./BloomImage";

const AnimePreviewWidget = React.memo(function AnimePreviewWidget({
  anime,
  info,
  updateInfo,
  type,
  maxHeight,
  maxWidth,
  gridMode = false, // New prop for tablet grid layout
  cardWidth = null, // Explicit card width for grids
  onFocus,
}) {
  if (!anime || !anime.slug) return null;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const isTabletDevice = useIsTablet();
  const isTVDevice = useIsTV();

  const [episodesList, setEpisodesList] = useState([]);

  useEffect(() => {
    HikkaApiComplete.getEpisodes(anime.slug)
      .then((res) => {
        if (res.error) {
          Logger.error("AnimePreviewWidget", "Помилка завантаження епізодів", {
            slug: anime.slug,
            error: res.error,
          });
          setEpisodesList({});
        } else {
          setEpisodesList(res.data);
        }
      })
      .catch((error) => {
        Logger.error(
          "AnimePreviewWidget",
          "Помилка завантаження епізодів (exception)",
          { slug: anime.slug, error: error?.message || error },
        );
        setEpisodesList({});
      });
  }, [anime.slug]);

  const navigation = useNavigation();
  const isFavorite = info?.isFavorite || false;
  const hasDownloads = (info?.downloaded_episodes?.length || 0) > 0;
  const sheetRef = useRef(null);

  const Component = {
    icon: {
      Liked: Icon.Heart,
      Downloaded: Icon.DownloadSimple,
    },
    onPress: {
      Liked: () => updateInfo(anime.slug, { isFavorite: !isFavorite }),
      Downloaded: () => {
        if (sheetRef.current) {
          sheetRef.current?.present();
        }
      },
    },
  };

  const isIconFilled =
    type === "Liked"
      ? isFavorite
      : type === "Downloaded"
        ? hasDownloads
        : type === "Search"
          ? true
          : false;

  const IconComponent = Component.icon[type];
  const handlePress = Component.onPress[type];

  // Calculate image dimensions based on mode
  const getImageDimensions = () => {
    if (gridMode && cardWidth) {
      // Grid mode: use card width for proportional sizing
      const imgWidth = cardWidth - 16; // Account for padding
      const imgHeight = imgWidth * 1.4; // Poster aspect ratio
      return { width: imgWidth, height: imgHeight };
    }
    // List mode with maxWidth (tablet horizontal cards)
    if (maxWidth) {
      const imgWidth = maxWidth * 0.28;
      const imgHeight = imgWidth * 1.4;
      return { width: imgWidth, height: imgHeight };
    }
    // TV: larger images for 10-foot viewing
    if (isTVDevice) {
      return { width: width * 0.15, height: height * 0.4 };
    }
    // Default list mode
    if (isTabletLandscape()) {
      return { width: width * 0.12, height: height * 0.3 };
    }
    if (isTablet()) {
      return { width: width * 0.2, height: height * 0.2 };
    }
    return { width: width * 0.35, height: height * 0.25 };
  };

  const imageDims = getImageDimensions();

  return (
    <>
      <TouchableOpacity
        style={[
          gridMode ? styles.gridCardContainer : styles.cardContainer,
          { backgroundColor: themeColors.background },
          gridMode && cardWidth ? { width: cardWidth } : null,
          isTVDevice && !gridMode && styles.tvCardContainer,
        ]}
        onPress={() => {
          // Prefetch зображення перед навігацією
          prefetchBloomImage(anime.image);
          navigation.navigate("HiddenStack", {
            screen: "AnimePreview",
            params: { anime },
          });
        }}
        onFocus={onFocus}
      >
        <Image
          uri={anime.image}
          style={[
            styles.animeImage,
            { width: imageDims.width, height: imageDims.height },
          ]}
        />
        <View
          style={[
            gridMode ? styles.gridInfoContainer : styles.infoContainer,
            isTVDevice && !gridMode && styles.tvInfoContainer,
          ]}
        >
          <Text
            selectable={true}
            numberOfLines={gridMode ? 2 : 4}
            ellipsizeMode="tail"
            style={[
              H3,
              { marginBottom: gridMode ? 4 : maxHeight ? 0 : 20 },
              isTVDevice && { marginBottom: 12 },
            ]}
          >
            {(anime.title_ua || anime.title_en || anime.title_ja).length > 20 &&
            !isTVDevice
              ? (anime.title_ua || anime.title_en || anime.title_ja)
                  .split(" ")
                  .slice(0, 6)
                  .join(" ") + "..."
              : anime.title_ua || anime.title_en || anime.title_ja}
          </Text>
          {!gridMode && (
            <>
              <Text
                selectable={true}
                style={[
                  H4,
                  { marginBottom: 8 },
                  isTVDevice && {
                    marginBottom: 12,
                  },
                ]}
              >
                Рейтинг:{" "}
                <Text
                  selectable={true}
                  style={[
                    styles.animeHighlight,
                    { color: themeColors.primary },
                  ]}
                >
                  {anime.rating === "g"
                    ? "0+"
                    : anime.rating === "pg"
                      ? "6+"
                      : anime.rating === "pg_13"
                        ? "13+"
                        : anime.rating === "r"
                          ? "16+"
                          : "18+"}
                </Text>
              </Text>
              <Text
                selectable={true}
                style={[
                  H4,
                  { marginBottom: 8 },
                  isTVDevice && {
                    marginBottom: 12,
                  },
                ]}
              >
                Дата виходу:{" "}
                <Text
                  selectable={true}
                  style={[
                    styles.animeHighlight,
                    { color: themeColors.primary },
                  ]}
                >
                  {anime.year}
                </Text>
              </Text>
            </>
          )}
          {gridMode && anime.year && (
            <Text
              selectable={true}
              style={[H4, { color: themeColors.inActiveText }]}
            >
              {anime.year}
            </Text>
          )}
          {!gridMode && anime.genres && anime.genres.length > 0 && (
            <Text
              selectable={true}
              numberOfLines={maxHeight ? 1 : 2}
              ellipsizeMode="tail"
              style={[H4, isTVDevice]}
            >
              Жанри:{" "}
              <Text
                selectable={true}
                style={[styles.animeHighlight, { color: themeColors.primary }]}
              >
                {anime.genres.map((genre) => genre.name_ua).join(", ")}
              </Text>
            </Text>
          )}
        </View>
        {IconComponent && (
          <TouchableOpacity
            style={[
              gridMode ? styles.gridFavoriteButton : styles.favoriteButton,
              { padding: gridMode ? 8 : maxHeight ? maxHeight / 100 : 20 },
              isTVDevice && !gridMode && { padding: TV.padding.card },
            ]}
            onPress={handlePress}
            tvFocusable={false}
          >
            <IconComponent
              fill={isIconFilled ? themeColors.primary : themeColors.text}
              size={isTVDevice ? 48 : gridMode ? 24 : 34}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <EpisodesBottomSheet
        sheetRef={sheetRef}
        episodesList={episodesList}
        storage_data={info}
        type="download"
        isChanges={null}
        checkForStyle={(item) => {
          if (!info.downloaded_episodes?.length) return false;

          const episode = info.downloaded_episodes.find(
            (ep) => ep.episode === item.episode,
          );

          return (
            episode &&
            episode.video_path &&
            typeof episode.video_path === "string"
          );
        }}
        onSelectEpisode={async (item) => {
          const episode = (info.downloaded_episodes || []).find(
            (ep) => ep.episode === item.episode,
          );
          if (episode) {
            try {
              const fileInfo = await FileSystem.getInfoAsync(
                episode.video_path,
              );
              if (fileInfo.exists) {
                Logger.debug("AnimePreviewWidget", "Відкриття відео файлу", {
                  videoPath: episode.video_path,
                });

                FileOpener.openFile(episode.video_path)
                  .then(() =>
                    Logger.info("AnimePreviewWidget", "Діалог вибору відкрито"),
                  )
                  .catch((error) =>
                    Logger.error(
                      "AnimePreviewWidget",
                      "Помилка при відкритті файлу",
                      error,
                    ),
                  );
              } else {
                prefetchBloomImage(anime.image);
                navigation.navigate("HiddenStack", {
                  screen: "AnimePreview",
                  params: { anime, downloadEpisode: item },
                });
              }
            } catch (error) {
              Logger.error(
                "AnimePreviewWidget",
                "Помилка при відкритті файлу",
                error,
              );
            }
          }
        }}
      />
    </>
  );
});

export default AnimePreviewWidget;

const styles = StyleSheet.create({
  // List mode styles (default)
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
  animeImage: {
    borderRadius: 18,
    marginRight: 10,
    marginLeft: 1,
  },
  infoContainer: {
    flex: 1,
    paddingTop: 5,
  },
  favoriteButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
  // TV mode styles
  tvCardContainer: {
    padding: TV.padding.card,
    marginVertical: 4,
    marginHorizontal: TV.padding.card,
  },
  tvInfoContainer: {
    paddingTop: 8,
    paddingLeft: TV.padding.card,
  },
  // Grid mode styles (for tablet)
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
  gridFavoriteButton: {
    position: "absolute",
    right: 4,
    top: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
});
