import React, { useState, useEffect, use } from "react";
import { View, Text, Linking, AppState } from "react-native";
import ScreenController from "./src/Screens/ScreenController/ScreenController";
import { background, text, primary } from "./src/Styles/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Loader from "./src/Widgets/Splash";
import * as ScreenOrientation from "expo-screen-orientation";
import SystemNavigationBar from "react-native-system-navigation-bar";
import Color from "color";
import SettingsStorage from "./src/Storage/SettingsStorage";
import NotificationPermission from "./src/Notifications/NotificationPermission";
import * as FileSystem from "expo-file-system";
import ErrorBoundary from "./src/Global/ErrorBoundary";
import { ErrorTestComponent } from "./src/Global/ErrorTestComponent";
import MainConfig from "./src/cfgs/MainConfig";
import AndroidHelper from "./src/Global/AndroidHelper";
import Logger from "./src/Logger/Logger";
import AllowTheVideoFolder, {
  getDocumentDirectory,
  getVideoDir,
} from "./src/FIleSystem/FileSystem";
import { H2, H3, H5, H6, useCustomFonts } from "./src/Styles/Fonts";
import { RootSiblingParent } from "react-native-root-siblings";
import { ThemeProvider } from "./src/Global/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { EventBus } from "./src/Global/EventBus";
import * as Application from "expo-application";
import { isTablet, isTV } from "./src/Styles/Responsive";
import { useSnackbar, SnackbarLink } from "./src/Components/Snackbar";
import { set } from "date-fns";
import { se } from "date-fns/locale";
import Markdown from "react-native-markdown-display";
import { fonts } from "@rneui/base";
import { getCurrentRouteName } from "./src/Global/NavigationService";
import { Log } from "ffmpeg-kit-react-native";
import { HikkaAuthService } from "./src/Services/HikkaAuthService";
import { AniuaAuthService } from "./src/Services/AniuaAuthService";
import AniuaApi from "./src/Api/AniuaApi";
import UpdateCheckerService from "./src/Services/UpdateCheckerService";
import usePushNotifications from "./src/Hooks/usePushNotifications";

