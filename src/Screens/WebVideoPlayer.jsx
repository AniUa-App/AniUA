import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  // StatusBar,
} from "react-native";
import { StatusBar } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
// import Orientation from "react-native-orientation-locker";
import * as ScreenOrientation from "expo-screen-orientation";
import { BackHandler } from "react-native";
import Logger from "../Logger/Logger";
import { setupNavigationBar } from "../../App";
import { isTV } from "../Styles/Responsive";
import { useWebVideoPlayerStyles } from "../Styles/components/Screens/WebVideoPlayerStyles";

// Функція для визначення чи це планшет
const isTablet = () => {
  const { width, height } = Dimensions.get("window");
  const minDimension = Math.min(width, height);
  return minDimension >= 600;
};

export default function WebVideoPlayerScreen({ route }) {
  const s = useWebVideoPlayerStyles();
  const { videoUrl, title } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      StatusBar.setHidden(false, "slide");
      if (isTV()) {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } else if (isTablet()) {
        ScreenOrientation.unlockAsync();
      } else {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      }

      setupNavigationBar();
      SystemNavigationBar.fullScreen(false);
      SystemNavigationBar.navigationShow();
      return true;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    SystemNavigationBar.fullScreen(true);
    SystemNavigationBar.navigationHide();
    StatusBar.setHidden(true, "slide");
    ScreenOrientation.unlockAsync();

    return () => {
      backHandlerSubscription.remove();
    };
  }, []);

  return (
    <View style={s.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <WebView source={{ uri: videoUrl }} style={s.video} />
    </View>
  );
}
