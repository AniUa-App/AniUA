import { ImageBackground, SafeAreaView, View, StyleSheet } from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import Styles from "../Styles/Styles";
import { useThemeColors } from "../Global/useTheme";
import NetInfo from "@react-native-community/netinfo";
import { InternetError } from "./ErrorsWidgets";
import { StatusBar } from "react-native";
import SettingsStorage from "../Storage/SettingsStorage";
import { BlurView } from "expo-blur";
import { EventBus } from "../Global/EventBus";
import { useHeaderHeight } from "@react-navigation/elements";
import { useIsTablet, useIsTV, getTVSidebarWidth } from "../Styles/Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PerlinNoiseBackground from "./PerlinNoiseBackground";

export default function DefaultScreenWidget({
  children,
  isCheckInternet = true,
  isConnection,
  isNavBarPadding = true,
  hasManualHeader = false,
}) {
  const isTabletDevice = useIsTablet();
  const isTV = useIsTV();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected_] = useState(true);
  const [userConfig, setUserConfig] = useState(null);

  const navigatorHeaderHeight = useHeaderHeight?.() || 0;
  // Якщо header рендериться вручну (не через navigator), додаємо відступ
  const manualHeaderHeight = hasManualHeader
    ? Math.max(insets.top, StatusBar.currentHeight || 0) + 50
    : 0;
  const headerHeight = navigatorHeaderHeight || manualHeaderHeight;

  const isCustomisation = userConfig?.background?.isCustomisation ?? false;

  // Визначаємо padding для navbar з урахуванням системного навбару
  const getNavbarPadding = () => {
    // TV: sidebar navigation on the left, no bottom padding needed
    if (isTV) {
      return { paddingLeft: getTVSidebarWidth() };
    }

    const placedAt = userConfig?.navbar?.placedAt || "Внизу";
    const navbarStyle = userConfig?.navbar?.style || "MD3";
    const bottomInset = Math.max(insets.bottom, 8);

    if (navbarStyle !== "MD3") {
      return { paddingBottom: 80 + bottomInset };
    }

    switch (placedAt) {
      case "Праворуч":
        return { paddingRight: 70, paddingBottom: bottomInset };
      case "Ліворуч":
        return { paddingLeft: 70, paddingBottom: bottomInset };
      default:
        return { paddingBottom: bottomInset };
    }
  };

  const setIsConnected = (isConnected) => {
    setIsConnected_(isConnected);
    if (isConnection) {
      isConnection(isConnected);
    }
  };

  const checkConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
    } catch (error) {
      console.error("Помилка перевірки з'єднання:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    checkConnection();
    return () => unsubscribe();
  }, [checkConnection]);

  useEffect(() => {
    const userConfig = SettingsStorage.getParameter("userConfig");
    setUserConfig(userConfig);
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.on("userConfig", (config) => {
      setUserConfig(config);
    });
    return () => unsubscribe();
  }, []);

  const hasCustomBackground =
    isCustomisation &&
    userConfig?.background?.isImageBackground &&
    userConfig?.background?.image;

  const rawImage = userConfig?.background?.image;
  const imageUri =
    rawImage &&
    (rawImage.startsWith("file://") || rawImage.startsWith("content://")
      ? rawImage
      : `file://${rawImage}`);
  const backgroundOpacity = (userConfig?.background?.opacity ?? 100) / 100;

  const isBlurEnabled =
    isCustomisation && userConfig?.background?.isBlurBackground;
  const blurReductionFactor = userConfig?.background?.blurReductionFactor ?? 20;
  const blurIntensity = userConfig?.background?.blurIntensity ?? 80;

  return (
    <View
      style={{ flex: 1, backgroundColor: themeColors.background }}
      focusable={false}
    >
      {/* Фонове зображення на найвищому рівні */}
      {hasCustomBackground && imageUri && (
        <ImageBackground
          key={imageUri}
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, { opacity: backgroundOpacity }]}
          resizeMode="cover"
        />
      )}

      {/* Блюр поверх фонового зображення */}
      {hasCustomBackground && isBlurEnabled && (
        <BlurView
          intensity={blurIntensity}
          blurReductionFactor={blurReductionFactor}
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod="dimezisBlurView"
        />
      )}

      <SafeAreaView
        style={[
          Styles.defaultScreenWidget,
          {
            backgroundColor: "transparent",
            flexDirection: isTV || isTabletDevice ? "row" : "column",
          },
        ]}
        focusable={false}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View
          style={[
            { flex: 1, paddingTop: headerHeight },
            isNavBarPadding ? getNavbarPadding() : {},
          ]}
          focusable={false}
        >
          {isCheckInternet && !isConnected && (
            <InternetError onPress={checkConnection} />
          )}
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
