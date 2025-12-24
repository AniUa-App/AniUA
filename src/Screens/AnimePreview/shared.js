import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { useWindowDimensions } from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import AnimeStorage from "../../Storage/AnimeStorage";
import SettingsStorage from "../../Storage/SettingsStorage";
import AnimeHashStorage from "../../Storage/AnimeHashStorage";
import { HikkaApi } from "../../Sources/hikka";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import {
  getFullDubbersListOfQueues,
  sortDubbingsByPartnerStudios,
} from "../../Widgets/DubbingBottomSheetWidget";
import { DownloadVideo, STATUSES } from "../../Notifications/VideoDownloader";
import { useSnackbar } from "../../Widgets/useSnackbar";
import Logger from "../../Logger/Logger";
import RNFS from "react-native-fs";
import Clipboard from "@react-native-clipboard/clipboard";
import * as NavigationBar from "expo-navigation-bar";
import FileOpener from "../../Global/FileOpener";

// Utility function to get episode date or status
export function getEpisodeDateOrType(anime) {
  if (
    anime.schedule?.length > 0 &&
    anime.episodes_released > 0 &&
    anime.schedule[anime.episodes_released]?.airing_at
  ) {
    const timestamp = anime.schedule[anime.episodes_released].airing_at;
    const date = new Date(timestamp * 1000);
    return format(date, "d MMMM HH:mm", { locale: uk });
  } else if (anime.status === "finished") {
    return "Завершено";
  } else if (anime.status === "ongoing") {
    return "Онґоінг";
  } else {
    return anime.status;
  }
}

