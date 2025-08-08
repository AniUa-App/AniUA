import { SafeAreaView } from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import Styles from "../Styles/Styles";
import NetInfo from "@react-native-community/netinfo";
import { InternetError } from "./ErrorsWidgets";
import { StatusBar } from "react-native";

export default function DefaultScreenWidget({
  children,
  isCheckInternet = true,
  isConnection,
}) {
  const [isConnected, setIsConnected_] = useState(true);

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

  return (
    <SafeAreaView style={[Styles.defaultScreenWidget]}>
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
