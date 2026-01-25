import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
// import SystemNavigationBar from "react-native-system-navigation-bar";
import { BackHandler } from "react-native";
// import { StatusBar } from "react-native";
import { StatusBar } from "react-native";
import { AppState } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";
// import Orientation from "react-native-orientation-locker";
import * as EOrientation from "expo-screen-orientation";
import { useKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";
import Icons from "../Styles/Icons";
import { H4, H5, H6 } from "../Styles/Fonts";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity as CustomTouchableOpacity } from "../Widgets/Button";
import {
  useVideoPlayer,
  VideoView,
  isPictureInPictureSupported,
} from "expo-video";
import axios from "axios";
import M3U8FileParser from "m3u8-file-parser";
import SpeedBottomSheet from "../Widgets/VideoPlayer/SpeedBottomSheetWidget";
import VolumeWidget from "../Widgets/VideoPlayer/VolumeWidget";
import QualityWidget from "../Widgets/VideoPlayer/QualityWidget";
import AnimeStorage from "../Storage/AnimeStorage";
import RNFS from "react-native-fs";
import FileOpener from "react-native-file-opener";
import { DownloadVideo } from "../Notifications/VideoDownloader";
import Toast from "react-native-root-toast";
import { useThemeColors } from "../Global/useTheme";
import Logger from "../Logger/Logger";
import { setupNavigationBar } from "../../App";
import { EpisodeItem } from "../Components/BottomSheetEpisodes/EpisodeItem";
import { EventBus } from "../Global/EventBus";

const { width, height } = Dimensions.get("window");

// Функція для визначення чи це планшет
const isTablet = () => {
  const minDimension = Math.min(width, height);
  return minDimension >= 600; // Планшети зазвичай мають мінімальний розмір >= 600
};