// Custom hook for all AnimePreview logic
export function useAnimePreview({ route, navigation }) {
  const { snackbar, showSnackbar } = useSnackbar();
  const isFocused = useIsFocused();
  const { width: winWidth, height: winHeight } = useWindowDimensions();

  // Get route params
  const { anime: initialAnime, downloadEpisode, slug } = route?.params || {};

  // State
  const [anime, setAnime] = useState(initialAnime || null);
  const [isLoading, setIsLoading] = useState(!initialAnime);
  const [existingFiles, setExistingFiles] = useState(new Set());
  const [animeList, setAnimeList] = useState([]);
  const [errorCode, setErrorCode] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [isConnection, setIsConnection] = useState(true);
  const [watchStatus, setWatchStatus] = useState(null);
  const [isFavoriteHikka, setIsFavoriteHikka] = useState(false);

  // Refs
  const dubbingSheetRef = useRef(null);
  const episodesSheetRef = useRef(null);
  const downloadEpisodeRef = useRef(null);
  const moreSheetRef = useRef(null);

  // Get info from storage
  const [info, setInfo_] = useState(() => {
    if (initialAnime?.slug) {
      return AnimeStorage.getInfoBySlug(initialAnime.slug);
    }
    if (slug) {
      return (
        AnimeStorage.getInfoBySlug(slug) || {
          watched: {
            player: "",
            dubbing: "",
            episodes: [],
          },
          isFavorite: false,
        }
      );
    }
    return null;
  });

  const setInfo = useCallback(
    (newInfo) => {
      if (!anime?.slug) return;
      setInfo_(newInfo);
      AnimeStorage.setInfoBySlug(anime.slug, newInfo);
    },
    [anime?.slug]
  );

  // Ref for current info
  const infoRef = useRef(info);
  useEffect(() => {
    infoRef.current = info;
  }, [info]);

  // Fetch anime by slug (for deep linking)
  useEffect(() => {
    const fetchAnimeBySlug = async () => {
      if (slug && !initialAnime) {
        setIsLoading(true);
        try {
          const animeData = await HikkaApi.getAnimeDetails(slug);
          if (animeData) {
            setAnime(animeData);
            const animeInfo = AnimeStorage.getInfoBySlug(slug) || {
              watched: {
                player: "",
                dubbing: "",
                episodes: [],
              },
              isFavorite: false,
            };
            setInfo_(animeInfo);
          }
        } catch (error) {
          Logger.error("Error fetching anime by slug:", error);
          const code = error?.response?.status || error?.code || 404;
          const message = error?.message || "Not Found";
          navigation.navigate("HiddenStack", {
            screen: "InvalidLink",
            params: { slug, code, message },
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnimeBySlug();
  }, [slug, initialAnime, navigation]);

  // Check downloaded files
  useEffect(() => {
    const checkDownloadedFiles = async () => {
      if (
        !info?.downloaded?.episodes ||
        info.downloaded.episodes.length === 0
      ) {
        setExistingFiles(new Set());
        return;
      }

      const existing = new Set();
      for (const episode of info.downloaded.episodes) {
        if (episode.video_path && typeof episode.video_path === "string") {
          try {
            const exists = await RNFS.exists(episode.video_path);
            if (exists) {
              existing.add(episode.episode);
            }
          } catch (error) {
            Logger.error("Error checking file:", episode.video_path, error);
          }
        }
      }
      setExistingFiles(existing);
    };

    checkDownloadedFiles();
  }, [info?.downloaded?.episodes]);

  // Open download sheet if needed
  useEffect(() => {
    if (downloadEpisode) {
      const timer = setTimeout(() => {
        if (downloadEpisodeRef.current) {
          downloadEpisodeRef.current.present();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [downloadEpisode]);

  // Update info on focus
  useFocusEffect(
    useCallback(() => {
      if (!anime?.slug) return;
      const updatedInfo = AnimeStorage.getInfoBySlug(anime.slug);
      setInfo_((prevInfo) => {
        if (JSON.stringify(prevInfo) !== JSON.stringify(updatedInfo)) {
          return updatedInfo;
        }
        return prevInfo;
      });
    }, [anime?.slug])
  );

  // Fetch all data
  useLayoutEffect(() => {
    if (!anime?.slug) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const fetchDetailsIfNeeded = async () => {
          if (AnimeHashStorage.isHash(anime.slug) && isConnection) {
            setAnime(AnimeHashStorage.getHashBySlug(anime.slug));
            return;
          }
          if (!anime.synopsis_ua) {
            try {
              const details = await HikkaApi.getAnimeDetails(anime.slug);
              if (isMounted) {
                setAnime((prevAnime) => ({ ...prevAnime, ...details }));
                AnimeHashStorage.addHash(anime.slug, {
                  ...anime,
                  ...details,
                });
              }
            } catch (error) {
              Logger.error("Error fetching anime details:", error);
            }
          }
          return null;
        };

        const fetchFranchise = async () => {
          try {
            const data = await HikkaApi.getAnimeFranchiseByFilter(anime.slug);
            if (isMounted) {
              setAnimeList(Array.isArray(data) ? data : []);
            }
          } catch (error) {
            Logger.error(
              `Помилка при завантаженні франшизи для ${anime.slug}:`,
              error?.message || String(error)
            );
            if (isMounted) setAnimeList([]);
          }
        };

        const fetchWatchStatus = async () => {
          if (HikkaAuthService.isAuthenticated()) {
            try {
              const watchEntry = await HikkaApiComplete.getWatchEntry(
                anime.slug
              );
              if (watchEntry && watchEntry.status && isMounted) {
                setWatchStatus(watchEntry.status);
              }
            } catch (error) {
              Logger.debug("AnimePreview", "Статус не знайдено в Hikka", error);
            }

            try {
              const favoriteStatus = await HikkaApiComplete.getFavoriteStatus(
                "anime",
                anime.slug
              );
              if (isMounted && favoriteStatus == 200) {
                setIsFavoriteHikka(true);
              }
            } catch (error) {
              Logger.debug(
                "AnimePreview",
                "Улюблене не знайдено в Hikka",
                error
              );
            }
          }
        };

        const fetchEpisodesAndDubbings = async () => {
          if (
            (anime.episodes_total !== null && anime.episodes_total !== 0) ||
            (anime.episodes_released !== null && anime.episodes_released !== 0)
          ) {
            try {
              let currentInfo = infoRef.current;

              const result = await HikkaApi.getEpisodes(anime.slug);

              if (!isMounted) return;

              if (result.error) {
                Logger.error("API Error:", result.error);
                setErrorCode(result.code || 500);
                setEpisodesList([]);
                return;
              }

              const { data, code } = result;

              if (code >= 400) {
                Logger.error("API Error Code:", code);
                setErrorCode(code);
                setEpisodesList([]);
                return;
              }
              if (data["vidking"]) {
                delete data["vidking"];
              }
              if (data["Main"]) {
                delete data["Main"];
              }

              data["Вбудований плеєр"] = getFullDubbersListOfQueues(data);

              // Sort dubbings
              const sortedData = {};
              for (const [player, dubbings] of Object.entries(data)) {
                if (
                  typeof dubbings === "object" &&
                  dubbings !== null &&
                  !Array.isArray(dubbings)
                ) {
                  const sortedDubbingItems = sortDubbingsByPartnerStudios(
                    Object.keys(dubbings)
                  );
                  const sortedDubbings = {};
                  sortedDubbingItems.forEach((item) => {
                    sortedDubbings[item.name] = dubbings[item.name];
                  });
                  sortedData[player] = sortedDubbings;
                } else {
                  sortedData[player] = dubbings;
                }
              }

              let infoNeedsUpdate = false;
              let newInfo = { ...currentInfo };

              if (!newInfo.watched?.player || !newInfo.watched?.dubbing) {
                let selectedPlayer = null;
                const defaultPlayerFromSettings =
                  SettingsStorage.getParameter("defaultPlayer");

                if (
                  defaultPlayerFromSettings &&
                  sortedData[defaultPlayerFromSettings] &&
                  typeof sortedData[defaultPlayerFromSettings] === "object" &&
                  Object.keys(sortedData[defaultPlayerFromSettings]).length > 0
                ) {
                  selectedPlayer = defaultPlayerFromSettings;
                } else {
                  for (const [key, value] of Object.entries(sortedData)) {
                    if (
                      key !== "type" &&
                      key !== "0" &&
                      typeof value === "object" &&
                      value !== null &&
                      Object.keys(value).length > 0
                    ) {
                      selectedPlayer = key;
                      break;
                    }
                  }
                }

                if (selectedPlayer) {
                  const dubbings = sortedData[selectedPlayer];
                  const dubbingKeys = Object.keys(dubbings);

                  newInfo.watched = {
                    ...newInfo.watched,
                    player: selectedPlayer,
                    dubbing: dubbingKeys[0],
                    episodes: newInfo.watched?.episodes || [],
                  };
                  infoNeedsUpdate = true;
                }
              }

              setEpisodesList(sortedData || []);

              if (infoNeedsUpdate) {
                setInfo(newInfo);
              }
            } catch (error) {
              Logger.error("Помилка завантаження епізодів:", error);
              if (isMounted) {
                setEpisodesList([]);
                setErrorCode(500);
              }
            }
          } else {
            if (isMounted) setEpisodesList([]);
          }
        };

        await Promise.all([
          fetchDetailsIfNeeded(),
          fetchFranchise(),
          fetchEpisodesAndDubbings(),
          fetchWatchStatus(),
        ]);
      } catch (error) {
        Logger.error("Error fetching data in parallel:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    anime?.slug,
    anime?.synopsis_ua,
    anime?.episodes_total,
    anime?.episodes_released,
    setInfo,
    isConnection,
  ]);

  // Handlers
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!anime?.slug) return;

      if (!HikkaAuthService.isAuthenticated()) {
        showSnackbar("Увійдіть в акаунт Hikka для зміни статусу");
        return;
      }

      try {
        Logger.debug("setWatchStatus", "Change anime status", newStatus);
        if (newStatus === null) {
          await HikkaApiComplete.removeFromWatchList(anime.slug);
          setWatchStatus(null);
        } else {
          await HikkaApiComplete.addToWatchList(anime.slug, {
            status: newStatus,
          });
          setWatchStatus(newStatus);
        }
      } catch (error) {
        Logger.error("AnimePreview", "Помилка синхронізації статусу", error);
        showSnackbar("Помилка синхронізації з Hikka");
      }
    },
    [anime?.slug, showSnackbar]
  );

  const handleFavoriteToggle = useCallback(async () => {
    if (!anime?.slug) return;

    if (HikkaAuthService.isAuthenticated()) {
      try {
        if (isFavoriteHikka) {
          await HikkaApiComplete.removeFromFavorites("anime", anime.slug);
          setIsFavoriteHikka(false);
          showSnackbar("Видалено з улюблених");
        } else {
          await HikkaApiComplete.addToFavorites("anime", anime.slug);
          setIsFavoriteHikka(true);
        }
      } catch (error) {
        Logger.error("AnimePreview", "Помилка зміни улюбленого", error);
        showSnackbar("Помилка синхронізації з Hikka");
      }
    } else {
      const newIsFavorite = !(info?.isFavorite || false);
      AnimeStorage.setInfoBySlug(anime.slug, {
        ...info,
        isFavorite: newIsFavorite,
        watched: info?.watched || { player: "", dubbing: "" },
      });
      setInfo(AnimeStorage.getInfoBySlug(anime.slug));
      showSnackbar(
        newIsFavorite ? "Додано до улюблених" : "Видалено з улюблених"
      );
    }
  }, [anime?.slug, isFavoriteHikka, info, setInfo, showSnackbar]);

  const handleEpisodeSelect = useCallback(
    (item) => {
      const watched_episodes = !info.watched.episodes.includes(item.episode)
        ? [...info.watched.episodes, item.episode]
        : info.watched.episodes;
      setInfo({
        ...info,
        watched: { ...info.watched, episodes: watched_episodes },
      });

      NavigationBar.setVisibilityAsync("hidden");
      episodesSheetRef.current?.close();

      if (info.watched.player === "Вбудований плеєр") {
        navigation.navigate("HiddenStack", {
          screen: "LocalVideoPlayer",
          params: {
            _episodes:
              episodesList[info.watched.player][info.watched.dubbing],
            _currentEpisode: item,
            _anime: anime,
          },
        });
      } else {
        navigation.navigate("HiddenStack", {
          screen: "WebVideoPlayer",
          params: {
            videoUrl: item?.video_url,
            title: `${anime?.title_ua || anime?.title_en || anime?.title_ja} - ${item?.episode} серія`,
          },
        });
      }
    },
    [info, setInfo, episodesList, anime, navigation]
  );

  const handleEpisodeLongSelect = useCallback(
    (item) => {
      const episodes = info.watched.episodes.includes(item.episode)
        ? info.watched.episodes.filter((ep) => ep !== item.episode)
        : [...info.watched.episodes, item.episode];
      const newInfo = {
        ...info,
        watched: { ...info.watched, episodes },
      };
      setInfo(newInfo);
    },
    [info, setInfo]
  );

  const handleEpisodeSwipe = useCallback(
    (item) => {
      episodesSheetRef.current?.close();
      Clipboard.setString(item?.video_url);
      showSnackbar("Посилання на епізод скопійоване в буфер обміну");
    },
    [showSnackbar]
  );

  const handleDownloadEpisode = useCallback(
    async (item) => {
      try {
        const episode = info.downloaded?.episodes?.find(
          (ep) => ep.episode === item.episode
        );

        if (
          episode &&
          episode.video_path &&
          (await RNFS.exists(episode.video_path))
        ) {
          try {
            await FileOpener.openFile(episode.video_path, "video/*");
          } catch (error) {
            Logger.error("Помилка при відкритті файлу:", error);
          }
        } else {
          if (episode) {
            setInfo({
              ...info,
              downloaded: {
                ...info.downloaded,
                episodes: info.downloaded.episodes.filter(
                  (ep) => ep.episode !== item.episode
                ),
              },
            });
          }

          await DownloadVideo({
            item: item,
            anime: anime,
            info: info,
            onStartDownloadCallback: () => {
              showSnackbar(`Розпочато завантаження епізоду ${item.episode}`, {
                duration: 1000,
              });
            },
            progressCallback: () => {},
            completionCallback: (updatedInfo) => {
              setInfo(updatedInfo);
              showSnackbar(`Завантаження епізоду ${item.episode} завершено`, {
                duration: 5000,
                actionLabel: "Відкрити",
                onActionPress: async () => {
                  const downloadedEpisode = updatedInfo.downloaded.episodes.find(
                    (ep) => ep.episode === item.episode
                  );
                  if (downloadedEpisode) {
                    try {
                      await FileOpener.openFile(
                        downloadedEpisode.video_path,
                        "video/*"
                      );
                    } catch (error) {
                      Logger.error("Помилка при відкритті файлу:", error);
                    }
                  }
                },
              });
            },
            errorCallback: (error, item) => {
              Logger.error("errorCallback", error, item);
              showSnackbar(
                `Помилка при завантаженні епізоду: ${STATUSES[error] || error}`,
                {
                  actionLabel: "Копіювати",
                  onActionPress: () => {
                    Clipboard.setString(
                      `Помилка при завантаженні епізоду: ${error.message || error}`
                    );
                  },
                  duration: 8000,
                }
              );
            },
          });
        }
      } catch (err) {
        Logger.error("Помилка при обробці епізоду:", err);
      }
    },
    [info, setInfo, anime, showSnackbar]
  );

  const renderSimilarAnime = useCallback(
    ({ item }) => {
      if (
        !item?.slug ||
        !initialAnime?.slug ||
        item.slug === initialAnime.slug
      ) {
        return null;
      }
      return { item, navigation, winWidth, winHeight };
    },
    [navigation, initialAnime?.slug, winWidth, winHeight]
  );

  const keyExtractorSimilar = useCallback((item) => item?.slug || "", []);

  return {
    // State
    anime,
    isLoading,
    existingFiles,
    animeList,
    errorCode,
    episodesList,
    isConnection,
    setIsConnection,
    watchStatus,
    isFavoriteHikka,
    info,
    setInfo,
    isFocused,
    winWidth,
    winHeight,
    initialAnime,
    slug,
    snackbar,
    showSnackbar,

    // Refs
    dubbingSheetRef,
    episodesSheetRef,
    downloadEpisodeRef,
    moreSheetRef,

    // Handlers
    handleStatusChange,
    handleFavoriteToggle,
    handleEpisodeSelect,
    handleEpisodeLongSelect,
    handleEpisodeSwipe,
    handleDownloadEpisode,
    renderSimilarAnime,
    keyExtractorSimilar,

    // Navigation
    navigation,
  };
}

// Export memoized bottom sheets
export { default as DubbingBottomSheet } from "../../Widgets/DubbingBottomSheetWidget";
export { default as EpisodesBottomSheet } from "../../Widgets/EpisodesBottomSheetWidget";
export { default as MoreBottomSheet } from "../../Widgets/MoreBottomSheetWidget";
