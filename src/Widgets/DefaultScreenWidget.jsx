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

export default function DefaultScreenWidget({
  isCheckInternet = true,
  isConnection,
  children,
}) {
  const themeColors = useThemeColors();
  const [isConnected, setIsConnected_] = useState(true);
  const [userConfig, setUserConfig] = useState(null);

  const headerHeight = useHeaderHeight?.() || 0;

  const isCustomisation = userConfig?.background?.isCustomisation ?? false;

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
    <>
      <SafeAreaView
        style={[
          Styles.defaultScreenWidget,
          {
            // Always keep an opaque background to avoid white flashes during transitions
            backgroundColor: themeColors.black,
          },
        ]}
      >
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
                backgroundColor: "transparent",
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
        <View style={{ flex: 1, paddingTop: headerHeight }}>
          {isCheckInternet && !isConnected && (
            <InternetError onPress={checkConnection} />
          )}
          {children}
        </View>
      </SafeAreaView>
    </>
  );
}
