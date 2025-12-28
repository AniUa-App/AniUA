import { StyleSheet, Text, ActivityIndicator } from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { H3 } from "../Styles/Fonts";
import Icon from "../Styles/Icons";
import { TouchableOpacity } from "./Button";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { useThemeColors } from "../Global/useTheme";
import Logger from "../Logger/Logger";

const BUTTON_STATES = {
  LOADING: "loading",
  NO_TRANSLATION: "no_translation",
  START_WATCHING: "start_watching",
  CONTINUE_WATCHING: "continue_watching",
  EPISODE_NOT_RELEASED: "episode_not_released",
  EPISODE_NOT_TRANSLATED: "episode_not_translated",
  ADD_TO_FAVORITES: "add_to_favorites",
  SHARE: "share",
  NO_EPISODES: "no_episodes",
};

const WATCH_STATUS = {
  WATCHING: "watching",
  COMPLETED: "completed",
  PLANNED: "planned",
  DROPPED: "dropped",
  ON_HOLD: "on_hold",
};

function navigateToPlayer(navigation, player, episode, episodesList, anime, dubbing) {
  const isBuiltInPlayer = player === "Вбудований плеєр";

  const screen = isBuiltInPlayer ? "LocalVideoPlayer" : "WebVideoPlayer";
  const params = isBuiltInPlayer
    ? {
        _episodes: episodesList[player][dubbing],
        _currentEpisode: episode,
        _anime: anime,
      }
    : {
        videoUrl: episode?.video_url,
        title: `${anime?.title_ua} - ${episode?.episode} серія`,
      };

  navigation.navigate("HiddenStack", { screen, params });
  SystemNavigationBar.navigationHide();
}

function getEpisodeData(episodesList, player, dubbing) {
  if (!player || !dubbing || !episodesList?.[player]?.[dubbing]) {
    return null;
  }
  return episodesList[player][dubbing];
}

function determineButtonState({ watchData, episodes, anime }) {
  const watchedCount = watchData?.episodes || 0;
  const totalEpisodes = anime?.episodes_total;
  const releasedEpisodes = anime?.episodes_released;
  const availableEpisodes = episodes?.length || 0;
  const isFavorite = watchData?.isFavorite;

  if (watchedCount >= totalEpisodes && totalEpisodes > 0) {
    return isFavorite ? BUTTON_STATES.SHARE : BUTTON_STATES.ADD_TO_FAVORITES;
  }

  if (watchedCount === 0) {
    return episodes?.[0] ? BUTTON_STATES.START_WATCHING : BUTTON_STATES.NO_EPISODES;
  }

  const nextEpisodeIndex = watchedCount;

  if (availableEpisodes > releasedEpisodes) {
    if (nextEpisodeIndex < availableEpisodes) {
      return BUTTON_STATES.CONTINUE_WATCHING;
    }
    return isFavorite ? BUTTON_STATES.SHARE : BUTTON_STATES.ADD_TO_FAVORITES;
  }

  if (watchedCount >= releasedEpisodes) {
    return BUTTON_STATES.EPISODE_NOT_RELEASED;
  }

  if (!episodes?.[nextEpisodeIndex]) {
    return BUTTON_STATES.EPISODE_NOT_TRANSLATED;
  }

  return BUTTON_STATES.CONTINUE_WATCHING;
}

/**
 * @deprecated Використовуйте ForwardButton компонент напряму
 */
