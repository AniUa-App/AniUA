import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  // StatusBar,
} from "react-native";
import { StatusBar } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { WebView } from "react-native-webview";
import { Black } from "../Styles/Colors";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
// import Orientation from "react-native-orientation-locker";
import * as ScreenOrientation from "expo-screen-orientation";
import { BackHandler } from "react-native";
import Logger from "../Logger/Logger";

// Функція для визначення чи це планшет
const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const minDimension = Math.min(width, height);
  return minDimension >= 600; // Планшети зазвичай мають мінімальний розмір >= 600
};

export default function WebVideoPlayerScreen({ route }) {
  const { videoUrl, title } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      Logger.debug('WebVideoPlayer', 'onBackPress');
      navigation.goBack();
      StatusBar.setHidden(false, "slide");
      // Orientation.lockToPortrait();
      if (isTablet()) {
        ScreenOrientation.unlockAsync(); // На планшетах дозволяємо будь-яку орієнтацію
      } else {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        ); // На телефонах блокуємо портретну
      }
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    StatusBar.setHidden(true, "slide");
    // Orientation.unlockAllOrientations();
    ScreenOrientation.unlockAsync();

    return () => {
      backHandlerSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <WebView source={{ uri: videoUrl }} style={styles.video} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black(1),
  },
  video: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: Black(0.7),
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  title: {
    color: "white",
    marginLeft: 10,
    maxWidth: "80%",
  },
});
