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
import { useIsTabletLandscape } from "../Styles/Responsive";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DefaultScreenWidget({
  children,
  isCheckInternet = true,
  isConnection,
  isNavBarPadding = false,
}) {
  const isTL = useIsTabletLandscape();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected_] = useState(true);
  const [userConfig, setUserConfig] = useState(null);

  const headerHeight = useHeaderHeight?.() || 0;

  const isCustomisation = userConfig?.background?.isCustomisation ?? false;

  // Визначаємо padding для navbar з урахуванням системного навбару
  const getNavbarPadding = () => {
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

  return (
    <SafeAreaView
      style={[
        Styles.defaultScreenWidget,
        {
          // Always keep an opaque background to avoid white flashes during transitions
          backgroundColor: themeColors.black,
          flexDirection: isTL ? "row" : "column",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        {(() => {
          const rawImage = userConfig?.background?.image;
          const imageUri =
            rawImage &&
            (rawImage.startsWith("file://") || rawImage.startsWith("content://")
              ? rawImage
              : `file://${rawImage}`);

          return isCustomisation &&
            userConfig?.background?.isImageBackground &&
            imageUri ? (
            <ImageBackground
              key={imageUri}
              source={{ uri: imageUri }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null;
        })()}
        {(() => {
          const isBlurEnabled =
            isCustomisation && userConfig?.background?.isBlurBackground;
          const blurReductionFactor =
            userConfig?.background?.blurReductionFactor || 80;
          const blurTint = userConfig?.background?.blurIntensity || 80;

          return isBlurEnabled ? (
            <BlurView
              intensity={blurTint}
              blurReductionFactor={blurReductionFactor}
              style={[StyleSheet.absoluteFill]}
              experimentalBlurMethod="dimezisBlurView"
            />
          ) : null;
        })()}
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
        >
          {isCheckInternet && !isConnected && (
            <InternetError onPress={checkConnection} />
          )}
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}
