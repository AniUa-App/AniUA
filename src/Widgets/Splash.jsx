import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Animated,
  Easing,
  Text,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "react-native";
import { H2, H4 } from "../Styles/Fonts";
import { useSplashStyles } from "../Styles/components/SplashStyles";
import FastImage from "react-native-fast-image";
import MainConfig from "../cfgs/MainConfig";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import Icon from "../Styles/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Hikka from "../../assets/hikka.svg";

export default function Loader({}) {
  const insets = useSafeAreaInsets();
  const styles = useSplashStyles();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [fadeAnim] = useState(new Animated.Value(0));
  const translateYAnim = useRef(new Animated.Value(screenHeight / 2)).current;
  const versionScale = useRef(new Animated.Value(1.8)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  // лого з'являється знизу з zoom-out ефектом
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(
    new Animated.Value(screenHeight / 2),
  ).current;
  const welcomeScale = useRef(new Animated.Value(1.8)).current;
  const welcomeOpacity_1 = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY_1 = useRef(
    new Animated.Value(screenHeight / 2),
  ).current;
  const welcomeScale_1 = useRef(new Animated.Value(1.8)).current;

  // staggered partners: Hikka зліва, Moon справа
  const hikkaOpacity = useRef(new Animated.Value(0)).current;
  const hikkaTranslateX = useRef(new Animated.Value(-screenWidth / 2)).current;
  const hikkaScale = useRef(new Animated.Value(1.8)).current;
  const moonOpacity = useRef(new Animated.Value(0)).current;
  const moonTranslateX = useRef(new Animated.Value(screenWidth / 2)).current;
  const moonScale = useRef(new Animated.Value(1.8)).current;

  // Отримуємо версію додатку з безпечною перевіркою
  const appVersion = MainConfig.devInfo.version || "1.0.0";
  const gitHash = MainConfig.devInfo.gitShortHash || "unknown";
  const expoChannel =
    (Updates && Updates.channel) ||
    Constants?.expoConfig?.updates?.channel ||
    "unknown";
  const isBeta = () => {
    return !["g_release", "release"].includes(expoChannel);
  };
  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(versionScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    setTimeout(() => {
      // 1. Лого з'являється знизу з zoom-out
      Animated.parallel([
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Hikka вилітає зліва (після лого + 200ms паузи)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(hikkaOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(hikkaTranslateX, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(hikkaScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, 700);

      // 3. Moon вилітає справа (після Hikka + 200ms паузи)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(moonOpacity, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(moonTranslateX, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(moonScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);
    }, 0);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeOpacity_1, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeTranslateY_1, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeScale_1, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {!imageLoaded && <View style={styles.logo()} />}

      <Animated.View
        style={{
          opacity: welcomeOpacity,
          transform: [
            { translateY: welcomeTranslateY },
            { scale: welcomeScale },
          ],
        }}
      >
        <FastImage
          source={require("../../assets/AniUA-Logo.png")}
          style={[styles.logo(), !imageLoaded && { position: "absolute" }]}
          onLoadEnd={() => setImageLoaded(true)}
        />

        {/* partners */}
        <View style={styles.partnersRow}>
          <Animated.View
            style={{
              opacity: hikkaOpacity,
              transform: [
                { translateX: hikkaTranslateX },
                { scale: hikkaScale },
              ],
            }}
          >
            <Hikka
              width={styles.hikkaIcon.width}
              height={styles.hikkaIcon.height}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: moonOpacity,
              transform: [{ translateX: moonTranslateX }, { scale: moonScale }],
            }}
          >
            <FastImage
              source={require("../../assets/Moon.png")}
              style={[
                styles.moonIcon,
                !imageLoaded && { position: "absolute" },
              ]}
              onLoadEnd={() => setImageLoaded(true)}
            />
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.versionContainer(insets.bottom),
          {
            opacity: fadeAnim,
            transform: [
              { translateY: translateYAnim },
              { scale: versionScale },
            ],
          },
        ]}
      >
        <Text selectable={true} style={[H4, styles.versionText]}>
          {`${appVersion || "1.0.0"}${`-${gitHash}` || "unknown"}${isBeta() ? `-${expoChannel}` : ""}`}
        </Text>
        {isBeta() && (
          <Icon.WarningCircleIcon
            color={"red"}
            size={24}
            style={styles.warningIcon}
          />
        )}
      </Animated.View>
    </View>
  );
}
