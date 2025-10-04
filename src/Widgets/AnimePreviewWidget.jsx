import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "./Button";
import React, { useRef } from "react";
import { GetScreenHeight, GetScreenWidth } from "../Global/Functions";
import { appColor, black, white } from "../Styles/Colors";
import Icon from "../Styles/Icons";
import { H3, H4 } from "../Styles/Fonts";
import { useNavigation } from "@react-navigation/native";
import { Image } from "./LoadersWidgets";
import SettingsStorage from "../Storage/SettingsStorage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { HikkaApi } from "../Sources/hikka";
import { useState, useEffect } from "react";
import { DownloadVideo } from "../Notifications/VideoDownloader";
import { DEBUGCONFIG } from "../cfgs/DebugConfig";
import EpisodesBottomSheet from "./EpisodesBottomSheetWidget";
import * as FileSystem from "expo-file-system";
import FileOpener from "../Global/FileOpener";
import { isTabletLandscape, isTablet } from "../Styles/Responsive";
import { useWindowDimensions } from "react-native";

const AnimePreviewWidget = React.memo(function AnimePreviewWidget({
  anime,
  info,
  updateInfo,
  type,
  maxHeight,
  maxWidth,
}) {
  if (!anime || !anime.slug) return null;
  const { width, height } = useWindowDimensions();

  const [episodesList, setEpisodesList] = useState([]);

  useEffect(() => {
    HikkaApi.getEpisodes(anime.slug)
      .then((res) => {
        if (res.error) {
          console.log(
            `Помилка завантаження епізодів для ${anime.slug}: ${res.error}`
          );
          setEpisodesList({});
        } else {
          setEpisodesList(res.data);
        }
      })
      .catch((error) => {
        console.log(
          `Помилка завантаження епізодів для ${anime.slug}: ${
            error?.message || error
          }`
        );
        setEpisodesList({});
      });
  }, [anime.slug]);

  const navigation = useNavigation();
  const isFavorite = info?.isFavorite || false;
  const hasDownloads = (info?.downloaded?.episodes?.length || 0) > 0;
  const sheetRef = useRef(null);

  const Component = {
    icon: {
      Liked: Icon.Heart,
      Downloaded: Icon.DownloadSimple,
      Search: Icon.ArrowCircleRight,
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

  return (
    <>
      <TouchableOpacity
        style={[styles.cardContainer]}
        onPress={() =>
          navigation.navigate("HiddenStack", {
            screen: "AnimePreview",
            params: { anime },
          })
        }
      >
        <Image
          uri={anime.image}
          style={[
            styles.animeImage,
            isTabletLandscape()
              ? { width: width * 0.12, height: height * 0.3 }
              : isTablet()
                ? { width: width * 0.2, height: height * 0.2 }
                : { width: width * 0.4, height: height * 0.3 },
          ]}
        />
        <View style={[styles.infoContainer]}>
          <Text
            numberOfLines={4}
            ellipsizeMode="tail"
            style={[H3, { marginBottom: maxHeight ? 0 : 20 }]}
          >
            {anime.title_ua}
          </Text>
          <Text style={[H4, { marginBottom: 8 }]}>
            Рейтинг:{" "}
            <Text style={styles.animeHighlight}>
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
          <Text style={[H4, { marginBottom: 8 }]}>
            Дата виходу: <Text style={styles.animeHighlight}>{anime.year}</Text>
          </Text>
          <Text
            numberOfLines={maxHeight ? 1 : 2}
            ellipsizeMode="tail"
            style={H4}
          >
            Жанри:
            <Text style={styles.animeHighlight}>
              {anime.genres?.map((genre) => genre.name_ua).join(", ") ?? ""}
            </Text>
          </Text>
        </View>
        {IconComponent && (
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              { padding: maxHeight ? maxHeight / 100 : 20 },
            ]}
            onPress={handlePress}
          >
            <IconComponent fill={isIconFilled ? appColor : white} />
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
          if (!info.downloaded?.episodes) return false;

          const episode = info.downloaded.episodes.find(
            (ep) => ep.episode === item.episode
          );

          return (
            episode &&
            episode.video_path &&
            typeof episode.video_path === "string"
          );
        }}
        onSelectEpisode={async (item) => {
          const episode = info.downloaded?.episodes?.find(
            (ep) => ep.episode === item.episode
          );
          if (episode) {
            try {
              const fileInfo = await FileSystem.getInfoAsync(
                episode.video_path
              );
              if (fileInfo.exists) {
                console.log(episode.video_path, "episode.video_path");

                FileOpener.openFile(episode.video_path, "video/*")
                  .then(() => console.log("Діалог вибору відкрито"))
                  .catch((error) =>
                    console.error("Помилка при відкритті файлу:", error)
                  );
              } else {
                navigation.navigate("HiddenStack", {
                  screen: "AnimePreview",
                  params: { anime, downloadEpisode: item },
                });
              }
            } catch (error) {
              console.error("Помилка при відкритті файлу:", error);
            }
          }
        }}
      />
    </>
  );
});

export default AnimePreviewWidget;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    alignItems: "flex-start",
    position: "relative",
  },
  animeImage: {
    borderRadius: 10,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    paddingTop: 5,
  },
  animeHighlight: {
    color: appColor,
  },
  favoriteButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
