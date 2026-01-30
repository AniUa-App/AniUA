import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { useThemeColors } from "../Global/useTheme";
import { AniuaApi } from "../Api/AniuaApi";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { convertHikkaEpisodes } from "../Components/BottomSheetEpisodes/helpers";
import AnimeStorage from "../Storage/AnimeStorage";
import Logger from "../Logger/Logger";
import { H4 } from "../Styles/Fonts";

export default function AnimeWatchScreen({ route }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Завантаження...");
  const handledRef = useRef(false);

  const {
    slug,
    episode: watchEpisode,
    studio: watchStudio,
    provider: watchProvider,
    time: watchTime,
    build_in: watchBuildInRaw,
  } = route?.params || {};

  // Parse build_in - може прийти як string "true"/"false" або boolean
  const watchBuildIn = watchBuildInRaw === true || watchBuildInRaw === "true";

  // Debug log
  Logger.info("AnimeWatchScreen", "Params", {
    slug,
    watchEpisode,
    watchStudio,
    watchProvider,
    watchTime,
    watchBuildInRaw,
    watchBuildIn,
    allParams: route?.params,
  });

  useEffect(() => {
    const handleWatch = async () => {
      Logger.info("AnimeWatchScreen", "handleWatch called", {
        handledRef: handledRef.current,
        slug,
      });
      if (handledRef.current || !slug) return;
      handledRef.current = true;

      try {
        Logger.info("AnimeWatchScreen", "Handling watch deep link", {
          slug,
          episode: watchEpisode,
          studio: watchStudio,
          provider: watchProvider,
          build_in: watchBuildIn,
        });

        // Fetch anime details
        setMessage("Завантаження аніме...");
        const animeData = await HikkaApiComplete.getAnimeDetails(slug);
        if (!animeData) {
          setStatus("error");
          setMessage("Аніме не знайдено");
          return;
        }

        // Fetch episodes with fallback to hikka-features
        setMessage("Завантаження епізодів...");
        let episodesByPlayer;

        try {
          episodesByPlayer =
            await AniuaApi.getAnimeEpisodesGroupedByPlayer(slug);
        } catch (aniuaError) {
          Logger.warn(
            "AnimeWatchScreen",
            "AniuaApi failed, trying HikkaApi fallback",
            aniuaError
          );

          try {
            const hikkaResult = await HikkaApiComplete.getEpisodes(slug);
            if (hikkaResult.data && typeof hikkaResult.data === "object") {
              episodesByPlayer = convertHikkaEpisodes(hikkaResult.data, slug);
              Logger.info(
                "AnimeWatchScreen",
                "Successfully loaded episodes from HikkaApi fallback",
                {
                  slug,
                  episodesByPlayer,
                }
              );
            } else {
              throw new Error("Invalid HikkaApi response");
            }
          } catch (hikkaError) {
            Logger.error(
              "AnimeWatchScreen",
              "Both AniuaApi and HikkaApi failed",
              hikkaError
            );
            setStatus("error");
            setMessage("Не вдалося завантажити епізоди");
            return;
          }
        }

        // Find the episode
        const playerName = watchProvider || "moon";
        const playerEpisodes = episodesByPlayer[playerName];

        if (!playerEpisodes) {
          Logger.warn("AnimeWatchScreen", "Player not found", { playerName });
          setStatus("error");
          setMessage("Плеєр не знайдено");
          return;
        }

        // Find studio/team
        const availableStudios = Object.keys(playerEpisodes);
        Logger.info("AnimeWatchScreen", "Available studios", {
          availableStudios,
          watchStudio,
        });

        // Спробувати знайти студію за точним ім'ям або частковим співпадінням
        let studioName = watchStudio;
        let studioEpisodes = playerEpisodes[studioName];

        if (!studioEpisodes && watchStudio) {
          // Спробувати знайти з декодуванням
          const decodedStudio = decodeURIComponent(watchStudio);
          studioEpisodes = playerEpisodes[decodedStudio];
          if (studioEpisodes) studioName = decodedStudio;
        }

        if (!studioEpisodes && watchStudio) {
          // Спробувати знайти часткове співпадіння
          const lowerWatchStudio = watchStudio
            .toLowerCase()
            .replace(/\s+/g, "");
          const foundStudio = availableStudios.find(
            (s) =>
              s.toLowerCase().replace(/\s+/g, "") === lowerWatchStudio ||
              s.toLowerCase().includes(watchStudio.toLowerCase())
          );
          if (foundStudio) {
            studioName = foundStudio;
            studioEpisodes = playerEpisodes[foundStudio];
          }
        }

        if (!studioEpisodes) {
          // Використати першу доступну студію
          studioName = availableStudios[0];
          studioEpisodes = playerEpisodes[studioName];
        }

        if (!studioEpisodes) {
          Logger.warn("AnimeWatchScreen", "Studio not found", {
            studioName,
            availableStudios,
          });
          setStatus("error");
          setMessage("Студію не знайдено");
          return;
        }

        Logger.info("AnimeWatchScreen", "Using studio", { studioName });

        // Find specific episode
        const episodeNum =
          typeof watchEpisode === "number"
            ? watchEpisode
            : parseInt(watchEpisode, 10);
        const episode = studioEpisodes.find((ep) => ep.episode === episodeNum);

        if (!episode) {
          Logger.warn("AnimeWatchScreen", "Episode not found", {
            watchEpisode: episodeNum,
          });
          setStatus("error");
          setMessage(`Епізод ${episodeNum} не знайдено`);
          return;
        }

        // Update storage
        const info = AnimeStorage.get(slug) || {};
        const watched_episodes = !(info.watched_episodes || []).includes(
          episode.episode
        )
          ? [...(info.watched_episodes || []), episode.episode]
          : info.watched_episodes || [];

        AnimeStorage.set(slug, {
          ...info,
          watched_episodes,
          dub_team: studioName,
          player: watchBuildIn ? "Вбудований плеєр" : playerName,
        });

        // Navigate to player
        NavigationBar.setVisibilityAsync("hidden");

        if (watchBuildIn) {
          navigation.replace("LocalVideoPlayer", {
            _episodes: studioEpisodes,
            _currentEpisode: episode,
            _anime: animeData,
            _startTime: watchTime || 0,
          });
        } else {
          navigation.replace("WebVideoPlayer", {
            videoUrl: episode?.video_url,
            title: `${animeData?.title_ua || animeData?.title_en || animeData?.title_ja} - ${episode?.episode} серія`,
          });
        }
      } catch (error) {
        Logger.error(
          "AnimeWatchScreen",
          "Failed to handle watch deep link",
          error
        );
        setStatus("error");
        setMessage("Не вдалося відкрити епізод");
      }
    };

    handleWatch();
  }, [
    slug,
    watchEpisode,
    watchStudio,
    watchProvider,
    watchTime,
    watchBuildIn,
    navigation,
  ]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {status === "loading" ? (
        <>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text
            selectable={true}
            style={[H4, { color: themeColors.text, marginTop: 16 }]}
          >
            {message}
          </Text>
        </>
      ) : (
        <>
          <Text
            selectable={true}
            style={[H4, { color: themeColors.text, textAlign: "center" }]}
          >
            {message}
          </Text>
          <Text
            selectable={true}
            style={[H4, { color: themeColors.primary, marginTop: 16 }]}
            onPress={() => navigation.goBack()}
          >
            Повернутися
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
