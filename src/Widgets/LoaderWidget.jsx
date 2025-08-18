import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image, Text } from "react-native";
import { StatusBar } from "react-native";
import {
  AppColor,
  appColor,
  black,
  Black_1,
  loaderColor,
  White,
} from "../Styles/Colors";
import { H2, H3, H4, H5, H7 } from "../Styles/Fonts";
import FastImage from "react-native-fast-image";
import MainConfig from "../cfgs/MainConfig";
import SettingsStorage from "../Storage/SettingsStorage";

export default function Loader({ isNotFirstLaunch = false }) {
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
            style={[
              H2,
              {
                color: White(1),
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
        <Text style={[H4, { color: White(1) }]}>
          {`${appVersion || "1.0.0"}-${gitHash || "unknown"}`}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: black,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
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
  },
  versionText: {
    color: appColor,
    fontSize: 14,
    opacity: 0.8,
  },
});
