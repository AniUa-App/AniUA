import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
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
import LinearGradient from "react-native-linear-gradient";
import Icons from "../Styles/Icons";
import { black, Black, Gray, white, appColor } from "../Styles/Colors";
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

const { width, height } = Dimensions.get("window");

export default function LocalVideoPlayerV2Screen({ route }) {
  const navigation = useNavigation();

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
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [currentUrl, setCurrentUrl] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [quality, setQuality] = useState(null);
  const qualitiesList = React.useMemo(() => {
    if (!episodeInfo?.qualitys) return [];
    return Object.keys(episodeInfo.qualitys).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  }, [episodeInfo]);
  const [isLocked, setIsLocked] = useState(false);
  const seekTimeout = useRef(null);
  const videoViewRef = useRef(null);
  const qualitySheetRef = useRef(null);

  const [volumeTooltipVisible, setVolumeTooltipVisible] = useState(false);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Функція для отримання повної тривалості відео
  const getDuration = () => {
    if (player) {
      return player.duration || duration;
    }
    return duration;
  };

  // Анімовані значення
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const controlsTranslateY = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const episodesPanelTranslateX = useRef(new Animated.Value(300)).current;
  const episodesPanelOpacity = useRef(new Animated.Value(0)).current;

  // Анімації кнопок
  const buttonScales = useRef({
    back: new Animated.Value(1),
    speed: new Animated.Value(1),
    subtitles: new Animated.Value(1),
    pip: new Animated.Value(1),
    episodes: new Animated.Value(1),
    lock: new Animated.Value(1),
    volume: new Animated.Value(1),
    skipBack: new Animated.Value(1),
    skipForward: new Animated.Value(1),
    download: new Animated.Value(1),
    rotate: new Animated.Value(1),
    fit: new Animated.Value(1),
  }).current;

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
        if (isLoadingRef.current && event.currentTime >= 0) {
          setIsLoading(false);
        }

        // Оновлення анімації прогрес-бару
        const progress = event.currentTime / (player.duration || 1);
        Animated.timing(progressAnimation, {
          toValue: progress || 0,
          duration: 1,
          useNativeDriver: false,
        }).start();
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

      player.addListener("waiting", () => {
        setIsLoading(true);
      });

      player.addListener("error", (error) => {
        console.error("Video error:", error);
        setIsLoading(false);
      });
    }
  });

  // Функції керування
  const togglePlayPause = () => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
      animatePlayButton();
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
    animateButton("volume");
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
    setVolume(newValue);
    if (player) {
      player.volume = newValue;
    }
  };

  const openSpeedBottomSheet = () => {
    animateButton("speed");
    speedSheetRef.current?.present();
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const changePlaybackRate = (newRate) => {
    setRate(newRate);
    if (player) {
      player.setPlaybackRate(newRate);
    }
    if (showControls) {
      startHideControlsTimer();
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      console.log("onBackPress");
      navigation.goBack();
      // StatusBar.setHidden(false);
      StatusBar.setHidden(false, "slide");
      SystemNavigationBar.navigationShow();
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP);
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
        if (
          orientationInfo.orientation ===
            EOrientation.Orientation.LANDSCAPE_LEFT ||
          orientationInfo.orientation ===
            EOrientation.Orientation.LANDSCAPE_RIGHT
        ) {
          SystemNavigationBar.fullScreen(true);
          SystemNavigationBar.navigationHide();
          setIsLandscape(true);
        } else {
          SystemNavigationBar.fullScreen(false);
          SystemNavigationBar.navigationShow();
          setIsLandscape(false);
        }
      }
    );

    // StatusBar.setHidden(true);
    StatusBar.setHidden(true, "slide");
    SystemNavigationBar.navigationHide();

    // Orientation.getOrientation(onOrientationChange);

    // Вже розблоковано вище

    showControlsWithAnimation();

    return () => {
      backHandlerSubscription.remove();
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      if (seekTimeout.current) {
        clearTimeout(seekTimeout.current);
      }
      // Orientation.removeOrientationListener(onOrientationChange);
      EOrientation.removeOrientationChangeListener(orientationSubscription);
      StatusBar.setHidden(false, "slide");
      SystemNavigationBar.navigationShow();
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

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

    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(controlsTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const buttonKeys = Object.keys(buttonScales);
    buttonKeys.forEach((key, index) => {
      Animated.timing(buttonScales[key], {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
    });

    startHideControlsTimer();
  };

  const hideControls = () => {
    Animated.parallel([
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(controlsTranslateY, {
        toValue: 100,
        duration: 300,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowControls(false);
    });

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

  const startHideControlsTimer = () => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }

    hideControlsTimerRef.current = setTimeout(() => {
      hideControls();
    }, 2000);
  };

  const animateButton = (buttonKey) => {
    const scale = buttonScales[buttonKey];
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.85,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatePlayButton = () => {
    Animated.sequence([
      Animated.spring(playButtonScale, {
        toValue: 0.9,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(playButtonScale, {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayPress = () => {
    togglePlayPause();
  };

  const toggleOrientation = () => {
    animateButton("rotate");
    // Orientation.getOrientation((orientation) => { ... });
    EOrientation.getOrientationAsync().then((orientation) => {
      if (
        orientation === EOrientation.Orientation.PORTRAIT_UP ||
        orientation === EOrientation.Orientation.PORTRAIT_DOWN
      ) {
        EOrientation.lockAsync(EOrientation.OrientationLock.LANDSCAPE);
        SystemNavigationBar.fullScreen(true);
        SystemNavigationBar.navigationHide();
        setIsLandscape(true);
      } else {
        EOrientation.lockAsync(EOrientation.OrientationLock.PORTRAIT_UP);
        SystemNavigationBar.fullScreen(false);
        SystemNavigationBar.navigationShow();
        setIsLandscape(false);
      }
    });
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const onProgressPress = (event) => {
    if (duration > 0) {
      const { locationX } = event.nativeEvent;
      const containerPadding = 50;
      const timeLabelsWidth = 100;
      const progressBarWidth = width - containerPadding - timeLabelsWidth;

      const clampedLocationX = Math.max(
        0,
        Math.min(progressBarWidth, locationX)
      );
      const progress = clampedLocationX / progressBarWidth;
      const seekTime = progress * duration;

      // Анімація прогрес-бару до нової позиції
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();

      seekToTime(seekTime);

      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const showEpisodesPanel = () => {
    setShowEpisodes(true);

    Animated.parallel([
      Animated.spring(episodesPanelTranslateX, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(episodesPanelOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    if (showControls) {
      startHideControlsTimer();
    }
  };

  const hideEpisodesPanel = () => {
    Animated.parallel([
      Animated.spring(episodesPanelTranslateX, {
        toValue: 300,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(episodesPanelOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEpisodes(false);
    });
  };

  const toggleEpisodes = () => {
    animateButton("episodes");
    if (showEpisodes) {
      hideEpisodesPanel();
    } else {
      showEpisodesPanel();
    }
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const onEpisodeSelect = (episode) => {
    setCurrentEpisode(episode);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    player.currentTime = 0;

    Animated.sequence([
      Animated.timing(episodesPanelOpacity, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(episodesPanelOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      hideEpisodesPanel();
    }, 500);

    if (showControls) {
      startHideControlsTimer();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Фон відео */}
      <TouchableOpacity
        style={{ flex: 1, width: "100%" }}
        onPress={toggleControls}
        activeOpacity={1}
      >
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
            contentFit={isLandscape && isZoomed ? "cover" : "contain"}
            onFirstFrameRender={() => {
              setIsLoading(false);
            }}
          />
        </View>

        {/* Оверлей завантаження */}
        {isLoading ? (
          <View
            style={styles.loadingOverlay}
            onLayout={() => {
              console.log("isLoading1", isLoading);
            }}
          >
            <ActivityIndicator size="large" color={appColor} />
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Заголовок */}
      {showControls && (
        <>
          {!isLocked ? (
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: controlsOpacity,
                  transform: [{ translateY: headerTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={[Black(0.8), Black(0.4), "transparent"]}
                style={styles.headerGradient}
              >
                <View style={styles.headerContent}>
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScales.back }],
                    }}
                  >
                    <CustomTouchableOpacity
                      style={styles.headerButton}
                      onPress={() => {
                        animateButton("back");
                        StatusBar.setHidden(false, "slide");
                        SystemNavigationBar.navigationShow();
                        setTimeout(() => {
                          navigation.goBack();
                          // Orientation.lockToPortrait();
                          EOrientation.lockAsync(
                            EOrientation.OrientationLock.PORTRAIT_UP
                          );
                        }, 100);
                      }}
                    >
                      <Icons.ArrowLeft size={32} color={white} />
                    </CustomTouchableOpacity>
                  </Animated.View>

                  <View style={styles.titleContainer}>
                    <Text style={[H4, { color: white }]} numberOfLines={1}>
                      {title || "Відео"}
                    </Text>
                    <Text style={[H6, { color: Gray(0.7) }]}>
                      Епізод {currentEpisode?.episode || "1"}
                    </Text>
                  </View>

                  <View style={styles.headerButtons}>
                    <Animated.View
                      style={{ transform: [{ scale: buttonScales.speed }] }}
                    >
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        onPress={openSpeedBottomSheet}
                      >
                        <Icons.Speedometer size={20} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>

                    <Animated.View
                      style={{ transform: [{ scale: buttonScales.pip }] }}
                    >
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        onPress={() => {
                          animateButton("pip");
                          if (showControls) {
                            startHideControlsTimer();
                          }
                          videoViewRef.current.startPictureInPicture();
                        }}
                      >
                        <Icons.PictureInPicture size={20} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>

                    <Animated.View
                      style={{ transform: [{ scale: buttonScales.episodes }] }}
                    >
                      <CustomTouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleEpisodes}
                      >
                        <Icons.Queue
                          size={20}
                          color={showEpisodes ? appColor : white}
                        />
                      </CustomTouchableOpacity>
                    </Animated.View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          ) : (
            <Animated.View style={styles.header} />
          )}
        </>
      )}

      {/* Нижні елементи керування */}
      {showControls && (
        <>
          {!isLocked ? (
            <Animated.View
              style={[
                styles.controlsContainer,
                {
                  opacity: controlsOpacity,
                  transform: [{ translateY: controlsTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={["transparent", Black(0.4), Black(0.9)]}
                style={styles.controlsGradient}
              >
                {/* Секція прогресу */}
                <View style={styles.progressSection}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }} />

                    <Animated.View
                      style={{
                        transform: [{ scale: buttonScales.lock }],
                      }}
                    >
                      <CustomTouchableOpacity
                        style={[styles.controlButton]}
                        onPress={() => {
                          animateButton("lock");
                          setIsLocked((prev) => !prev);
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.Lock type={"enabled"} size={24} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>
                  </View>
                  <View style={styles.progressContainer}>
                    <Text
                      style={[
                        H6,
                        { color: white, minWidth: 50, textAlign: "center" },
                      ]}
                    >
                      {formatTime(currentTime)}
                    </Text>

                    <TouchableOpacity
                      style={styles.progressBarContainer}
                      onPress={onProgressPress}
                      onLongPress={onProgressPress}
                      activeOpacity={0.8}
                    >
                      <View style={styles.progressBarBackground}>
                        <Animated.View
                          style={[
                            styles.progressBarFill,
                            {
                              width: progressAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                        <Animated.View
                          style={[
                            styles.progressThumb,
                            {
                              left: progressAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>

                    <Text
                      style={[
                        H6,
                        { color: white, minWidth: 50, textAlign: "center" },
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
                    <Animated.View
                      style={{ transform: [{ scale: buttonScales.volume }] }}
                    >
                      <CustomTouchableOpacity
                        style={styles.controlButton}
                        onPress={() => {
                          setVolumeTooltipVisible((v) => !v);
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.Volume
                          volume={volume * 100}
                          size={20}
                          color={white}
                        />
                        <VolumeWidget
                          visible={volumeTooltipVisible}
                          value={volume}
                          onChange={handleVolumeChange}
                          onClose={() => setVolumeTooltipVisible(false)}
                        />
                      </CustomTouchableOpacity>
                    </Animated.View>
                  </View>

                  {/* Центральні елементи керування відтворенням */}
                  <View style={styles.playControlGroup}>
                    {isLandscape && (
                      <CustomTouchableOpacity
                        style={styles.seekButton}
                        onPress={() => seekTo(-10)}
                        onLongPress={() => seekTo(-30)}
                      >
                        <Icons.ArrowCounterClockwise size={20} color={white} />
                      </CustomTouchableOpacity>
                    )}
                    <Animated.View
                      style={{ transform: [{ scale: buttonScales.skipBack }] }}
                    >
                      <CustomTouchableOpacity
                        style={styles.skipButton}
                        onPress={() => {
                          animateButton("skipBack");
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.SkipBack size={24} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>

                    <CustomTouchableOpacity
                      style={styles.playButtonContainer}
                      onPress={handlePlayPress}
                    >
                      <Animated.View
                        style={[
                          styles.playButton,
                          { transform: [{ scale: playButtonScale }] },
                        ]}
                      >
                        {player.playing ? (
                          <Icons.Pause size={32} color={white} />
                        ) : (
                          <Icons.Play size={32} color={white} />
                        )}
                      </Animated.View>
                    </CustomTouchableOpacity>

                    <Animated.View
                      style={{
                        transform: [{ scale: buttonScales.skipForward }],
                      }}
                    >
                      <CustomTouchableOpacity
                        style={styles.skipButton}
                        onPress={() => {
                          animateButton("skipForward");
                          if (showControls) {
                            startHideControlsTimer();
                          }
                        }}
                      >
                        <Icons.SkipForward size={24} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>

                    {isLandscape && (
                      <CustomTouchableOpacity
                        style={styles.seekButton}
                        onPress={() => seekTo(10)}
                        onLongPress={() => seekTo(30)}
                      >
                        <Icons.ArrowClockwise size={20} color={white} />
                      </CustomTouchableOpacity>
                    )}
                  </View>

                  {/* Праві елементи керування */}
                  <View style={styles.rightControlGroup}>
                    {isLandscape && (
                      <>
                        <Animated.View
                          style={{
                            transform: [{ scale: buttonScales.fit }],
                          }}
                        >
                          <CustomTouchableOpacity
                            style={styles.controlButton}
                            onPress={() => {
                              animateButton("fit");
                              setIsZoomed((prev) => !prev);
                              if (showControls) {
                                startHideControlsTimer();
                              }
                            }}
                          >
                            <Icons.FrameCorners
                              size={20}
                              color={isZoomed ? appColor : white}
                            />
                          </CustomTouchableOpacity>
                        </Animated.View>

                        <Animated.View
                          style={{
                            transform: [{ scale: buttonScales.download }],
                          }}
                        >
                          <CustomTouchableOpacity
                            style={styles.controlButton}
                            onPress={() => {
                              animateButton("download");
                              if (showControls) {
                                startHideControlsTimer();
                              }
                            }}
                          >
                            <Icons.DownloadSimple size={20} color={white} />
                          </CustomTouchableOpacity>
                        </Animated.View>
                      </>
                    )}

                    <Animated.View
                      style={{
                        transform: [{ scale: buttonScales.rotate }],
                      }}
                    >
                      <CustomTouchableOpacity
                        style={styles.controlButton}
                        onPress={toggleOrientation}
                      >
                        <Icons.DeviceRotate size={20} color={white} />
                      </CustomTouchableOpacity>
                    </Animated.View>
                  </View>
                </View>

                {/* Додаткові елементи керування */}
                <View style={styles.secondaryControls}>
                  <CustomTouchableOpacity
                    style={styles.controlButton}
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
            </Animated.View>
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
              }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: buttonScales.lock }],
                }}
              >
                <CustomTouchableOpacity
                  style={[styles.controlButton]}
                  onPress={() => {
                    animateButton("lock");
                    setIsLocked((prev) => !prev);
                    if (showControls) {
                      startHideControlsTimer();
                    }
                  }}
                >
                  <Icons.Lock type={"disabled"} size={24} color={appColor} />
                </CustomTouchableOpacity>
              </Animated.View>
            </View>
          )}
        </>
      )}

      {/* Панель епізодів */}
      {showEpisodes && (
        <Animated.View
          style={[
            styles.episodesPanel,
            {
              opacity: episodesPanelOpacity,
              transform: [{ translateX: episodesPanelTranslateX }],
            },
          ]}
        >
          <View style={styles.episodesPanelContent}>
            <View style={styles.episodesPanelHeader}>
              <CustomTouchableOpacity
                style={styles.episodesBackButton}
                onPress={hideEpisodesPanel}
              >
                <Icons.ArrowLeft size={20} color={white} />
              </CustomTouchableOpacity>
              <Text style={[H4, { color: white, flex: 1, marginLeft: 12 }]}>
                Епізоди
              </Text>
              <View style={styles.episodeCount}>
                <Text style={[H6, { color: appColor }]}>{episodes.length}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.episodesList}
              showsVerticalScrollIndicator={false}
            >
              {episodes.map((episode, index) => (
                <Animated.View
                  key={episode.episode}
                  style={{
                    opacity: episodesPanelOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [
                      {
                        translateX: episodesPanelOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <CustomTouchableOpacity
                    style={[
                      styles.episodeItem,
                      currentEpisode?.episode === episode.episode &&
                        styles.episodeItemActive,
                    ]}
                    onPress={() => onEpisodeSelect(episode)}
                  >
                    <View style={styles.episodeNumber}>
                      <Text
                        style={[
                          H6,
                          {
                            color:
                              currentEpisode?.episode === episode.episode
                                ? appColor
                                : Gray(0.7),
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
                                ? appColor
                                : white,
                            marginBottom: 4,
                          },
                        ]}
                      >
                        Епізод {episode.episode}
                      </Text>
                      <Text style={[H6, { color: Gray(0.5) }]}>
                        {episode.duration || "Тривалість невідома"}
                      </Text>
                    </View>

                    {currentEpisode?.episode === episode.episode && (
                      <View style={styles.nowPlayingIndicator}>
                        <View style={styles.nowPlayingDot} />
                      </View>
                    )}
                  </CustomTouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
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
          setQuality(nextQuality);
          const nextUrl = episodeInfo.qualitys[nextQuality];
          if (nextUrl) setCurrentUrl(nextUrl);
          qualitySheetRef.current?.close();
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
  progressSection: {
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 16,
    height: 40,
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
    marginBottom: 16,
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
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    const fileMatch = htmlContent.match(/file:\s*"([^"]+)"/);
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
  console.log("data:", data);
  return data;
}