export default function LocalVideoPlayerV2Screen({ route }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  useKeepAwake();

  const { _episodes, _currentEpisode, _anime } = route.params;
  const title = _anime?.title_ua || _anime?.title_en || "Назва аніме";
  // const episodes = _episodes || [];

  const [episodeInfo, setEpisodeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(_episodes || []);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState(_currentEpisode);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quality, setQuality] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const qualitiesList = React.useMemo(() => {
    if (!episodeInfo?.qualitys) return [];
    return Object.keys(episodeInfo.qualitys).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  }, [episodeInfo]);
  const [isLocked, setIsLocked] = useState(false);
  const [info, _setInfo] = useState(AnimeStorage.get(_anime.slug));
  const [seekIndicator, setSeekIndicator] = useState({
    visible: false,
    direction: null,
    value: 0,
  });
  const seekTimeout = useRef(null);
  const videoViewRef = useRef(null);
  const qualitySheetRef = useRef(null);
  const latestPlayerRef = useRef(null);
  const volumeApplyTimeoutRef = useRef(null);
  const pendingVolumeRef = useRef(null);
  const lastTapRef = useRef(null);
  const singleTapTimeoutRef = useRef(null);
  const accumulatedSeekRef = useRef(0);
  const seekDebounceRef = useRef(null);
  const lastTapSideRef = useRef(null);
  const isLoadingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const lastTimeUpdateRef = useRef(0);
  const timeUpdateCountRef = useRef(0);

  const [volumeTooltipVisible, setVolumeTooltipVisible] = useState(false);

  // Анімаційні значення
  const loadingRotation = useSharedValue(0);
  const loadingScale = useSharedValue(1);

  // Флаг монтування, щоб не викликати нативні методи після анмаунту/під час ротації
  const isMountedRef = useRef(true);

  // Функція для отримання повної тривалості відео
  const getDuration = () => {
    if (player) {
      return player.duration || duration;
    }
    return duration;
  };

  const setInfo = (newInfo) => {
    _setInfo(newInfo);
    AnimeStorage.set(_anime.slug, newInfo);
  };

  // Хелпер для встановлення стану завантаження
  const setLoadingState = (loading) => {
    isLoadingRef.current = loading;
    setIsLoading(loading);
  };

  // Анімований стиль для індикатора завантаження
  const animatedLoadingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${loadingRotation.value}deg`,
        },
        {
          scale: loadingScale.value,
        },
      ],
    };
  });

  // Removed animation values for optimization

  // Посилання на bottom sheet швидкості
  const speedSheetRef = useRef(null);

  // Таймер для приховування елементів керування
  const hideControlsTimerRef = useRef(null);

  // Допоміжні функції
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Анімація індикатора завантаження
  useEffect(() => {
    if (isLoading) {
      // Spinning анімація
      loadingRotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      // Pulsing анімація
      loadingScale.value = withRepeat(
        withTiming(1.2, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      loadingRotation.value = 0;
      loadingScale.value = 1;
    }
  }, [isLoading]);

  // Оновлюємо список епізодів, коли змінюються пропси
  useEffect(() => {
    setEpisodes(_episodes || []);
  }, [_episodes]);

  // Слухаємо прогрес завантаження через EventBus
  useEffect(() => {
    const handleDownloadProgress = (data) => {
      if (data.slug !== _anime.slug) return;
      if (data.episode !== currentEpisode?.episode) return;

      if (data.status === "success") {
        setIsDownloading(false);
        setDownloadProgress(100);
        // Оновлюємо info
        const updatedInfo = AnimeStorage.get(_anime.slug);
        _setInfo(updatedInfo);
      } else if (data.status === "error") {
        setIsDownloading(false);
        setDownloadProgress(0);
      } else {
        // Якщо отримали прогрес - значить завантаження активне
        if (!isDownloading) {
          setIsDownloading(true);
        }
        setDownloadProgress(data.progress || 0);
      }
    };

    EventBus.on("downloadProgress", handleDownloadProgress);

    return () => {
      EventBus.off("downloadProgress", handleDownloadProgress);
    };
  }, [_anime.slug, currentEpisode?.episode, isDownloading]);

  // Оновлення відео при зміні поточного епізоду
  useEffect(() => {
    if (!currentEpisode?.video_url) return;
    const updateEpisode = async () => {
      try {
        lastSeekTimeRef.current = Date.now();
        timeUpdateCountRef.current = 0;
        lastTimeUpdateRef.current = 0;
        isLoadingRef.current = true;
        setIsLoading(true);
        const episodeInfo = await getEpisodeInfo(currentEpisode.video_url);
        setEpisodeInfo(episodeInfo);
        const available = Object.keys(episodeInfo?.qualitys || {});
        const defaultQ = episodeInfo?.defaultQuality;
        const chosenKey =
          defaultQ && episodeInfo.qualitys[defaultQ] ? defaultQ : available[0];
        setQuality(chosenKey || null);
        setCurrentUrl(chosenKey ? episodeInfo.qualitys[chosenKey] : null);
      } catch (e) {
        Logger.error("LocalVideoPlayer", "Не вдалося отримати дані епізоду", e);
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    };
    updateEpisode();
  }, [currentEpisode]);

  const player = useVideoPlayer(currentUrl, (player) => {
    player.play();
    player.preservesPitch = true;
    player.timeUpdateEventInterval = 0.5;
    player.startsPictureInPictureAutomatically = true;
    // Колбек плеєра
    if (player) {
      player.addListener("statusChange", ({ status }) => {
        if (status === "readyToPlay") {
          setDuration(player.duration);
          // Зачекаємо трохи перед скиданням, щоб індикатор був видимим
          setTimeout(() => {
            isLoadingRef.current = false;
            setIsLoading(false);
          }, 300);
        } else if (status === "loading") {
          // Показуємо індикатор коли відео буферизується
          isLoadingRef.current = true;
          setIsLoading(true);
        }
      });

      player.addListener("playingChange", ({ isPlaying: playing, reason }) => {
        setIsPlaying(playing);

        // Якщо відтворення зупинилось через буферизацію
        if (!playing && reason === "waitingToPlayAtSpecifiedRate") {
          isLoadingRef.current = true;
          setIsLoading(true);
        } else if (playing && isLoadingRef.current) {
          // Якщо відтворення відновилось після буферизації
          setTimeout(() => {
            isLoadingRef.current = false;
            setIsLoading(false);
          }, 300);
        }
      });

      player.addListener("timeUpdate", (event) => {
        const currentPlayerTime = player.currentTime;
        setCurrentTime(currentPlayerTime);

        // Перевіряємо чи відео "зависло" (буферизується)
        if (player.playing) {
          const timeDiff = Math.abs(
            currentPlayerTime - lastTimeUpdateRef.current
          );

          if (timeDiff < 0.1) {
            // Час не змінюється, хоча має відтворюватися
            timeUpdateCountRef.current += 1;
            if (timeUpdateCountRef.current >= 4 && !isLoadingRef.current) {
              // Відео зависло на 2+ секунди (4 * 0.5s)
              isLoadingRef.current = true;
              setIsLoading(true);
            }
          } else {
            // Час змінюється - відео нормально відтворюється
            timeUpdateCountRef.current = 0;
            if (isLoadingRef.current) {
              const timeSinceSeek = Date.now() - lastSeekTimeRef.current;
              if (timeSinceSeek > 200) {
                isLoadingRef.current = false;
                setIsLoading(false);
              }
            }
          }

          lastTimeUpdateRef.current = currentPlayerTime;
        } else {
          // Якщо пауза, скидаємо лічильник
          timeUpdateCountRef.current = 0;
        }

        // Скидаємо завантаження тільки якщо відео почало відтворюватися після seek
        if (isLoadingRef.current) {
          const timeSinceSeek = Date.now() - lastSeekTimeRef.current;
          // Якщо минуло >200мс після seek і відео відтворюється
          if (
            timeSinceSeek > 200 &&
            player.playing &&
            timeUpdateCountRef.current === 0
          ) {
            isLoadingRef.current = false;
            setIsLoading(false);
          }
        }
      });

      player.addListener("ended", () => {
        // Автоматичне відтворення наступного епізоду
        const currentIndex = episodes.findIndex(
          (ep) => ep.episode === currentEpisode.episode
        );
        if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
          setCurrentEpisode(episodes[currentIndex + 1]);
        }
      });

      player.addListener("error", (error) => {
        Logger.error("LocalVideoPlayer", "Video error", error);
        isLoadingRef.current = true;
        setIsLoading(true);
      });
    }
  });

  // Тримати актуальне посилання на плеєр для простого доступу в таймаутах
  useEffect(() => {
    latestPlayerRef.current = player;
  }, [player]);

  // Відновлення швидкості відтворення при зміні плеєра
  useEffect(() => {
    if (player && rate !== 1.0) {
      player.playbackRate = rate;
    }
  }, [player]);

  // Функції керування
  const togglePlayPause = useCallback(() => {
    if (player) {
      const willPlay = !player.playing;
      // Оновлюємо стейт негайно для миттєвого відгуку UI
      setIsPlaying(willPlay);

      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      if (showControls) {
        startHideControlsTimer();
      }
    }
  }, [player, showControls]);

  const seekTo = (seconds) => {
    if (player && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      setCurrentTime(newTime);
      lastSeekTimeRef.current = Date.now();
      timeUpdateCountRef.current = 0;
      isLoadingRef.current = true;
      setIsLoading(true);
      player.currentTime = newTime;

      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const seekToTime = (time) => {
    if (player && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(newTime);
      lastSeekTimeRef.current = Date.now();
      timeUpdateCountRef.current = 0;
      isLoadingRef.current = true;
      setIsLoading(true);
      player.currentTime = newTime;
      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const toggleVolume = () => {
    // залишаємо як mute/unmute якщо знадобиться викликати десь ще
    const newVolume = volume > 0 ? 0 : 1.0;
    setVolume(newVolume);
    if (player) {
      player.volume = newVolume;
    }
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const handleVolumeChange = (newValue) => {
    pendingVolumeRef.current = newValue;
    if (!volumeApplyTimeoutRef.current) {
      volumeApplyTimeoutRef.current = setTimeout(() => {
        const valueToApply = pendingVolumeRef.current ?? newValue;
        setVolume(valueToApply);
        if (player) {
          player.volume = valueToApply;
        }
        volumeApplyTimeoutRef.current = null;
      }, 60);
    }
  };

  const openSpeedBottomSheet = () => {
    speedSheetRef.current?.present();
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const changePlaybackRate = (newRate) => {
    setRate(newRate);
    if (player) {
      player.playbackRate = newRate;
    }
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const setWatchedEpisode = (slug, episode) => {
    const info = AnimeStorage.get(slug);
    info.watched_episodes = [
      ...(info?.watched_episodes || []),
      episode.episode,
    ];
    AnimeStorage.set(slug, info);
  };

  useEffect(() => {
    const onBackPress = () => {
      Logger.debug("LocalVideoPlayer", "onBackPress");
      deactivateKeepAwake();
      navigation.goBack();
      // StatusBar.setHidden(false);
      StatusBar.setHidden(false, "slide");
      SystemNavigationBar.navigationShow();
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      if (isTablet()) {
        EOrientation.unlockAsync(); // На планшетах дозволяємо будь-яку орієнтацію
      } else {
        EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP); // На телефонах блокуємо портретну
      }
      setupNavigationBar();
      SystemNavigationBar.fullScreen(false);
      SystemNavigationBar.navigationShow();
      return true;
    };

    const onOrientationChange = (orientation) => {
      Logger.debug("LocalVideoPlayer", "Orientation changed", { orientation });
      if (
        orientation === "LANDSCAPE-LEFT" ||
        orientation === "LANDSCAPE-RIGHT"
      ) {
        // SystemNavigationBar.fullScreen(true);
        SystemNavigationBar.navigationHide();
        setIsLandscape(true);
      } else {
        // SystemNavigationBar.fullScreen(false);
        SystemNavigationBar.navigationShow();
        setIsLandscape(false);
      }
      Logger.debug("LocalVideoPlayer", "isLandscape", { isLandscape });
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // Спершу розблокуємо орієнтацію, щоб події надходили
    // Orientation.unlockAllOrientations();
    EOrientation.unlockAsync();
    const orientationSubscription = EOrientation.addOrientationChangeListener(
      ({ orientationInfo }) => {
        if (!isMountedRef.current) return;
        const applyChanges = () => {
          try {
            if (
              orientationInfo.orientation ===
                EOrientation.Orientation.LANDSCAPE_LEFT ||
              orientationInfo.orientation ===
                EOrientation.Orientation.LANDSCAPE_RIGHT
            ) {
              try {
                SystemNavigationBar.fullScreen(true);
                SystemNavigationBar.navigationHide();
              } catch (e) {
                Logger.warn(
                  "LocalVideoPlayer",
                  "SystemNavigationBar landscape error",
                  e
                );
              }
              setIsLandscape(true);
            } else {
              try {
                SystemNavigationBar.fullScreen(false);
                SystemNavigationBar.navigationShow();
              } catch (e) {
                Logger.warn(
                  "LocalVideoPlayer",
                  "SystemNavigationBar portrait error",
                  e
                );
              }
              setIsLandscape(false);
            }
          } catch (e) {
            Logger.warn(
              "LocalVideoPlayer",
              "Orientation applyChanges error",
              e
            );
          }
        };
        // Дебаунсимо зміни, щоб не торкатись UIManager під час ре-ініціалізації
        if (typeof requestAnimationFrame === "function") {
          requestAnimationFrame(applyChanges);
        } else {
          setTimeout(applyChanges, 0);
        }
      }
    );

    // StatusBar.setHidden(true);
    StatusBar.setHidden(true, "slide");
    SystemNavigationBar.navigationHide();

    // Orientation.getOrientation(onOrientationChange);

    // Вже розблоковано вище

    setShowControls(true);
    startHideControlsTimer();

    return () => {
      isMountedRef.current = false;
      backHandlerSubscription.remove();
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      if (seekTimeout.current) {
        clearTimeout(seekTimeout.current);
      }
      if (volumeApplyTimeoutRef.current) {
        clearTimeout(volumeApplyTimeoutRef.current);
      }
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
      }
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }
      // Orientation.removeOrientationListener(onOrientationChange);
      EOrientation.removeOrientationChangeListener(orientationSubscription);
      try {
        StatusBar.setHidden(false, "slide");
      } catch (e) {
        Logger.warn("LocalVideoPlayer", "StatusBar show error", e);
      }
      try {
        SystemNavigationBar.navigationShow();
      } catch (e) {
        Logger.warn("LocalVideoPlayer", "SystemNavigationBar show error", e);
      }
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      if (isTablet()) {
        EOrientation.unlockAsync(); // На планшетах дозволяємо будь-яку орієнтацію
      } else {
        EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP); // На телефонах блокуємо портретну
      }
    };
  }, []);

  // Show controls when orientation changes to landscape
  useEffect(() => {
    if (isLandscape) {
      setShowControls(true);
      startHideControlsTimer();
    }
  }, [isLandscape]);

  // Автовхід у PiP при згортанні застосунку
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "background" || nextState === "inactive") {
          try {
            const isPlaying =
              !!player && (player.playing || player.currentTime > 0);
            if (
              isPlaying &&
              isPictureInPictureSupported() &&
              videoViewRef.current
            ) {
              await videoViewRef.current.startPictureInPicture();
            }
          } catch (error) {
            Logger.warn(
              "LocalVideoPlayer",
              "Не вдалося запустити PiP автоматично",
              error
            );
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [player]);

  const showControlsWithAnimation = () => {
    setShowControls(true);
    startHideControlsTimer();
  };

  const hideControls = () => {
    setShowControls(false);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = null;
    }
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsWithAnimation();
    }
  };

  const handleVideoAreaPress = (event) => {
    const now = Date.now();
    const last = lastTapRef.current || 0;
    const isDoubleTap = now - last < 280;
    lastTapRef.current = now;

    const tapX = event?.nativeEvent?.locationX ?? width / 2;
    const isRightSide = tapX > width / 2;
    const currentSide = isRightSide ? "right" : "left";

    if (isDoubleTap) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }

      // Якщо змінилась сторона - скидаємо накопичення
      if (
        lastTapSideRef.current !== null &&
        lastTapSideRef.current !== currentSide
      ) {
        accumulatedSeekRef.current = 0;
      }
      lastTapSideRef.current = currentSide;

      // Накопичуємо час перемотування
      accumulatedSeekRef.current += isRightSide ? 10 : -10;

      // Показуємо індикатор
      setSeekIndicator({
        visible: true,
        direction: isRightSide ? "right" : "left",
        value: Math.abs(accumulatedSeekRef.current),
      });

      // Скидаємо попередній таймер
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }

      // Встановлюємо новий таймер для виконання перемотування
      seekDebounceRef.current = setTimeout(() => {
        if (accumulatedSeekRef.current !== 0) {
          seekTo(accumulatedSeekRef.current);
          accumulatedSeekRef.current = 0;
          lastTapSideRef.current = null;
        }
        // Ховаємо індикатор
        setSeekIndicator({ visible: false, direction: null, value: 0 });
        seekDebounceRef.current = null;
      }, 300);

      if (showControls) startHideControlsTimer();
      return;
    }

    // Скидаємо накопичення при одиночному тапі
    accumulatedSeekRef.current = 0;
    lastTapSideRef.current = null;
    setSeekIndicator({ visible: false, direction: null, value: 0 });

    if (singleTapTimeoutRef.current) {
      clearTimeout(singleTapTimeoutRef.current);
    }
    singleTapTimeoutRef.current = setTimeout(() => {
      toggleControls();
      singleTapTimeoutRef.current = null;
    }, 280);
  };

  const startHideControlsTimer = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }

    hideControlsTimerRef.current = setTimeout(() => {
      hideControls();
    }, 2000);
  };

  const handlePlayPress = () => {
    togglePlayPause();
  };

  const toggleOrientation = () => {
    // Orientation.getOrientation((orientation) => { ... });
    EOrientation.getOrientationAsync().then((orientation) => {
      if (!isMountedRef.current) return;
      const applyToggle = () => {
        try {
          if (
            orientation === EOrientation.Orientation.PORTRAIT_UP ||
            orientation === EOrientation.Orientation.PORTRAIT_DOWN
          ) {
            EOrientation.lockAsync(EOrientation.OrientationLock.LANDSCAPE);
            try {
              SystemNavigationBar.fullScreen(true);
              SystemNavigationBar.navigationHide();
            } catch (e) {
              Logger.warn(
                "LocalVideoPlayer",
                "SystemNavigationBar toggle->landscape error",
                e
              );
            }
            setIsLandscape(true);
          } else {
            if (isTablet()) {
              EOrientation.unlockAsync(); // На планшетах дозволяємо будь-яку орієнтацію
            } else {
              EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP); // На телефонах блокуємо портретну
            }
            try {
              SystemNavigationBar.fullScreen(false);
              SystemNavigationBar.navigationShow();
            } catch (e) {
              Logger.warn(
                "LocalVideoPlayer",
                "SystemNavigationBar toggle->portrait error",
                e
              );
            }
            setIsLandscape(false);
          }
        } catch (e) {
          Logger.warn("LocalVideoPlayer", "toggleOrientation error", e);
        }
      };
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(applyToggle);
      } else {
        setTimeout(applyToggle, 0);
      }
    });
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const showEpisodesPanel = () => {
    setShowEpisodes(true);
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const hideEpisodesPanel = () => {
    setShowEpisodes(false);
  };

  const toggleEpisodes = () => {
    if (showEpisodes) {
      hideEpisodesPanel();
    } else {
      showEpisodesPanel();
    }
    if (showControls) {
      startHideControlsTimer();
    }
  };

  // Перехід між епізодами
  const goToPreviousEpisode = () => {
    const currentIndex = episodes.findIndex(
      (ep) => ep.episode === currentEpisode?.episode
    );
    if (currentIndex > 0) {
      setCurrentTime(0);
      setDuration(0);
      setCurrentEpisode(episodes[currentIndex - 1]);
      setWatchedEpisode(_anime.slug, episodes[currentIndex - 1]);
    } else if (player) {
      // якщо попереднього немає — перемотати на початок
      lastSeekTimeRef.current = Date.now();
      timeUpdateCountRef.current = 0;
      isLoadingRef.current = true;
      setIsLoading(true);
      player.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const goToNextEpisode = () => {
    const currentIndex = episodes.findIndex(
      (ep) => ep.episode === currentEpisode?.episode
    );
    if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
      setCurrentTime(0);
      setDuration(0);
      setCurrentEpisode(episodes[currentIndex + 1]);
      setWatchedEpisode(_anime.slug, episodes[currentIndex + 1]);
    }
  };

  const onEpisodeSelect = (episode) => {
    setCurrentEpisode(episode);
    setCurrentTime(0);
    setDuration(0);
    if (player) {
      player.currentTime = 0;
    }
    setWatchedEpisode(_anime.slug, episode);
    hideEpisodesPanel();
    if (showControls) {
      startHideControlsTimer();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Фон відео */}
      <View style={{ flex: 1, width: "100%" }}>
        {/* Клік-кетчер для тапів - розміщений першим, щоб бути під контролями */}
        <Pressable
          onPress={handleVideoAreaPress}
          style={StyleSheet.absoluteFill}
          android_disableSound
        />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          pointerEvents="none"
        >
          <VideoView
            style={{ flex: 1, width: "100%" }}
            ref={videoViewRef}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls={false}
            pointerEvents="none"
            contentFit={isLandscape && isZoomed ? "cover" : "contain"}
            onFirstFrameRender={() => {
              // Скидаємо завантаження коли перший кадр відрендерився
              isLoadingRef.current = false;
              setIsLoading(false);
            }}
            onPictureInPictureStop={() => {
              setTimeout(async () => {
                await SystemNavigationBar.fullScreen(true);
                StatusBar.setHidden(true);
                Logger.debug("LocalVideoPlayer", "PiP is stopped");
              }, 1000);
            }}
          />
        </View>

        {/* Оверлей завантаження */}
        {isLoading && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.loadingOverlay}
            pointerEvents="none"
          >
            <Animated.View
              style={[styles.loadingContainer, animatedLoadingStyle]}
            >
              <ActivityIndicator size="large" color={themeColors.primary} />
            </Animated.View>
          </Animated.View>
        )}

        {/* Індикатор перемотування */}
        {seekIndicator.visible && (
          <Animated.View
            entering={FadeIn.duration(100)}
            exiting={FadeOut.duration(100)}
            style={[
              styles.seekIndicator,
              seekIndicator.direction === "right"
                ? styles.seekIndicatorRight
                : styles.seekIndicatorLeft,
            ]}
            pointerEvents="none"
          >
            <View
              style={[
                styles.seekIndicatorContent,
                {
                  backgroundColor: themeColors.Background?.(0.7),
                },
              ]}
            >
              {seekIndicator.direction === "right" ? (
                <>
                  <Text
                    style={[H4, { color: themeColors.text, marginLeft: 8 }]}
                  >
                    {seekIndicator.value} сек
                  </Text>
                  <Icons.CaretDoubleRight
                    size={28}
                    color={themeColors.primary}
                  />
                </>
              ) : (
                <>
                  <Icons.CaretDoubleLeft
                    size={28}
                    color={themeColors.primary}
                  />
                  <Text
                    style={[H4, { color: themeColors.text, marginLeft: 8 }]}
                  >
                    {seekIndicator.value} сек
                  </Text>
                </>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Заголовок */}
      {showControls && (
        <>
          {!isLocked ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.header}
            >
              <LinearGradient
                colors={[
                  themeColors.Background(0.8),
                  themeColors.Background(0.4),
                  "transparent",
                ]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <View>
                    <CustomTouchableOpacity
                      style={styles.headerButton}
                      activeOpacity={1}
                      delayPressIn={0}
                      delayPressOut={0}
                      onPress={() => {
                        deactivateKeepAwake();
                        StatusBar.setHidden(false, "slide");
                        SystemNavigationBar.navigationShow();
                        setTimeout(() => {
                          navigation.goBack();
                          // Orientation.lockToPortrait();
                          if (isTablet()) {
                            EOrientation.unlockAsync(); // На планшетах дозволяємо будь-яку орієнтацію
                          } else {
                            EOrientation.lockAsync(
                              EOrientation.OrientationLock.PORTRAIT_UP
                            ); // На телефонах блокуємо портретну
                          }
                        }, 100);
                      }}
                    >
                      <Icons.ArrowLeft size={32} color={themeColors.primary} />
                    </CustomTouchableOpacity>
                  </View>

                  <View style={styles.titleContainer}>
                    <Text
                      style={[H4, { color: themeColors.text }]}
                      numberOfLines={1}
                    >
                      {title || "Відео"}
                    </Text>
                    <Text
                      style={[H6, { color: themeColors.InActiveText(0.7) }]}
                    >
                      Епізод {currentEpisode?.episode || "1"}
                    </Text>
                  </View>

                  <View style={styles.headerButtons}>
                    <View>
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={openSpeedBottomSheet}
                      >
                        <Icons.Speedometer size={24} color={themeColors.text} />
                      </CustomTouchableOpacity>
                    </View>

                    <View>
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => {
                          if (showControls) {
                            startHideControlsTimer();
                          }
                          if (isPictureInPictureSupported()) {
                            Toast.show(
                              "Якщо PiP не з'явився, дозвольте використання PiP у налаштуваннях",
                              {
                                duration: Toast.durations.SHORT,
                                backgroundColor: themeColors.subtle,
                                shadow: false,
                                position: Toast.positions.BOTTOM,
                              }
                            );
                            videoViewRef.current.startPictureInPicture();
                          }
                        }}
                      >
                        <Icons.PictureInPicture
                          size={24}
                          color={themeColors.text}
                        />
                      </CustomTouchableOpacity>
                    </View>

                    <View>
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={toggleEpisodes}
                      >
                        <Icons.Queue
                          size={24}
                          color={
                            showEpisodes
                              ? themeColors.primary
                              : themeColors.text
                          }
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.header}
            />
          )}
        </>
      )}

      {/* Нижні елементи керування */}
      {showControls && (
        <>
          {!isLocked ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={styles.controlsContainer}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  themeColors.Background(0.4),
                  themeColors.Background(0.9),
                ]}
                style={styles.controlsGradient}
              >
                {/* Секція прогресу */}
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }} />

                    <View>
                      <CustomTouchableOpacity
                        style={[styles.controlButton]}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => {
                          setIsLocked((prev) => !prev);
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.Lock
                          type={"enabled"}
                          size={24}
                          color={themeColors.text}
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text
                      style={[
                        H6,
                        {
                          color: themeColors.text,
                          minWidth: 50,
                          textAlign: "center",
                        },
                      ]}
                    >
                      {formatTime(currentTime)}
                    </Text>

                    <View style={styles.progressBarContainer}>
                      <Slider
                        style={{ width: "100%", height: 15 }}
                        value={Math.min(
                          Math.max(currentTime, 0),
                          duration || 0
                        )}
                        minimumValue={0}
                        maximumValue={duration || 0}
                        step={0.1}
                        minimumTrackTintColor={themeColors.primary}
                        maximumTrackTintColor={themeColors.text}
                        thumbTintColor={themeColors.primary}
                        disabled={!duration || duration <= 0}
                        onSlidingStart={() => {
                          if (hideControlsTimerRef.current) {
                            clearTimeout(hideControlsTimerRef.current);
                            hideControlsTimerRef.current = null;
                          }
                        }}
                        onValueChange={(val) => {
                          setCurrentTime(val);
                        }}
                        onSlidingComplete={(val) => {
                          if (player && duration > 0) {
                            const clamped = Math.max(
                              0,
                              Math.min(duration, val)
                            );
                            lastSeekTimeRef.current = Date.now();
                            timeUpdateCountRef.current = 0;
                            isLoadingRef.current = true;
                            setIsLoading(true);
                            setCurrentTime(clamped);
                            player.currentTime = clamped;
                          }
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      />
                    </View>

                    <Text
                      style={[
                        H6,
                        {
                          color: themeColors.text,
                          minWidth: 50,
                          textAlign: "center",
                        },
                      ]}
                    >
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>

                {/* Основні елементи керування */}
                <View style={styles.mainControls}>
                  {/* Ліві елементи керування */}
                  <View style={styles.leftControlGroup}>
                    <CustomTouchableOpacity
                      style={styles.controlButton}
                      activeOpacity={1}
                      delayPressIn={0}
                      delayPressOut={0}
                      onPress={() => {
                        setVolumeTooltipVisible((v) => !v);
                        if (showControls) {
                          startHideControlsTimer();
                        }
                      }}
                    >
                      <Icons.Volume
                        volume={volume * 100}
                        size={24}
                        color={themeColors.text}
                      />
                      <VolumeWidget
                        visible={volumeTooltipVisible}
                        value={volume}
                        onChange={handleVolumeChange}
                        onClose={() => setVolumeTooltipVisible(false)}
                      />
                    </CustomTouchableOpacity>
                    <CustomTouchableOpacity
                      style={[styles.controlButton]}
                      activeOpacity={1}
                      delayPressIn={0}
                      delayPressOut={0}
                      onPress={() => {
                        qualitySheetRef.current?.present();
                      }}
                    >
                      <Text
                        style={[
                          H5,
                          {
                            color: themeColors.text,
                          },
                        ]}
                      >
                        {quality || "8=>"}
                      </Text>
                    </CustomTouchableOpacity>
                  </View>

                  {/* Центральні елементи керування відтворенням */}
                  <View style={styles.playControlGroup}>
                    {isLandscape && (
                      <CustomTouchableOpacity
                        style={styles.seekButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => seekTo(-10)}
                        onLongPress={() => seekTo(-30)}
                      >
                        <Icons.ArrowCounterClockwise
                          size={24}
                          color={themeColors.text}
                        />
                      </CustomTouchableOpacity>
                    )}
                    <View>
                      <CustomTouchableOpacity
                        style={styles.skipButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => {
                          goToPreviousEpisode();
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.SkipBack size={24} color={themeColors.text} />
                      </CustomTouchableOpacity>
                    </View>

                    <Pressable
                      style={styles.playButtonContainer}
                      onPress={togglePlayPause}
                      android_disableSound
                    >
                      <View
                        style={[
                          styles.playButton,
                          { backgroundColor: themeColors.primary },
                        ]}
                      >
                        {isPlaying ? (
                          <Icons.Pause size={32} color={themeColors.text} />
                        ) : (
                          <Icons.Play size={32} color={themeColors.text} />
                        )}
                      </View>
                    </Pressable>

                    <View>
                      <CustomTouchableOpacity
                        style={styles.skipButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => {
                          goToNextEpisode();
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.SkipForward size={24} color={themeColors.text} />
                      </CustomTouchableOpacity>
                    </View>

                    {isLandscape && (
                      <CustomTouchableOpacity
                        style={styles.seekButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={() => seekTo(10)}
                        onLongPress={() => seekTo(30)}
                      >
                        <Icons.ArrowClockwise
                          size={24}
                          color={themeColors.text}
                        />
                      </CustomTouchableOpacity>
                    )}
                  </View>

                  {/* Праві елементи керування */}
                  <View style={styles.rightControlGroup}>
                    {isLandscape && (
                      <>
                        <View>
                          <CustomTouchableOpacity
                            style={styles.controlButton}
                            activeOpacity={1}
                            delayPressIn={0}
                            delayPressOut={0}
                            onPress={() => {
                              setIsZoomed((prev) => !prev);
                              if (showControls) {
                                startHideControlsTimer();
                              }
                            }}
                          >
                            <Icons.FrameCorners
                              size={24}
                              color={
                                isZoomed
                                  ? themeColors.primary
                                  : themeColors.text
                              }
                            />
                          </CustomTouchableOpacity>
                        </View>

                        <View>
                          <CustomTouchableOpacity
                            style={styles.controlButton}
                            activeOpacity={1}
                            delayPressIn={0}
                            delayPressOut={0}
                            onPress={async function () {
                              if (isDownloading) return;
                              if (showControls) {
                                startHideControlsTimer();
                              }
                              // Асинхронна функція для обробки вибору епізоду
                              try {
                                // Знаходимо епізод у списку завантажених
                                setInfo(info);
                                const downloadedEpisodes = Array.isArray(
                                  info?.downloaded_episodes
                                )
                                  ? info.downloaded_episodes
                                  : [];
                                const episode = downloadedEpisodes.find(
                                  (ep) => ep.episode === currentEpisode?.episode
                                );

                                // Перевіряємо чи існує episode і чи є валідний video_path

                                if (
                                  episode &&
                                  episode.video_path &&
                                  (await RNFS.exists(episode.video_path))
                                ) {
                                  Logger.debug(
                                    "LocalVideoPlayer",
                                    "episode.video_path",
                                    { path: episode.video_path }
                                  );
                                  try {
                                    await FileOpener.openFile(
                                      episode.video_path,
                                      "video/*"
                                    );
                                    Logger.info(
                                      "LocalVideoPlayer",
                                      "Діалог вибору відкрито"
                                    );
                                  } catch (error) {
                                    Logger.error(
                                      "LocalVideoPlayer",
                                      "Помилка при відкритті файлу",
                                      error
                                    );
                                  }
                                } else {
                                  // Видаляємо запис, якщо файл не існує
                                  if (episode) {
                                    const downloadedEpisodesSafe =
                                      Array.isArray(info?.downloaded_episodes)
                                        ? info.downloaded_episodes
                                        : [];
                                    setInfo({
                                      ...info,
                                      downloaded_episodes:
                                        downloadedEpisodesSafe.filter(
                                          (ep) =>
                                            ep.episode !==
                                            currentEpisode?.episode
                                        ),
                                    });
                                  }

                                  // Завантажуємо відео
                                  await DownloadVideo({
                                    item: currentEpisode,
                                    anime: _anime,
                                    info: info,
                                    onStartDownloadCallback: () => {
                                      Logger.debug(
                                        "LocalVideoPlayer",
                                        "onStartDownloadCallback"
                                      );
                                      setIsDownloading(true);
                                      setDownloadProgress(0);
                                    },
                                    progressCallback: (progress) => {
                                      setDownloadProgress(progress);
                                    },
                                    completionCallback: (
                                      completionCallback
                                    ) => {
                                      setIsDownloading(false);
                                      Logger.debug(
                                        "LocalVideoPlayer",
                                        "completionCallback",
                                        completionCallback
                                      );
                                    },
                                  });
                                }
                              } catch (err) {
                                Logger.error(
                                  "LocalVideoPlayer",
                                  "Помилка при обробці епізоду",
                                  err
                                );
                                // Додаткова інформація для дебагу
                                Logger.debug(
                                  "LocalVideoPlayer",
                                  "Item object",
                                  { currentEpisode }
                                );
                                Logger.debug(
                                  "LocalVideoPlayer",
                                  "Episode info",
                                  { episodes: info.downloaded_episodes }
                                );
                              }
                            }}
                          >
                            {isDownloading ? (
                              <View
                                style={[
                                  styles.downloadButtonContainer,
                                  { top: 8 },
                                ]}
                              >
                                <Icons.DownloadAnimated
                                  size={24}
                                  color={themeColors.primary}
                                />
                                <Text
                                  style={[
                                    H6,
                                    {
                                      color: themeColors.primary,
                                      marginTop: 2,
                                    },
                                  ]}
                                >
                                  {Math.round(downloadProgress)}%
                                </Text>
                              </View>
                            ) : (
                              <Icons.DownloadSimple
                                size={24}
                                color={
                                  Array.isArray(info?.downloaded_episodes) &&
                                  info.downloaded_episodes.some(
                                    (ep) =>
                                      ep.episode === currentEpisode?.episode
                                  )
                                    ? themeColors.primary
                                    : themeColors.text
                                }
                              />
                            )}
                          </CustomTouchableOpacity>
                        </View>
                      </>
                    )}

                    <View>
                      <CustomTouchableOpacity
                        style={styles.controlButton}
                        activeOpacity={1}
                        delayPressIn={0}
                        delayPressOut={0}
                        onPress={toggleOrientation}
                      >
                        <Icons.DeviceRotate
                          size={24}
                          color={themeColors.text}
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "flex-end",
                justifyContent: "flex-end",
                paddingBottom: 180,
                paddingRight: 24,
                zIndex: 12,
              }}
            >
              <View>
                <CustomTouchableOpacity
                  style={[styles.controlButton]}
                  activeOpacity={1}
                  delayPressIn={0}
                  delayPressOut={0}
                  onPress={() => {
                    setIsLocked((prev) => !prev);
                    if (showControls) {
                      startHideControlsTimer();
                    }
                  }}
                >
                  <Icons.Lock
                    type={"disabled"}
                    size={24}
                    color={themeColors.primary}
                  />
                </CustomTouchableOpacity>
              </View>
            </Animated.View>
          )}
        </>
      )}

      {/* Панель епізодів */}
      {showEpisodes && (
        <>
          <Pressable
            style={styles.episodesOverlay}
            onPress={hideEpisodesPanel}
          />
          <Animated.View
            entering={SlideInRight.duration(250)}
            exiting={SlideOutRight.duration(200)}
            style={[
              styles.episodesPanel,
              {
                backgroundColor: themeColors.accent,
                width: isLandscape ? 400 : 300,
              },
            ]}
          >
            <View style={styles.episodesPanelContent}>
              <ScrollView
                style={styles.episodesList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}
              >
                {episodes.map((episode, index) => (
                  <Animated.View
                    key={episode.episode}
                    entering={FadeIn.delay(index * 50).duration(300)}
                  >
                    <EpisodeItem
                      mode="watch"
                      episode={episode}
                      anime={_anime}
                      isWatched={info?.watched_episodes?.includes(
                        episode.episode
                      )}
                      player="local"
                      useBuiltIn={true}
                      onPress={() => onEpisodeSelect(episode)}
                    />
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        </>
      )}

      {/* Bottom Sheet */}
      <SpeedBottomSheet
        sheetRef={speedSheetRef}
        currentRate={rate}
        onRateChange={changePlaybackRate}
      />
      <QualityWidget
        sheetRef={qualitySheetRef}
        currentQuality={quality}
        qualities={qualitiesList}
        onQualityChange={(nextQuality) => {
          if (!episodeInfo?.qualitys) return;
          const wasPlaying = !!latestPlayerRef.current?.playing;
          const savedTime = latestPlayerRef.current?.currentTime || 0;
          setQuality(nextQuality);
          const nextUrl = episodeInfo.qualitys[nextQuality];
          if (nextUrl) {
            lastSeekTimeRef.current = Date.now();
            timeUpdateCountRef.current = 0;
            lastTimeUpdateRef.current = 0;
            isLoadingRef.current = true;
            setIsLoading(true);
            setCurrentUrl(nextUrl);
          }
          qualitySheetRef.current?.close();
          setTimeout(() => {
            const p = latestPlayerRef.current;
            if (!p) return;
            p.currentTime = savedTime;
            if (wasPlaying) p.play();
            else p.pause();
          }, 300);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoTouchArea: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 16,
  },

  // Індикатор перемотування
  seekIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 999,
  },
  seekIndicatorLeft: {
    left: 40,
  },
  seekIndicatorRight: {
    right: 40,
  },
  seekIndicatorContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  // Стилі заголовка
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  headerButton: {
    width: 44,
    height: 44,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Контейнер елементів керування
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  controlsGradient: {
    paddingHorizontal: 25,
    paddingTop: 30,
  },

  // Секція прогресу

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 8,
    height: 60,
    justifyContent: "center",
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
    position: "absolute",
  },

  // Основні елементи керування
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  leftControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  rightControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Елементи керування відтворенням
  playControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 2,
  },
  seekButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginHorizontal: 8,
    minWidth: 40,
  },
  skipButton: {
    padding: 12,
    marginHorizontal: 16,
  },
  playButtonContainer: {
    marginHorizontal: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Додаткові елементи керування
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
  centerInfo: {
    flex: 1,
    alignItems: "center",
  },
  qualityText: {},

  // Панель епізодів
  episodesPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 300,
    zIndex: 11,
  },
  episodesPanelContent: {
    flex: 1,
  },
  episodesPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  episodesBackButton: {
    padding: 8,
  },
  episodeCount: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  episodesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  episodesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});

async function ___getQualities(file) {
  const qualities = {};
  const m3u8 = new M3U8FileParser();
  m3u8.read(
    await axios
      .get(file, {
        headers: {
          "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
        },
        decompress: true,
      })
      .then((res) => res.data)
  );

  // Отримання якостей з M3U8 файлу
  m3u8.getResult().segments.forEach((item) => {
    if (item.streamInf.resolution) {
      qualities[
        item.url.match(/\/(\d+)\//)?.[1].length > 1
          ? item.url.match(/\/(\d+)\//)?.[1] + "p"
          : item.url.match(/\/hls\/(\d+)\//)?.[1] + "p"
      ] = item.url;
    }
  });
  return qualities;
}

async function ___getPlayerDataFrom_ASHDI_Player(url) {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const fileMatch = htmlContent.match(/file:\s*['"]([^'"]+)['"]/);
    const qualitys = await ___getQualities(fileMatch[1]);
    return fileMatch
      ? {
          file: fileMatch[1],
          qualitys: qualitys,
          poster: htmlContent.match(/poster:\s*"([^"]+)"/)?.[1],
        }
      : null;
  } catch (error) {
    Logger.error(
      "___getPlayerDataFrom_ASHDI_Player",
      "Помилка завантаження",
      error
    );
    return { success: false, error: "no_player_data_found" };
  }
}

async function ___getPlayerDataFrom_MOON_Player(url) {
  try {
    // Отримуємо HTML-контент за посиланням
    const response = await axios.get(url, {
      headers: {
        "Accept-Language": "uk-UA,uk;q=0.8,en-US;q=0.5,en;q=0.3",
      },
      decompress: true,
    });
    const htmlContent = response.data;
    // Шукаємо дані плеєра за допомогою регулярних виразів
    const playerData = {};

    // Використовуємо регулярні вирази для пошуку параметрів плеєра
    const idMatch = htmlContent.match(/id:\s*"([^"]+)"/);
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
    if (fileMatch[1].includes("webm")) {
      const data = {};
      const temp_ = fileMatch[1].split(",");
      temp_.forEach((item) => {
        const quality = item.match(/\[(.*?)\]/)?.[1];
        if (quality) data[quality] = item.split("]")[1];
      });
      fileMatch[1] = data;
    }
    const posterMatch = htmlContent.match(/poster:\s*"([^"]+)"/);
    const subtitleMatch = htmlContent.match(/subtitle:\s*"([^"]+)"/);
    const defaultQualityMatch = htmlContent.match(
      /default_quality:\s*"([^"]+)"/
    );

    // Заповнюємо об'єкт даними, якщо вони знайдені
    if (idMatch) playerData.id = idMatch[1];
    if (fileMatch) playerData.file = fileMatch[1];
    if (posterMatch) playerData.poster = posterMatch[1];
    if (subtitleMatch) playerData.subtitle = subtitleMatch[1];
    if (defaultQualityMatch) playerData.defaultQuality = defaultQualityMatch[1];
    playerData.qualitys = await ___getQualities(fileMatch[1]);

    // Перевіряємо, чи знайдено хоча б один параметр
    return Object.keys(playerData).length > 0 ? playerData : null;
  } catch (error) {
    Logger.error(
      "___getPlayerDataFrom_MOON_Player",
      "Помилка при отриманні даних плеєра",
      error
    );
  }
}

async function getEpisodeInfo(episodeUrl) {
  let data = episodeUrl.includes("moon")
    ? await ___getPlayerDataFrom_MOON_Player(episodeUrl)
    : await ___getPlayerDataFrom_ASHDI_Player(episodeUrl);
  return data;
}
