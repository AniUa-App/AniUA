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
import React, { useState, useEffect, useRef } from "react";
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
import Slider from "@react-native-community/slider";
import Icons from "../Styles/Icons";
import { black, Black, Gray, white, appColor, black_1 } from "../Styles/Colors";
import { H3, H4, H5, H6 } from "../Styles/Fonts";
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
  const qualitiesList = React.useMemo(() => {
    if (!episodeInfo?.qualitys) return [];
    return Object.keys(episodeInfo.qualitys).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  }, [episodeInfo]);
  const [isLocked, setIsLocked] = useState(false);
  const [info, _setInfo] = useState(AnimeStorage.getInfoBySlug(_anime.slug));
  const seekTimeout = useRef(null);
  const videoViewRef = useRef(null);
  const qualitySheetRef = useRef(null);
  const latestPlayerRef = useRef(null);
  const volumeApplyTimeoutRef = useRef(null);
  const pendingVolumeRef = useRef(null);
  const lastTapRef = useRef(null);
  const singleTapTimeoutRef = useRef(null);

  const [volumeTooltipVisible, setVolumeTooltipVisible] = useState(false);

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
    AnimeStorage.setInfoBySlug(_anime.slug, newInfo);
  };

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

  // Оновлюємо список епізодів, коли змінюються пропси
  useEffect(() => {
    setEpisodes(_episodes || []);
  }, [_episodes]);

  // Оновлення відео при зміні поточного епізоду
  useEffect(() => {
    if (!currentEpisode?.video_url) return;
    const updateEpisode = async () => {
      try {
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
        console.error("Не вдалося отримати дані епізоду:", e);
        setIsLoading(false);
      }
    };
    updateEpisode();
  }, [currentEpisode]);

  const player = useVideoPlayer(currentUrl, (player) => {
    player.play();
    player.preservesPitch = true;
    player.timeUpdateEventInterval = 1;
    player.startsPictureInPictureAutomatically = true;
    // Колбек плеєра
    if (player) {
      player.addListener("statusChange", ({ status }) => {
        if (status === "readyToPlay") {
          setDuration(player.duration);
          setIsLoading(false);
        }
      });

      player.addListener("timeUpdate", (event) => {
        setCurrentTime(player.currentTime);
        if (isLoading && event.currentTime >= 0) {
          setIsLoading(false);
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
        console.error("Video error:", error);
        setIsLoading(true);
      });
    }
  });

  // Тримати актуальне посилання на плеєр для простого доступу в таймаутах
  useEffect(() => {
    latestPlayerRef.current = player;
  }, [player]);

  // Функції керування
  const togglePlayPause = () => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const seekTo = (seconds) => {
    if (player && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      setCurrentTime(newTime);
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
    const info = AnimeStorage.getInfoBySlug(slug);
    info.watched.episodes = [...info.watched.episodes, episode.episode];
    AnimeStorage.setInfoBySlug(slug, info);
  };

  useEffect(() => {
    const onBackPress = () => {
      console.log("onBackPress");
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
      return true;
    };

    const onOrientationChange = (orientation) => {
      console.log("Orientation changed:", orientation);
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
      console.log("isLandscape: ", isLandscape);
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
                console.warn("SystemNavigationBar landscape error:", e);
              }
              setIsLandscape(true);
            } else {
              try {
                SystemNavigationBar.fullScreen(false);
                SystemNavigationBar.navigationShow();
              } catch (e) {
                console.warn("SystemNavigationBar portrait error:", e);
              }
              setIsLandscape(false);
            }
          } catch (e) {
            console.warn("Orientation applyChanges error:", e);
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
      // Orientation.removeOrientationListener(onOrientationChange);
      EOrientation.removeOrientationChangeListener(orientationSubscription);
      try {
        StatusBar.setHidden(false, "slide");
      } catch (e) {
        console.warn("StatusBar show error:", e);
      }
      try {
        SystemNavigationBar.navigationShow();
      } catch (e) {
        console.warn("SystemNavigationBar show error:", e);
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
            console.warn("Не вдалося запустити PiP автоматично:", error);
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

    if (isDoubleTap) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      const tapX = event?.nativeEvent?.locationX ?? width / 2;
      const isRightSide = tapX > width / 2;
      seekTo(isRightSide ? 10 : -10);
      if (showControls) startHideControlsTimer();
      return;
    }

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
              console.warn("SystemNavigationBar toggle->landscape error:", e);
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
              console.warn("SystemNavigationBar toggle->portrait error:", e);
            }
            setIsLandscape(false);
          }
        } catch (e) {
          console.warn("toggleOrientation error:", e);
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
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setCurrentEpisode(episodes[currentIndex - 1]);
      setWatchedEpisode(_anime.slug, episodes[currentIndex - 1]);
      setIsLoading(false);
    } else if (player) {
      // якщо попереднього немає — перемотати на початок
      player.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const goToNextEpisode = () => {
    const currentIndex = episodes.findIndex(
      (ep) => ep.episode === currentEpisode?.episode
    );
    if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
      setCurrentEpisode(episodes[currentIndex + 1]);
      setWatchedEpisode(_anime.slug, episodes[currentIndex + 1]);
      setIsLoading(false);
    }
  };

  const onEpisodeSelect = (episode) => {
    setCurrentEpisode(episode);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    player.currentTime = 0;
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
              setIsLoading(false);
            }}
          />
        </View>

        {/* Оверлей завантаження */}
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={appColor} />
          </View>
        ) : null}
      </View>

      {/* Заголовок */}
      {showControls && (
        <>
          {!isLocked ? (
            <View style={styles.header}>
              <LinearGradient
                colors={[
                  themeColors.Black(0.8),
                  themeColors.Black(0.4),
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
                      <Icons.ArrowLeft size={32} color={appColor} />
                    </CustomTouchableOpacity>
                  </View>

                  <View style={styles.titleContainer}>
                    <Text
                      style={[H4, { color: themeColors.white }]}
                      numberOfLines={1}
                    >
                      {title || "Відео"}
                    </Text>
                    <Text style={[H6, { color: themeColors.Gray(0.7) }]}>
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
                        <Icons.Speedometer
                          size={24}
                          color={themeColors.white}
                        />
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
                            videoViewRef.current.startPictureInPicture();
                            Toast.show(
                              "Якщо PiP не з'явився, дозвольте використання PiP у налаштуваннях",
                              {
                                duration: Toast.durations.SHORT,
                                backgroundColor: themeColors.black_1,
                                shadow: false,
                                position: Toast.positions.BOTTOM,
                              }
                            );
                          }
                        }}
                      >
                        <Icons.PictureInPicture
                          size={24}
                          color={themeColors.white}
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
                          color={showEpisodes ? appColor : themeColors.white}
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.header} />
          )}
        </>
      )}

      {/* Нижні елементи керування */}
      {showControls && (
        <>
          {!isLocked ? (
            <View style={styles.controlsContainer}>
              <LinearGradient
                colors={[
                  "transparent",
                  themeColors.Black(0.4),
                  themeColors.Black(0.9),
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
                          color={themeColors.white}
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text
                      style={[
                        H6,
                        {
                          color: themeColors.white,
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
                        minimumTrackTintColor={appColor}
                        maximumTrackTintColor={themeColors.white}
                        thumbTintColor={appColor}
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
                          color: themeColors.white,
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
                    <View>
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
                          color={themeColors.white}
                        />
                        <VolumeWidget
                          visible={volumeTooltipVisible}
                          value={volume}
                          onChange={handleVolumeChange}
                          onClose={() => setVolumeTooltipVisible(false)}
                        />
                      </CustomTouchableOpacity>
                    </View>
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
                          color={themeColors.white}
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
                        <Icons.SkipBack size={24} color={themeColors.white} />
                      </CustomTouchableOpacity>
                    </View>

                    <CustomTouchableOpacity
                      style={styles.playButtonContainer}
                      activeOpacity={1}
                      delayPressIn={0}
                      delayPressOut={0}
                      onPress={handlePlayPress}
                    >
                      <View style={styles.playButton}>
                        {player.playing ? (
                          <Icons.Pause size={32} color={themeColors.white} />
                        ) : (
                          <Icons.Play size={32} color={themeColors.white} />
                        )}
                      </View>
                    </CustomTouchableOpacity>

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
                        <Icons.SkipForward
                          size={24}
                          color={themeColors.white}
                        />
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
                          color={themeColors.white}
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
                              color={isZoomed ? appColor : themeColors.white}
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
                                  info?.downloaded?.episodes
                                )
                                  ? info.downloaded.episodes
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
                                  console.log(
                                    episode.video_path,
                                    "episode.video_path"
                                  );
                                  try {
                                    await FileOpener.openFile(
                                      episode.video_path,
                                      "video/*"
                                    );
                                    console.log("Діалог вибору відкрито");
                                  } catch (error) {
                                    console.error(
                                      "Помилка при відкритті файлу:",
                                      error
                                    );
                                  }
                                } else {
                                  // Видаляємо запис, якщо файл не існує
                                  if (episode) {
                                    const downloadedEpisodesSafe =
                                      Array.isArray(info?.downloaded?.episodes)
                                        ? info.downloaded.episodes
                                        : [];
                                    setInfo({
                                      ...info,
                                      downloaded: {
                                        ...info.downloaded,
                                        episodes: downloadedEpisodesSafe.filter(
                                          (ep) =>
                                            ep.episode !==
                                            currentEpisode?.episode
                                        ),
                                      },
                                    });
                                  }

                                  // Завантажуємо відео
                                  await DownloadVideo({
                                    item: currentEpisode,
                                    anime: _anime,
                                    info: info,
                                    onStartDownloadCallback: () => {
                                      console.log("onStartDownloadCallback");
                                      setIsDownloading(true);
                                    },
                                    progressCallback: (progressCallback) => {
                                      // console.log(
                                      //   "progressCallback",
                                      //   progressCallback
                                      // );
                                    },
                                    completionCallback: (
                                      completionCallback
                                    ) => {
                                      setIsDownloading(false);
                                      console.log(
                                        "completionCallback",
                                        completionCallback
                                      );
                                    },
                                  });
                                }
                              } catch (err) {
                                console.error(
                                  "Помилка при обробці епізоду:",
                                  err
                                );
                                // Додаткова інформація для дебагу
                                console.log("Item object:", currentEpisode);
                                console.log(
                                  "Episode info:",
                                  info.downloaded?.episodes
                                );
                              }
                            }}
                          >
                            {isDownloading ? (
                              <Icons.DownloadAnimated
                                size={24}
                                color={themeColors.appColor}
                              />
                            ) : (
                              <Icons.DownloadSimple
                                size={24}
                                color={
                                  Array.isArray(info?.downloaded?.episodes) &&
                                  info.downloaded.episodes.some(
                                    (ep) =>
                                      ep.episode === currentEpisode?.episode
                                  )
                                    ? themeColors.appColor
                                    : themeColors.white
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
                          color={themeColors.white}
                        />
                      </CustomTouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Додаткові елементи керування */}
                <View style={styles.secondaryControls}>
                  <CustomTouchableOpacity
                    style={styles.controlButton}
                    activeOpacity={1}
                    delayPressIn={0}
                    delayPressOut={0}
                    onPress={() => {
                      qualitySheetRef.current?.present();
                    }}
                  >
                    <View style={styles.centerInfo}>
                      <Text style={styles.qualityText}>{quality || "x_x"}</Text>
                    </View>
                  </CustomTouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View
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
                  <Icons.Lock type={"disabled"} size={24} color={appColor} />
                </CustomTouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}

      {/* Панель епізодів */}
      {showEpisodes && (
        <View style={styles.episodesPanel}>
          <View style={styles.episodesPanelContent}>
            <View style={styles.episodesPanelHeader}>
              <CustomTouchableOpacity
                style={styles.episodesBackButton}
                activeOpacity={1}
                delayPressIn={0}
                delayPressOut={0}
                onPress={hideEpisodesPanel}
              >
                <Icons.ArrowLeft size={34} color={themeColors.appColor} />
              </CustomTouchableOpacity>
              <Text
                style={[
                  H4,
                  { color: themeColors.white, flex: 1, marginLeft: 12 },
                ]}
              >
                Епізоди
              </Text>
              <View style={styles.episodeCount}>
                <Text style={[H6, { color: themeColors.appColor }]}>
                  {episodes.length}
                </Text>
              </View>
            </View>

            <ScrollView
              style={styles.episodesList}
              showsVerticalScrollIndicator={false}
            >
              {episodes.map((episode, index) => (
                <View key={episode.episode}>
                  <CustomTouchableOpacity
                    style={[
                      styles.episodeItem,
                      currentEpisode?.episode === episode.episode &&
                        styles.episodeItemActive,
                    ]}
                    activeOpacity={1}
                    delayPressIn={0}
                    delayPressOut={0}
                    onPress={() => onEpisodeSelect(episode)}
                  >
                    <View style={styles.episodeNumber}>
                      <Text
                        style={[
                          H6,
                          {
                            color:
                              currentEpisode?.episode === episode.episode
                                ? themeColors.appColor
                                : themeColors.Gray(0.7),
                          },
                        ]}
                      >
                        {episode.episode}
                      </Text>
                    </View>

                    <View style={styles.episodeInfo}>
                      <Text
                        style={[
                          H5,
                          {
                            color:
                              currentEpisode?.episode === episode.episode
                                ? themeColors.appColor
                                : themeColors.white,
                            marginBottom: 4,
                          },
                        ]}
                      >
                        Епізод {episode.episode}
                      </Text>
                      <Text style={[H6, { color: themeColors.Gray(0.5) }]}>
                        {episode.duration || "Тривалість невідома"}
                      </Text>
                    </View>

                    {currentEpisode?.episode === episode.episode && (
                      <View style={styles.nowPlayingIndicator}>
                        <View style={styles.nowPlayingDot} />
                      </View>
                    )}
                  </CustomTouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      {/* Прозорий клік-кетчер над відео для гарантованого тапу в будь-якій орієнтації */}
      <Pressable
        onPress={handleVideoAreaPress}
        style={[StyleSheet.absoluteFill, { zIndex: 5 }]}
        android_disableSound
        hitSlop={10}
      />

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
    backgroundColor: black,
  },
  videoTouchArea: {
    flex: 1,
  },
  video: {
    flex: 1,
    width: "100%",
    backgroundColor: black,
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
    backgroundColor: Gray(0.3),
    borderRadius: 2,
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: appColor,
    borderRadius: 2,
    position: "absolute",
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: appColor,
    borderRadius: 8,
    marginLeft: -8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Основні елементи керування
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
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
    backgroundColor: appColor,
    justifyContent: "center",
    alignItems: "center",
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
  qualityText: {
    color: Gray(0.6),
    fontSize: 12,
    fontFamily: "Nunito-SemiBold",
    backgroundColor: Gray(0.2),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

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
    backgroundColor: Black(0.95),
  },
  episodesPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Gray(0.2),
  },
  episodesBackButton: {
    padding: 8,
  },
  episodeCount: {
    backgroundColor: Black(0.5),
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: appColor,
  },
  episodesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  episodeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
  },
  episodeItemActive: {
    backgroundColor: Black(0.7),
    borderWidth: 1,
    borderColor: appColor,
  },
  episodeNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Gray(0.2),
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  episodeInfo: {
    flex: 1,
  },
  nowPlayingIndicator: {
    alignItems: "center",
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColor,
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
    console.error("Помилка завантаження:", error);
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
    console.error("Помилка при отриманні даних плеєра:", error);
  }
}

async function getEpisodeInfo(episodeUrl) {
  let data = episodeUrl.includes("moon")
    ? await ___getPlayerDataFrom_MOON_Player(episodeUrl)
    : await ___getPlayerDataFrom_ASHDI_Player(episodeUrl);
  return data;
}
