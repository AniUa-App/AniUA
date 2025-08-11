import { ImageBackground, SafeAreaView } from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import Styles from "../Styles/Styles";
import NetInfo from "@react-native-community/netinfo";
import { InternetError } from "./ErrorsWidgets";
import { StatusBar } from "react-native";
import SettingsStorage from "../Storage/SettingsStorage";
import { BlurView } from "expo-blur";

export default function DefaultScreenWidget({
  children,
  isCheckInternet = true,
  isConnection,
}) {
  const [isConnected, setIsConnected_] = useState(true);
  const [userConfig, setUserConfig] = useState(null);

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

  return (
    <SafeAreaView style={[Styles.defaultScreenWidget]}>
      {userConfig && userConfig.backgroundImage && (
        <ImageBackground
          source={{ uri: userConfig.backgroundImage }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      {userConfig && userConfig.blurBackground && (
        <BlurView
          intensity={userConfig.blurBackground}
          tint={userConfig.blurBackgroundTint}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      {isCheckInternet && !isConnected && (
        <InternetError onPress={checkConnection} />
      )}
      {children}
    </SafeAreaView>
  );
}