// On TV, prevent Text elements from being focusable via D-pad
if (isTV()) {
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.focusable = false;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isErrorBoundary, setIsErrorBoundary] = useState(false);
  const [isActivityReady, setIsActivityReady] = useState(false);
  const { snackbar, showSnackbar, snackbarTop, showSnackbarTop } =
    useSnackbar();
  const [currentAppVersion, setCurrentAppVersion] = useState(
    SettingsStorage.getParameter("currentVersion") ||
      `${MainConfig.devInfo.version}-${MainConfig.devInfo.gitShortHash || MainConfig.devInfo.gitHash}`,
  );
  const [isNotFirstLaunch, setIsNotFirstLaunch] = useState(
    SettingsStorage.getParameter("isNotFirstLaunch") || false,
  );
  const [updateInfo, setUpdateInfo] = useState(null);

  /**
   * Хук завантаження шрифтів повинен викликатися на верхньому рівні компонента
   * для коректної роботи React правил хуків
   */
  const fontsLoaded = useCustomFonts();

  /**
   * Хук для роботи з push-сповіщеннями
   * Налаштовує listeners для foreground та response подій
   */
  const { registerForPushNotifications } = usePushNotifications();

  MainConfig.debug.isDebug = false;
  Logger.info("App", "isDebug", { isDebug: MainConfig.debug.isDebug });
  // if (MainConfig.debug.isDebug) {
  //   require("./src/cfgs/ReactotronConfig");
  // }

  // if (SettingsStorage.getParameter("isDebug")) {
  //   MainConfig.debug.isDebug = SettingsStorage.getParameter("isDebug");
  // } else if (!SettingsStorage.getParameter("isDebug")) {
  //   SettingsStorage.setParameter("isDebug", MainConfig.debug.isDebug);
  // }

  /**
   * Зворотний виклик для оновлення стану ErrorBoundary з MainConfig
   * @param {boolean} value - новий стан ErrorBoundary
   */
  MainConfig.updateErrorBoundaryState = (value) => {
    setIsErrorBoundary(value);
  };

  /**
   * Відображає повідомлення про згоду з правилами при першому запуску
   */
  useEffect(() => {
    if (!isLoading && !isNotFirstLaunch) {
      showSnackbar(
        <Text selectable={true} style={H6}>
          Використовуючи додаток, ви погоджуєтесь з нашими{" "}
          <SnackbarLink url={MainConfig.urls.appUrl + `#terms`} color={primary}>
            правилами
          </SnackbarLink>
          .
        </Text>,
        { duration: 5000, actionLabel: "ОК" },
      );
    }
  }, [isLoading, isNotFirstLaunch]);

  /**
   * Глобальний обробник зміни стану додатку (AppState)
   * Логує кожну зміну стану: active, background, inactive
   */
  useEffect(function () {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const _curRouName = getCurrentRouteName();
        if (
          _curRouName === "WebVideoPlayer" ||
          _curRouName === "LocalVideoPlayer"
        ) {
          SystemNavigationBar.navigationHide();
          SystemNavigationBar.fullScreen(true);
          Logger.debug(
            "AppState",
            "Приховано навігаційну панель для відеоплеєра",
          );
        } else {
          await setupNavigationBar();
        }
        Logger.debug("AppState", "Стан додатку змінено", {
          nextAppState,
          currentScreen: getCurrentRouteName(),
        });
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Основна ініціалізація додатку:
   * - Налаштовує DeviceId та отримує унікальний ID користувача
   * - Завантажує метадані з сервера
   * - Ініціалізує дефолтні налаштування користувача
   * - Налаштовує ErrorBoundary
   */
  useEffect(() => {
    MainConfig.devInfo.deviceId = MainConfig.devInfo.getUniqueId();
    Logger.debug("App", "Device ID отримано", MainConfig.devInfo.deviceId);

    // Ініціалізація Hikka Auth
    HikkaAuthService.initialize();
    Logger.debug("App", "Hikka Auth ініціалізовано");

    // Ініціалізація AniUA Auth (автоматичний вхід)
    AniuaAuthService.initialize()
      .then((result) => {
        if (result.success) {
          Logger.info("App", "AniUA Auth ініціалізовано", {
            user: result.user?.username,
            isNewUser: result.isNewUser,
            usedCachedTokens: result.usedCachedTokens,
          });

          // Реєстрація push-токену ПІСЛЯ успішної авторизації
          registerForPushNotifications().catch((err) => {
            Logger.warn("App", "Помилка реєстрації push-токену", err);
          });
        } else {
          Logger.warn("App", "AniUA Auth не вдалось ініціалізувати", {
            error: result.error,
            usedCachedTokens: result.usedCachedTokens,
          });
        }
      })
      .catch((err) => {
        Logger.error("App", "Помилка ініціалізації AniUA Auth", err);
      });

    const fetchMetadata = async () => {
      const metadata = await AniuaApi.getMetadata();
      MainConfig.urls.appUrl = metadata.website_url;
      MainConfig.urls.telegramChannelUrl = metadata.telegram_channel;
      MainConfig.urls.donateUrl = metadata.donation_url;
      MainConfig.urls.github = metadata.github;
      MainConfig.urls.supportTelegramBotUrl = metadata.support_telegram_bot;
    };
    fetchMetadata();

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
        false,
    );

    /**
     * Асинхронна функція ініціалізації додатка:
     * - Налаштовує орієнтацію екрану (portrait для телефонів, вільна для планшетів)
     * - Запитує необхідні дозволи (notifications, storage)
     * - Налаштовує навігаційну панель
     * - Встановлює дефолтні налаштування
     */
    const initApp = async () => {
      try {
        Logger.logAppInit("Початок ініціалізації додатка");

        try {
          if (isTV()) {
            // TV: lock to landscape, set sidebar navigation style
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.LANDSCAPE,
            );
            try {
              SystemNavigationBar.navigationHide();
            } catch {}
            const existingTVConfig = SettingsStorage.getParameter("userConfig");
            if (
              !existingTVConfig ||
              Object.keys(existingTVConfig).length === 0
            ) {
              SettingsStorage.setParameter("userConfig", {
                navbar: {
                  placedAt: "Ліворуч",
                  style: "MD3",
                },
              });
            }
          } else if (isTablet()) {
            await ScreenOrientation.unlockAsync();
            const existingConfig = SettingsStorage.getParameter("userConfig");
            if (!existingConfig || Object.keys(existingConfig).length === 0) {
              SettingsStorage.setParameter("userConfig", {
                navbar: {
                  placedAt: "Внизу",
                  style: "MD3",
                },
              });
            }
          } else {
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT_UP,
            );
            const existingMobileConfig =
              SettingsStorage.getParameter("userConfig");
            if (
              !existingMobileConfig ||
              Object.keys(existingMobileConfig).length === 0
            ) {
              SettingsStorage.setParameter("userConfig", {
                navbar: {
                  style: "MD3",
                },
              });
            }
          }
        } catch (e) {
          Logger.logAppInit("Помилка блокування орієнтації", false, e);
        }

        Logger.logAppInit("Перевірка дозволів.");
        await NotificationPermission();
        await AllowTheVideoFolder();

        Logger.debug("FileSystem", "Video folder", await getVideoDir());

        // Затримка необхідна для повної ініціалізації Android Activity перед взаємодією з UI
        Logger.logAppInit("Очікування готовності Android activity");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setIsActivityReady(true);
        Logger.logAppInit("Android activity готова");

        // Налаштування навігаційної панелі виконується асинхронно після готовності activity
        Logger.logAppInit("Запуск асинхронних налаштувань");
        Promise.all([setupNavigationBar()])
          .then(() => {
            Logger.logAppInit("Всі налаштування успішно застосовані");
          })
          .catch((error) => {
            Logger.logAppInit(
              "Деякі налаштування не вдалося застосувати",
              false,
              error,
            );
          });
        const fetchMetadata_2 = async () => {
          try {
            MainConfig.partnerStudios = await AniuaApi.getVerifiedTeams();
            Logger.debug(
              "App",
              "Дані про команди завантажено",
              MainConfig.partnerStudios,
            );
          } catch (error) {
            Logger.error(
              "App",
              "Помилка завантаження даних про команди",
              error,
            );
          }
        };
        fetchMetadata_2();
      } catch (error) {
        Logger.logAppInit("Критична помилка ініціалізації", false, error);
      } finally {
        setTimeout(
          () => {
            if (isNotFirstLaunch === false) {
              SettingsStorage.setParameter("isNotFirstLaunch", true);
              SettingsStorage.setParameter(
                "defaultPlayer",
                MainConfig.players[1],
              );
            }

            // Для існуючих користувачів автоматично встановлюємо hasCompletedOnboarding
            if (
              isNotFirstLaunch &&
              !SettingsStorage.getParameter("hasCompletedOnboarding")
            ) {
              SettingsStorage.setParameter("hasCompletedOnboarding", true);
            }

            Logger.logAppInit("Завершення завантаження");

            setIsLoading(false);
          },
          isNotFirstLaunch ? 2500 : 2500,
        );
        Logger.debug("App", "Setting currentAppVersion", currentAppVersion);

        const _curAppVer = `${MainConfig.devInfo.version}-${MainConfig.devInfo.gitShortHash || MainConfig.devInfo.gitHash}`;

        // Показуємо snackbar якщо версія змінилась
        if (currentAppVersion !== _curAppVer && isNotFirstLaunch) {
          showSnackbar(
            `Оновлено до ${MainConfig.devInfo.version} (${MainConfig.devInfo.gitShortHash || ""})`,
            {
              actionLabel: "Деталі",
              onActionPress: () => {
                Linking.openURL(
                  `${MainConfig.urls.github}/AniUA/blob/${MainConfig.devInfo.gitShortHash}/CHANGELOG.MD`,
                );
              },
              duration: 5000,
            },
          );
          SettingsStorage.setParameter("currentVersion", _curAppVer);
          setCurrentAppVersion(_curAppVer);
        }

        // Перевіряємо оновлення через UpdateCheckerService
        if (isNotFirstLaunch) {
          try {
            const result = await UpdateCheckerService.checkForUpdates();
            if (result.available) {
              Logger.info("App", "Знайдено оновлення", result);
              setUpdateInfo(result);
            }
          } catch (updateError) {
            Logger.warn("App", "Помилка перевірки оновлень", updateError);
          }
        }
      }
    };

    initApp();
  }, []);

  Logger.debug("App", "App render", {
    isLoading,
    isErrorBoundary,
    isActivityReady,
  });

  /**
   * Відображаємо екран завантаження до повної готовності додатка:
   * - Завантаження шрифтів
   * - Завершення ініціалізації
   */
  if (!fontsLoaded || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <BottomSheetModalProvider style={{ flex: 1 }}>
            <Loader isNotFirstLaunch={isNotFirstLaunch} />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider style={{ flex: 1 }}>
            <RootSiblingParent>
              <ScreenController updateInfo={updateInfo} />
              {isErrorBoundary && <ErrorTestComponent />}
              {snackbar}
              {snackbarTop}
            </RootSiblingParent>
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
/**
 * Налаштовує системну навігаційну панель відповідно до збережених налаштувань
 * Підтримує режими: hidden, dark, light
 */
export const setupNavigationBar = async () => {
  return AndroidHelper.safeExecute(async () => {
    const navBarType = SettingsStorage.getParameter("SystemNavigationBar_type");

    if (navBarType === "hidяden") {
      SystemNavigationBar.navigationHide();
    } else if (navBarType === "dark" || !navBarType) {
      SystemNavigationBar.navigationShow();
      const blackHex = Color(background).hex();
      SystemNavigationBar.setNavigationColor(blackHex, "dark", "navigation");
      SystemNavigationBar.setBarMode("dark", "navigation");
    } else if (navBarType === "light") {
      SystemNavigationBar.navigationShow();
      const whiteHex = Color(text).hex();
      SystemNavigationBar.setNavigationColor(whiteHex, "light", "navigation");
      SystemNavigationBar.setBarMode("light", "navigation");
    }
  }, "Помилка налаштування навігаційної панелі");
};
