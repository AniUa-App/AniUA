import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ScreenController from "./src/Screens/ScreenController/ScreenController";
import { black, white } from "./src/Styles/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import Loader from "./src/Widgets/LoaderWidget";
// import Orientation from "react-native-orientation-locker";
import * as ScreenOrientation from "expo-screen-orientation";
// import SystemNavigationBar from 'react-native-system-navigation-bar';
import SystemNavigationBar from "react-native-system-navigation-bar";
import Color from "color";
import SettingsStorage from "./src/Storage/SettingsStorage";
import NotificationPermission from "./src/Notifications/NotificationPermission";
import * as FileSystem from "expo-file-system";
import ErrorBoundary from "./src/Global/ErrorBoundary";
import { ErrorTestComponent } from "./src/Global/ErrorTestComponent";
import MainConfig from "./src/cfgs/MainConfig";
import AndroidHelper from "./src/Global/AndroidHelper";
import AppLogger from "./src/Logger/AppLogger";
import AllowTheVideoFolder, {
  getDocumentDirectory,
  getVideoDir,
} from "./src/FIleSystem/FileSystem";
import { useCustomFonts } from "./src/Styles/Fonts";
import { RootSiblingParent } from "react-native-root-siblings";
import { ThemeProvider } from "./src/Global/ThemeContext";
import { EventBus } from "./src/Global/EventBus";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isErrorBoundary, setIsErrorBoundary] = useState(false);
  const [isActivityReady, setIsActivityReady] = useState(false);

  // Завантажуємо кастомні шрифти (хук має бути на верхньому рівні!)
  const fontsLoaded = useCustomFonts();

  MainConfig.debug.isDebug = __DEV__;

  if (MainConfig.debug.isDebug) {
    require("./src/cfgs/ReactotronConfig");
  }

  if (SettingsStorage.getParameter("isDebug")) {
    MainConfig.debug.isDebug = SettingsStorage.getParameter("isDebug");
  } else if (!SettingsStorage.getParameter("isDebug")) {
    SettingsStorage.setParameter("isDebug", MainConfig.debug.isDebug);
  }

  // Функція для синхронізації стану з MainConfig
  MainConfig.updateErrorBoundaryState = (value) => {
    setIsErrorBoundary(value);
  };

  // Функція для безпечного виконання операцій з SystemNavigationBar
  const setupNavigationBar = async () => {
    return AndroidHelper.safeExecute(async () => {
      const navBarType = SettingsStorage.getParameter(
        "SystemNavigationBar_type"
      );

      if (navBarType === "hidden") {
        SystemNavigationBar.navigationHide();
      } else if (navBarType === "dark" || !navBarType) {
        SystemNavigationBar.navigationShow();
        const blackHex = Color(black).hex();
        SystemNavigationBar.setNavigationColor(blackHex, "dark", "navigation");
        SystemNavigationBar.setBarMode("dark", "navigation");
      } else if (navBarType === "light") {
        SystemNavigationBar.navigationShow();
        const whiteHex = Color(white).hex();
        SystemNavigationBar.setNavigationColor(whiteHex, "light", "navigation");
        SystemNavigationBar.setBarMode("light", "navigation");
      }
    }, "Помилка налаштування навігаційної панелі");
  };

  useEffect(() => {
    console.log(
      "SettingsStorage.getParameter('userConfig.recommendations')",
      SettingsStorage.getParameter("userConfig.recommendations").length === 0
    );
    if (
      SettingsStorage.getParameter("userConfig.recommendations").length === 0
    ) {
      SettingsStorage.setParameter("userConfig.recommendations", {
        isEnabled: true,
        isDefaultBigBanner: true,
      });
    }

    setIsErrorBoundary(
      MainConfig.debug.isErrorBoundary ||
        SettingsStorage.getParameter("isErrorBoundary") ||
        false
    );

    const initApp = async () => {
      try {
        AppLogger.logAppInit("Початок ініціалізації додатка");

        // Базова ініціалізація без залежності від activity

        AppLogger.logAppInit("Блокування орієнтації");
        // Orientation.lockToPortrait();
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );

        AppLogger.logAppInit("Перевірка дозволів.");
        await NotificationPermission();
        await AllowTheVideoFolder();
        console.log("video folder ", await getVideoDir());

        // Додаткова затримка для забезпечення готовності activity
        AppLogger.logAppInit("Очікування готовності Android activity");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Позначаємо activity як готову
        setIsActivityReady(true);
        AppLogger.logAppInit("Android activity готова");

        // Виконуємо операції, що потребують activity, асинхронно
        AppLogger.logAppInit("Запуск асинхронних налаштувань");
        Promise.all([setupNavigationBar()])
          .then(() => {
            AppLogger.logAppInit("Всі налаштування успішно застосовані");
          })
          .catch((error) => {
            AppLogger.logAppInit(
              "Деякі налаштування не вдалося застосувати",
              false,
              error
            );
          });
      } catch (error) {
        AppLogger.logAppInit("Критична помилка ініціалізації", false, error);
      } finally {
        // Зменшуємо час завантаження до 1.5 секунд
        setTimeout(() => {
          AppLogger.logAppInit("Завершення завантаження");
          setIsLoading(false);
        }, 1500);
      }
    };

    initApp();
  }, []);
  console.log("App render:", { isLoading, isErrorBoundary, isActivityReady });
  console.log(SettingsStorage.getParameter("userConfig"), "userConfig");

  // Показуємо завантаження поки не завантажені шрифти або додаток ще ініціалізується
  if (!fontsLoaded || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: black }}>
        <BottomSheetModalProvider style={{ flex: 1, backgroundColor: black }}>
          <Loader />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: black }}>
      <BottomSheetModalProvider style={{ flex: 1, backgroundColor: black }}>
        <RootSiblingParent>
          <ThemeProvider>
            <ScreenController />
            {/* {isErrorBoundary && <ErrorTestComponent />} */}
          </ThemeProvider>
        </RootSiblingParent>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
