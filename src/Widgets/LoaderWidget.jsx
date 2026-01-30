import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, Animated, Image, Text } from "react-native";
import { StatusBar } from "react-native";
import { useThemeColors } from "../Global/useTheme";
import { H2, H4 } from "../Styles/Fonts";
import FastImage from "react-native-fast-image";
import MainConfig from "../cfgs/MainConfig";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import Icon from "../Styles/Icons";
export default function Loader({ isNotFirstLaunch = false }) {
  const colors = useThemeColors();
  const [fadeAnim] = useState(new Animated.Value(0));
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const [imageLoaded, setImageLoaded] = useState(false);

  // bounceInUp for welcome text
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(10)).current;
  const welcomeOpacity_1 = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY_1 = useRef(new Animated.Value(20)).current;

  // Отримуємо версію додатку з безпечною перевіркою
  const appVersion = MainConfig.devInfo.version || "1.0.0";
  const gitHash = MainConfig.devInfo.gitShortHash || "unknown";
  const expoChannel =
    (Updates && Updates.channel) ||
    Constants?.expoConfig?.updates?.channel ||
    "unknown";

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
    setTimeout(
      () => {
        Animated.parallel([
          Animated.timing(welcomeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(welcomeTranslateY, {
            toValue: 0,
            bounciness: 14,
            speed: 6,
            useNativeDriver: true,
          }),
        ]).start();
      },
      !isNotFirstLaunch ? 0 : 1000
    );
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeOpacity_1, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(welcomeTranslateY_1, {
          toValue: 0,
          bounciness: 14,
          speed: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        },
        logo: {
          width: 300,
          height: 300,
        },
        versionContainer: {
          position: "absolute",
          bottom: 20,
          alignItems: "center",
          flexDirection: "row",
          gap: 5,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {!imageLoaded && <View style={[styles.logo]} />}

      <Animated.View
        style={{
          opacity: welcomeOpacity,
          transform: [{ translateY: welcomeTranslateY }],
        }}
      >
        <FastImage
          source={require("../../assets/AniUA-Logo.png")}
          style={[
            styles.logo,
            !imageLoaded && { position: "absolute" },
            { marginTop: !isNotFirstLaunch ? -100 : 30 },
          ]}
          onLoadEnd={() => setImageLoaded(true)}
        />
      </Animated.View>

      {!isNotFirstLaunch && (
        <Animated.View
          style={{
            opacity: welcomeOpacity_1,
            transform: [{ translateY: welcomeTranslateY_1 }],
            position: "absolute",
            alignSelf: "center",
            marginTop: 220,
            flexDirection: "column",
          }}
        >
          <Text
            selectable={true}
            style={[
              H2,
              {
                color: colors.text,
                fontSize: 64,
              },
            ]}
          >
            {`Вітаємо`}
          </Text>
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.versionContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Text selectable={true} style={[H4, { color: colors.text }]}>
          {`${appVersion || "1.0.0"}-${gitHash || "unknown"}-${expoChannel !== "release" ? `${expoChannel}` : ""}`}
        </Text>
        {expoChannel !== "release" && (
          <Icon.WarningCircleIcon color={"red"} size={24} style={{ top: 3 }} />
        )}
      </Animated.View>
    </View>
  );
}