export function ViewEpisode({ navigation, episodesList, info, anime, theme }) {
  const player = info?.watched?.player;
  const dubbing = info?.watched?.dubbing;

  if (!info?.watched || !episodesList) {
    return { text: "Завантаження...", data: info || {}, function: () => {} };
  }

  const episodes = getEpisodeData(episodesList, player, dubbing);
  if (!episodes) {
    return {
      text: "Немає перекладу",
      data: info,
      function: () => {},
      style: { backgroundColor: theme?.primary },
    };
  }

  const watchedEpisodes = info?.watched?.episodes;
  const episodesCount =
    typeof watchedEpisodes === "number"
      ? watchedEpisodes
      : Array.isArray(watchedEpisodes)
        ? Math.max(0, ...watchedEpisodes)
        : 0;

  const watchData = {
    episodes: episodesCount,
    status: info?.watched?.status,
    isFavorite: info?.watched?.isFavorite || info?.isFavorite,
  };

  const state = determineButtonState({ watchData, episodes, anime });
  const nextEpisodeIndex = episodesCount;
  const nextEpisode = episodes?.[nextEpisodeIndex];
  const firstEpisode = episodes?.[0];
  const totalEpisodes = anime?.episodes_total;

  const updateWatchViaApi = async (count, status) => {
    try {
      await HikkaApiComplete.addToWatchList(anime.slug, { status, episodes: count });
    } catch (error) {
      Logger.error("ViewEpisode", "API update failed", error);
    }
  };

  const configs = {
    [BUTTON_STATES.LOADING]: {
      text: "Завантаження...",
      data: info,
      function: () => {},
    },
    [BUTTON_STATES.NO_TRANSLATION]: {
      text: "Немає перекладу",
      data: info,
      function: () => {},
      style: { backgroundColor: theme?.primary },
    },
    [BUTTON_STATES.NO_EPISODES]: {
      text: "Серії недоступні",
      data: info,
      function: () => {},
    },
    [BUTTON_STATES.START_WATCHING]: {
      text: "Почати перегляд",
      data: { ...info, watched: { ...info?.watched, episodes: 1, status: WATCH_STATUS.WATCHING } },
      function: async () => {
        await updateWatchViaApi(1, WATCH_STATUS.WATCHING);
        navigateToPlayer(navigation, player, firstEpisode, episodesList, anime, dubbing);
      },
    },
    [BUTTON_STATES.CONTINUE_WATCHING]: {
      text: `Дивитись ${nextEpisodeIndex + 1} серію`,
      data: {
        ...info,
        watched: {
          ...info?.watched,
          episodes: nextEpisodeIndex + 1,
          status: nextEpisodeIndex + 1 >= totalEpisodes ? WATCH_STATUS.COMPLETED : WATCH_STATUS.WATCHING,
        },
      },
      function: async () => {
        const newCount = nextEpisodeIndex + 1;
        const newStatus = newCount >= totalEpisodes ? WATCH_STATUS.COMPLETED : WATCH_STATUS.WATCHING;
        await updateWatchViaApi(newCount, newStatus);
        navigateToPlayer(navigation, player, nextEpisode, episodesList, anime, dubbing);
      },
    },
    [BUTTON_STATES.EPISODE_NOT_RELEASED]: {
      text: `${episodesCount + 1} серія ще не вийшла`,
      data: info,
      function: () => {},
      style: { backgroundColor: theme?.Primary?.(0.5) },
    },
    [BUTTON_STATES.EPISODE_NOT_TRANSLATED]: {
      text: `Серія ${nextEpisodeIndex + 1} не перекладена`,
      data: info,
      function: () => {},
      style: { backgroundColor: theme?.Primary?.(0.5) },
    },
    [BUTTON_STATES.ADD_TO_FAVORITES]: {
      text: "Додати в обрані",
      data: { ...info, isFavorite: true },
      function: async () => {
        try {
          await HikkaApiComplete.addToFavorites("anime", anime.slug);
        } catch (error) {
          Logger.error("ViewEpisode", "Add to favorites failed", error);
        }
      },
    },
    [BUTTON_STATES.SHARE]: {
      text: "Поділитись",
      data: info,
      function: () => {},
    },
  };

  return configs[state] || configs[BUTTON_STATES.NO_TRANSLATION];
}

function createButtonConfig({
  state,
  watchData,
  episodes,
  anime,
  navigation,
  player,
  dubbing,
  episodesList,
  theme,
  onUpdateWatch,
  onAddToFavorites,
}) {
  const watchedCount = watchData?.episodes || 0;
  const nextEpisodeIndex = watchedCount;
  const nextEpisode = episodes?.[nextEpisodeIndex];
  const firstEpisode = episodes?.[0];
  const totalEpisodes = anime?.episodes_total;

  const configs = {
    [BUTTON_STATES.LOADING]: {
      text: "Завантаження...",
      onPress: () => {},
    },
    [BUTTON_STATES.NO_TRANSLATION]: {
      text: "Немає перекладу",
      onPress: () => {},
      style: { backgroundColor: theme?.primary },
    },
    [BUTTON_STATES.NO_EPISODES]: {
      text: "Серії недоступні",
      onPress: () => {},
    },
    [BUTTON_STATES.START_WATCHING]: {
      text: "Почати перегляд",
      onPress: async () => {
        await onUpdateWatch(1, WATCH_STATUS.WATCHING);
        navigateToPlayer(navigation, player, firstEpisode, episodesList, anime, dubbing);
      },
    },
    [BUTTON_STATES.CONTINUE_WATCHING]: {
      text: `Дивитись ${nextEpisodeIndex + 1} серію`,
      onPress: async () => {
        const newCount = nextEpisodeIndex + 1;
        const isCompleted = newCount >= totalEpisodes;
        await onUpdateWatch(newCount, isCompleted ? WATCH_STATUS.COMPLETED : WATCH_STATUS.WATCHING);
        navigateToPlayer(navigation, player, nextEpisode, episodesList, anime, dubbing);
      },
    },
    [BUTTON_STATES.EPISODE_NOT_RELEASED]: {
      text: `${watchedCount + 1} серія ще не вийшла`,
      onPress: () => {},
      style: { backgroundColor: theme?.Primary?.(0.5) },
    },
    [BUTTON_STATES.EPISODE_NOT_TRANSLATED]: {
      text: `Серія ${nextEpisodeIndex + 1} не перекладена`,
      onPress: () => {},
      style: { backgroundColor: theme?.Primary?.(0.5) },
    },
    [BUTTON_STATES.ADD_TO_FAVORITES]: {
      text: "Додати в обрані",
      onPress: onAddToFavorites,
    },
    [BUTTON_STATES.SHARE]: {
      text: "Поділитись",
      onPress: () => {},
    },
  };

  return configs[state] || configs[BUTTON_STATES.NO_TRANSLATION];
}

