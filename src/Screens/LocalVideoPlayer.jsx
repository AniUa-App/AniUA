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
import { BackHandler, StatusBar } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";
// import Orientation from "react-native-orientation-locker";
import * as ScreenOrientation from "expo-screen-orientation";
import LinearGradient from "react-native-linear-gradient";
import Icons from "../Styles/Icons";
import { black, Black, Gray, white, appColor } from "../Styles/Colors";
import { H3, H4, H5, H6 } from "../Styles/Fonts";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity as CustomTouchableOpacity } from "../Widgets/Button";
import Video from "react-native-video";
import { getPlayerDataFrom_MOON_Player } from "../Notifications/VideoDownloader";
import { getPlayerDataFrom_ASHDI_Player } from "../Notifications/VideoDownloader";
import M3U8FileParser from "m3u8-file-parser";
import axios from "axios";
import SpeedBottomSheet from "../Widgets/VideoPlayer/SpeedBottomSheetWidget";

const { width, height } = Dimensions.get("window");

export default function LocalVideoPlayerScreen({ route }) {
  const navigation = useNavigation();

  const { __episodes, __currentEpisode, __anime } = route.params;
  const title = __anime?.title_ua || __anime?.title_en || "Назва аніме";
  const episodes = __episodes || [];

  const [episodeInfo, setEpisodeInfo] = useState(null);

  const videoRef = useRef(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(__currentEpisode);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const seekTimeout = useRef(null);

  // Animated values
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const controlsTranslateY = useRef(new Animated.Value(0)).current;
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const episodesPanelTranslateX = useRef(new Animated.Value(300)).current;
  const episodesPanelOpacity = useRef(new Animated.Value(0)).current;
  const castStatusScale = useRef(new Animated.Value(0)).current;

  // Button animations
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
  }).current;

  const [currentUrl, setCurrentUrl] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isCasting, setIsCasting] = useState(false);
  const [castDevice, setCastDevice] = useState(null);

  // Speed bottom sheet ref
  const speedSheetRef = useRef(null);

  // Timer for hiding controls
  const hideControlsTimerRef = useRef(null);

  // Helper functions
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Video event handlers
  const onVideoLoad = (data) => {
    setDuration(data.duration);
    setIsBuffering(false);
  };

  const onVideoProgress = (data) => {
    setCurrentTime(data.currentTime);
    const progress = data.currentTime / duration;
    Animated.timing(progressAnimation, {
      toValue: progress || 0,
      duration: 50, // Зменшена тривалість для швидшого оновлення
      useNativeDriver: false,
    }).start();
  };

  const onVideoEnd = () => {
    setIsPlaying(false);
    // Auto play next episode
    const currentIndex = episodes.findIndex(
      (ep) => ep.episode === currentEpisode.episode
    );
    if (currentIndex >= 0 && currentIndex < episodes.length - 1) {
      setCurrentEpisode(episodes[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  const onVideoBuffer = ({ isBuffering }) => {
    setIsBuffering(isBuffering);
  };

  const onVideoSeek = () => {
    // Приховуємо індикатор завантаження після завершення перемотки
    setTimeout(() => {
      setIsBuffering(false);
    }, 500);
  };

  // Функція для точного seek до конкретного часу
  const seekToTime = (time) => {
    if (videoRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(newTime);
      setIsBuffering(true);

      if (videoRef.current) {
        videoRef.current.seek(newTime, 50);
      }

      // Reset hide timer when user interacts with controls
      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const onVideoError = (error) => {
    console.error("Video error:", error);
  };

  // Control functions
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    animatePlayButton();
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const seekTo = (seconds) => {
    if (videoRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      setCurrentTime(newTime); // Оновлюємо UI відразу для швидкої реакції
      setIsBuffering(true); // Показуємо індикатор завантаження

      // Миттєвий seek без затримки
      if (videoRef.current) {
        videoRef.current.seek(newTime, 25); // Зменшена точність для швидшості
      }

      // Reset hide timer when user interacts with controls
      if (showControls) {
        startHideControlsTimer();
      }
    }
  };

  const toggleVolume = () => {
    animateButton("volume");
    setVolume(volume > 0 ? 0 : 1.0);
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const openSpeedBottomSheet = () => {
    animateButton("speed");
    speedSheetRef.current?.present();
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const changePlaybackRate = (newRate) => {
    setRate(newRate);
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      console.log("onBackPress");
      navigation.goBack();
      StatusBar.setHidden(false, "slide");
      SystemNavigationBar.navigationShow();
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      return true;
    };

    // const onOrientationChange = (orientation) => {
    //   console.log("Orientation changed:", orientation);
    //   if (
    //     orientation === "LANDSCAPE-LEFT" ||
    //     orientation === "LANDSCAPE-RIGHT"
    //   ) {
    //     SystemNavigationBar.navigationHide();
    //   } else {
    //     SystemNavigationBar.navigationShow();
    //   }
    // };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // Додаємо слухач зміни орієнтації
    const orientationSubscription =
      ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
        const current = orientationInfo.orientation;
        if (
          current === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          current === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
        ) {
          SystemNavigationBar.navigationHide();
        } else {
          SystemNavigationBar.navigationShow();
        }
      });

    StatusBar.setHidden(true, "slide");
    SystemNavigationBar.navigationHide();

    // Перевіряємо поточну орієнтацію
    // Orientation.getOrientation((orientation) => { ... });
    ScreenOrientation.getOrientationAsync().then((orientation) => {
      if (
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      ) {
        SystemNavigationBar.navigationHide();
      } else {
        SystemNavigationBar.navigationShow();
      }
    });

    // Orientation.unlockAllOrientations();
    ScreenOrientation.unlockAsync();

    // Initial show animation
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
      ScreenOrientation.removeOrientationChangeListener(
        orientationSubscription
      );
      StatusBar.setHidden(false, "slide");
      SystemNavigationBar.navigationShow();
      // SystemNavigationBar.fullScreen(false);
      // Orientation.lockToPortrait();
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const showControlsWithAnimation = () => {
    setShowControls(true);

    Animated.parallel([
      // Opacity animation
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // Header slide down
      Animated.spring(headerTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      // Controls slide up
      Animated.spring(controlsTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger button animations
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

    // Start hide timer
    startHideControlsTimer();
  };

  const hideControls = () => {
    Animated.parallel([
      // Opacity animation
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      // Header slide up
      Animated.timing(headerTranslateY, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      // Controls slide down
      Animated.timing(controlsTranslateY, {
        toValue: 100,
        duration: 300,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowControls(false);
    });

    // Clear timer
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
    // Clear existing timer
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }

    // Start new timer
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
    ScreenOrientation.getOrientationAsync().then((orientation) => {
      if (
        orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
        orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
      ) {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } else {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }
    });
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const onProgressPress = (event) => {
    if (duration > 0) {
      const { locationX } = event.nativeEvent;
      // Більш точний розрахунок ширини прогрес-бару
      const containerPadding = 50; // 25px з кожного боку
      const timeLabelsWidth = 100; // Ширина міток часу
      const progressBarWidth = width - containerPadding - timeLabelsWidth;

      // Обмежуємо locationX в межах прогрес-бару
      const clampedLocationX = Math.max(
        0,
        Math.min(progressBarWidth, locationX)
      );
      const progress = clampedLocationX / progressBarWidth;
      const seekTime = progress * duration;

      seekToTime(seekTime);

      // Reset hide timer when user interacts with controls
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

    // Reset hide timer when user interacts with controls
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
    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const onEpisodeSelect = (episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(true);

    // Animate episode selection
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

    // Reset hide timer when user interacts with controls
    if (showControls) {
      startHideControlsTimer();
    }
  };

  const showCastStatus = () => {
    Animated.spring(castStatusScale, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const hideCastStatus = () => {
    Animated.spring(castStatusScale, {
      toValue: 0,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  // Simulate cast status change
  // useEffect(() => {
  //   if (isCasting) {
  //     showCastStatus()
  //   } else {
  //     hideCastStatus()
  //   }
  // }, [isCasting])

  // Update video when episode changes
  useEffect(() => {
    const initialize = async () => {
      setCurrentEpisode(__currentEpisode);
      const episodeInfo = await getEpisodeInfo(currentEpisode?.video_url);
      setEpisodeInfo(episodeInfo);
      setCurrentUrl(
        episodeInfo?.qualitys[Object.keys(episodeInfo?.qualitys)[0]]
      );
    };
    initialize();
  }, [currentEpisode]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Video Background */}
      <TouchableOpacity
        style={styles.videoTouchArea}
        onPress={toggleControls}
        activeOpacity={1}
      >
        {isCasting ? (
          <View style={styles.castingIndicator}>
            <Icons.Cast size={60} color={appColor} />
            <Text style={[H4, { color: white, marginTop: 16 }]}>
              Трансляція на {castDevice || "пристрій"}
            </Text>
            <Text style={[H6, { color: Gray(0.7), marginTop: 8 }]}>
              Використовуйте телефон як пульт
            </Text>
          </View>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Video
              ref={videoRef}
              source={{ uri: currentUrl }}
              style={[
                {
                  width: "100%",
                  aspectRatio: 9 / 16, // Вертикальне співвідношення сторін
                  backgroundColor: black,
                },
              ]}
              paused={!isPlaying}
              volume={volume}
              rate={rate}
              resizeMode="contain" // Важливо для збереження пропорцій відео
              onLoad={onVideoLoad}
              onProgress={onVideoProgress}
              onEnd={onVideoEnd}
              onBuffer={onVideoBuffer}
              onSeek={onVideoSeek}
              onError={onVideoError}
              progressUpdateInterval={250}
              controls={false}
              disableFocus={true}
              preload="auto"
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              maxBitRate={2000000}
              reportBandwidth={true}
              allowsExternalPlayback={false}
              playWhenInactive={false}
              playInBackground={false}
            />
          </View>
        )}

        {/* Loading overlay */}
        {isBuffering && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={appColor} />
          </View>
        )}
      </TouchableOpacity>

      {/* Header */}
      {showControls && (
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
                style={{ transform: [{ scale: buttonScales.back }] }}
              >
                <CustomTouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    animateButton("back");
                    StatusBar.setHidden(false, "slide");
                    NavigationBar.setVisibilityAsync("visible");
                    // SystemNavigationBar.navigationShow();
                    setTimeout(() => {
                      navigation.goBack();
                      // Orientation.lockToPortrait();
                      ScreenOrientation.lockAsync(
                        ScreenOrientation.OrientationLock.PORTRAIT_UP
                      );
                    }, 100);
                  }}
                >
                  <Icons.ArrowLeft size={24} color={white} />
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

                {/* <Animated.View
                  style={{transform: [{scale: buttonScales.subtitles}]}}>
                  <CustomTouchableOpacity
                    style={styles.headerButton}
                    onPress={() => animateButton('subtitles')}>
                    <Icons.Subtitles type="enabled" size={20} color={white} />
                  </CustomTouchableOpacity>
                </Animated.View> */}

                <Animated.View
                  style={{ transform: [{ scale: buttonScales.pip }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                      animateButton("pip");
                      // Reset hide timer when user interacts with controls
                      if (showControls) {
                        startHideControlsTimer();
                      }
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
      )}

      {/* Cast Status */}
      {isCasting && showControls && (
        <Animated.View
          style={[
            styles.castStatus,
            {
              opacity: controlsOpacity,
              transform: [{ scale: castStatusScale }],
            },
          ]}
        >
          <View style={styles.castStatusContent}>
            <Icons.Cast size={16} color={appColor} />
            <Text style={[H6, { color: white, flex: 1, marginLeft: 12 }]}>
              Трансляція на {castDevice}
            </Text>
            <CustomTouchableOpacity style={styles.stopCastButton}>
              <Text style={[H6, { color: white }]}>Зупинити</Text>
            </CustomTouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Bottom Controls */}
      {showControls && (
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
            {/* Progress Section */}
            <View style={styles.progressSection}>
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
                  activeOpacity={1}
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

            {/* Main Controls */}
            <View style={styles.mainControls}>
              {/* Left Controls */}
              <View style={styles.leftControlGroup}>
                <Animated.View
                  style={{ transform: [{ scale: buttonScales.lock }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      animateButton("lock");
                      // Reset hide timer when user interacts with controls
                      if (showControls) {
                        startHideControlsTimer();
                      }
                    }}
                  >
                    <Icons.Lock type="enabled" size={20} color={white} />
                  </CustomTouchableOpacity>
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ scale: buttonScales.volume }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleVolume}
                  >
                    <Icons.Volume
                      volume={volume * 100}
                      size={20}
                      color={white}
                    />
                  </CustomTouchableOpacity>
                </Animated.View>
              </View>

              {/* Center Play Controls */}
              <View style={styles.playControlGroup}>
                <CustomTouchableOpacity
                  style={styles.seekButton}
                  onPress={() => seekTo(-10)}
                  onLongPress={() => seekTo(-30)}
                >
                  <Icons.ArrowCounterClockwise size={20} color={white} />
                </CustomTouchableOpacity>

                <Animated.View
                  style={{ transform: [{ scale: buttonScales.skipBack }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.skipButton}
                    onPress={() => {
                      animateButton("skipBack");
                      // Reset hide timer when user interacts with controls
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
                    {isPlaying ? (
                      <Icons.Pause size={32} color={white} />
                    ) : (
                      <Icons.Play size={32} color={white} />
                    )}
                  </Animated.View>
                </CustomTouchableOpacity>

                <Animated.View
                  style={{ transform: [{ scale: buttonScales.skipForward }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.skipButton}
                    onPress={() => {
                      animateButton("skipForward");
                      // Reset hide timer when user interacts with controls
                      if (showControls) {
                        startHideControlsTimer();
                      }
                    }}
                  >
                    <Icons.SkipForward size={24} color={white} />
                  </CustomTouchableOpacity>
                </Animated.View>

                <CustomTouchableOpacity
                  style={styles.seekButton}
                  onPress={() => seekTo(10)}
                  onLongPress={() => seekTo(30)}
                >
                  <Icons.ArrowClockwise size={20} color={white} />
                </CustomTouchableOpacity>
              </View>

              {/* Right Controls */}
              <View style={styles.rightControlGroup}>
                <Animated.View
                  style={{ transform: [{ scale: buttonScales.download }] }}
                >
                  <CustomTouchableOpacity
                    style={styles.controlButton}
                    onPress={() => {
                      animateButton("download");
                      // Reset hide timer when user interacts with controls
                      if (showControls) {
                        startHideControlsTimer();
                      }
                    }}
                  >
                    <Icons.DownloadSimple size={20} color={white} />
                  </CustomTouchableOpacity>
                </Animated.View>

                <Animated.View
                  style={{ transform: [{ scale: buttonScales.rotate }] }}
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

            {/* Secondary Controls */}
            <View style={styles.secondaryControls}>
              <View style={styles.centerInfo}>
                <Text style={styles.qualityText}>HD</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Episodes Panel */}
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

      {/* Speed Bottom Sheet */}
      <SpeedBottomSheet
        sheetRef={speedSheetRef}
        currentRate={rate}
        onRateChange={changePlaybackRate}
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
  videoPlayer: {
    width: "100%",
    height: "100%",
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
  },
  castingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Black(0.95),
  },

  // Header Styles
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

  // Cast Status
  castStatus: {
    position: "absolute",
    top: 100,
    left: 25,
    right: 25,
    zIndex: 9,
  },
  castStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Black(0.8),
    padding: 12,
    borderRadius: 8,
  },
  stopCastButton: {
    backgroundColor: appColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // Controls Container
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

  // Progress Section
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
    height: 40, // Збільшена висота для кращого натискання
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
  },

  // Main Controls
  mainControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  leftControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  rightControlGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 4,
  },

  // Play Controls
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

  // Secondary Controls
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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

  // Episodes Panel
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
    console.error("Ошибка загрузки:", error);
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