export function ForwardButton({
  navigation,
  anime,
  errorCode,
  episodesList,
  style,
  disabled = false,
  data,
  onDataChange,
  ...props
}) {
  const themeColors = useThemeColors();
  const [buttonData, setButtonData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const player = data?.watched?.player;
  const dubbing = data?.watched?.dubbing;

  const displayState = useMemo(() => {
    if (Number(errorCode) >= 400) return "error";
    if (!player || !dubbing) return "loading";
    if (!episodesList || episodesList?.length === 0) return "loading";
    return "ready";
  }, [errorCode, player, dubbing, episodesList]);

  const updateWatchProgress = useCallback(
    async (episodesCount, status) => {
      if (!anime?.slug || isUpdating) return;

      setIsUpdating(true);
      try {
        Logger.debug("ForwardButton", "Оновлення прогресу через API", {
          slug: anime.slug,
          episodes: episodesCount,
          status,
        });

        await HikkaApiComplete.addToWatchList(anime.slug, {
          status,
          episodes: episodesCount,
        });

        const newData = {
          ...data,
          watched: { ...data?.watched, episodes: episodesCount, status },
        };
        onDataChange?.(newData);

        Logger.debug("ForwardButton", "Прогрес оновлено через API");
      } catch (error) {
        Logger.error("ForwardButton", "Помилка оновлення прогресу", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [anime?.slug, data, onDataChange, isUpdating]
  );

  const addToFavorites = useCallback(async () => {
    if (!anime?.slug || isUpdating) return;

    setIsUpdating(true);
    try {
      Logger.debug("ForwardButton", "Додавання в обрані через API", { slug: anime.slug });

      await HikkaApiComplete.addToFavorites("anime", anime.slug);

      const newData = {
        ...data,
        watched: { ...data?.watched, isFavorite: true },
        isFavorite: true,
      };
      onDataChange?.(newData);

      Logger.debug("ForwardButton", "Додано в обрані через API");
    } catch (error) {
      Logger.error("ForwardButton", "Помилка додавання в обрані", error);
    } finally {
      setIsUpdating(false);
    }
  }, [anime?.slug, data, onDataChange, isUpdating]);

  useEffect(() => {
    if (displayState !== "ready") return;

    try {
      const episodes = getEpisodeData(episodesList, player, dubbing);

      if (!episodes) {
        setButtonData({
          text: "Немає перекладу",
          style: { backgroundColor: themeColors?.primary },
          onPress: () => {},
        });
        return;
      }

      const watchedEpisodes = data?.watched?.episodes;
      const episodesCount =
        typeof watchedEpisodes === "number"
          ? watchedEpisodes
          : Array.isArray(watchedEpisodes)
            ? Math.max(0, ...watchedEpisodes)
            : 0;

      const watchData = {
        episodes: episodesCount,
        status: data?.watched?.status,
        isFavorite: data?.watched?.isFavorite || data?.isFavorite,
      };

      const state = determineButtonState({ watchData, episodes, anime });

      Logger.debug("ForwardButton", `State: ${state}`, {
        watchedCount: episodesCount,
        availableEpisodes: episodes.length,
        releasedEpisodes: anime?.episodes_released,
      });

      const config = createButtonConfig({
        state,
        watchData,
        episodes,
        anime,
        navigation,
        player,
        dubbing,
        episodesList,
        theme: themeColors,
        onUpdateWatch: updateWatchProgress,
        onAddToFavorites: addToFavorites,
      });

      setButtonData({
        text: config.text,
        style: config.style,
        onPress: config.onPress,
      });
    } catch (error) {
      Logger.error("ForwardButton", "Error in ForwardButton", error);
    }
  }, [
    data,
    episodesList,
    displayState,
    themeColors,
    player,
    dubbing,
    anime,
    navigation,
    updateWatchProgress,
    addToFavorites,
  ]);

  const baseButtonStyle = [style, styles.button];

  const disabledStyle = {
    backgroundColor: themeColors?.Primary?.(0.5) || themeColors?.primary,
  };

  if (displayState === "loading" || isUpdating) {
    return (
      <TouchableOpacity
        style={[...baseButtonStyle, disabledStyle]}
        disabled
        activeOpacity={0.7}
        {...props}
      >
        <ActivityIndicator size={31} color={themeColors?.primary} />
      </TouchableOpacity>
    );
  }

  if (displayState === "error" || !buttonData) {
    return (
      <TouchableOpacity
        style={[...baseButtonStyle, disabledStyle]}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        <Text style={[H3, { color: themeColors?.text }]}>Немає перекладу</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[...baseButtonStyle, buttonData.style]}
      onPress={buttonData.onPress}
      disabled={disabled || isUpdating}
      activeOpacity={0.7}
      {...props}
    >
      <Icon.Play size={34} color={themeColors?.text} weight="fill" />
      <Text
        style={[
          H3,
          {
            color: themeColors?.text,
            paddingLeft: 15,
            fontSize: buttonData.text.length > 15 ? 18 : 20,
          },
        ]}
      >
        {buttonData.text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
