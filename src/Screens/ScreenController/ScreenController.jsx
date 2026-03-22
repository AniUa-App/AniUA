import { View, StyleSheet, Linking, useWindowDimensions } from "react-native";
import { useScreenControllerStyles } from "../../Styles/components/Screens/ScreenControllerStyles";
import { TouchableOpacity } from "../../Widgets/Button";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStack, Tab, HiddenStackNav } from "./Navigators";
import HomeScreen from "../Home";
import AnimeListScreen from "../AnimeList";
import DownloadScreen from "../Download";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import {
  navigationRef,
  navigate,
  navigateToAnime,
} from "../../Global/NavigationService";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../../Global/useTheme";
import Header from "../../Widgets/HeaderWidget";
import AnimePreviewScreen from "../AnimePreview";
import AnimeWatchScreen from "../AnimeWatchScreen";
import WebVideoPlayerScreen from "../WebVideoPlayer";
import AnimeStorage from "../../Storage/AnimeStorage";
import SettingsScreen from "../Settings";
import ButtonsScreen from "../Buttons";
import LinkingConfig from "../../cfgs/LinkingConfig";
import { useNavigation } from "@react-navigation/native";
// import LocalVideoPlayerScreen from '../LocalVideoPlayer';
import LocalVideoPlayerV2Screen from "../LocalVideoPlayerV2";
import CustomisationScreen from "../Customisation";
import SettingsStorage from "../../Storage/SettingsStorage";
import { EventBus } from "../../Global/EventBus";
import MainScreenCustomisationScreen from "../MainScreenCustomisation";
import { Text } from "react-native";
import Icons from "../../Styles/Icons";
import { H3, H5, H7 } from "../../Styles/Fonts";
import AppInfoScreen from "../AppInfo";
import PrivilegesScreen from "../Privileges";
import DonateScreen from "../Donate";
import InvalidLinkScreen from "../InvalidLink";
import Logger from "../../Logger/Logger";
import SnowflakesWidget from "../../Widgets/SnowflakesWidget";
import LoginScreen from "../LoginScreen";
import QRLoginScreen from "../QRLoginScreen";
import AddDeviceScreen from "../AddDeviceScreen";
import BookmarkScreen from "../Bookmark";
import SearchScreen from "../SearchScreen";
import CharacterScreen from "../CharacterScreen";
import ProfileScreen from "../ProfileScreen";
import NotificationsScreen from "../NotificationsScreen";
import UpdateCheckerScreen from "../UpdateCheckerScreen";
import { background } from "../../Styles/Colors";
import { useIsTV } from "../../Styles/Responsive";
import TVSidebarNav from "../../Components/TV/TVSidebarNav";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import AnalyticsService from "../../Services/AnalyticsService";
import * as Notifications from "expo-notifications";

// Ініціалізуємо auth токен при запуску застосунку
HikkaAuthService.initialize();

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

// Головний компонент для вкладок навігації
function MainTabs() {
  const isTV = useIsTV();
  const [userConfig, setUserConfig] = React.useState(
    SettingsStorage.getParameter("userConfig"),
  );

  React.useEffect(() => {
    const unsubscribe = EventBus.on("userConfig", (newConfig) => {
      setUserConfig(newConfig);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
      sceneContainerStyle={{ backgroundColor: background }}
      tabBar={(props) =>
        isTV ? <TVSidebarNav {...props} /> : <ThemedNavBar {...props} />
      }
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Bookmarks" initialParams={{ type: "Bookmarks" }}>
        {(props) => (
          <View style={{ flex: 1 }}>
            <BookmarkScreen {...props} />

            {!isTV && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              >
                <Header
                  navigation={props.navigation}
                  route={props.route}
                  isArrow={false}
                  title="Обрані"
                />
              </View>
            )}
          </View>
        )}
      </Tab.Screen>

      <Tab.Screen name="Download">
        {(props) => (
          <View style={{ flex: 1 }}>
            <DownloadScreen
              {...props}
              isNavBarPadding={true}
              hasManualHeader={true}
            />
            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
              <Header
                navigation={props.navigation}
                route={props.route}
                isArrow={false}
                title="Завантажені"
              />
            </View>
          </View>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Профіль",
        }}
      />
    </Tab.Navigator>
  );
}

// Анімований контейнер для іконки (горизонтальне збільшення з центру)
function AnimatedIconContainer({ focused, themeColors, children }) {
  const containerWidth = 56; // should match the wrapper width
  const minVisiblePx = 40; // minimal visible width in pixels
  const minScale = minVisiblePx / containerWidth; // scale so 3px is visible
  const progress = useSharedValue(focused ? minScale : 0);

  React.useEffect(() => {
    if (focused) {
      // start from minimal width then expand
      progress.value = minScale;
      progress.value = withTiming(1, { duration: 100 });
    } else {
      progress.value = withTiming(0, { duration: 100 });
    }
  }, [focused]);

  const bgScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scaleX: progress.value,
        },
      ],
    };
  });

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: containerWidth,
        height: 35,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: themeColors.Primary(0.3),
            borderRadius: 16,
          },

          bgScaleStyle,
        ]}
      />
      {children}
    </View>
  );
}

// Кастомна панель навігації з підписом під іконками
export function MD3StyleNavBar({ state, navigation, isPreview = false }) {
  const s = useScreenControllerStyles();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig"),
  );
  const isCustomisation = userConfig?.navbar?.isCustomisation;
  const placedAt = userConfig?.navbar?.placedAt || "Внизу";

  useEffect(() => {
    EventBus.on("userConfig", (newConfig) => {
      setUserConfig(newConfig);
    });
  }, []);

  const [previewIndex, setPreviewIndex] = useState(state.index);
  const visibleRoutes = state.routes;
  const visibleStateIndex = isPreview ? previewIndex : state.index;

  // Визначаємо позиціонування та орієнтацію
  const isVertical = placedAt === "Праворуч" || placedAt === "Ліворуч";
  // Використовуємо insets.bottom для правильного відступу від системного навбару
  const bottomInset = Math.max(insets.bottom, 8);
  const positionStyles = {
    Внизу: {
      bottom: isCustomisation ? userConfig?.navbar?.bottomOffset || 0 : 0,
      left: "auto",
      right: "auto",
      top: "auto",
      width: isCustomisation ? `${userConfig?.navbar?.width || 80}%` : "100%",
      alignSelf: "center",
      flexDirection: "row",
      paddingVertical: 8,
      paddingBottom:
        isCustomisation && userConfig?.navbar?.bottomOffset > 20
          ? 0
          : bottomInset,
    },
    Праворуч: {
      right: 0,
      position: "absolute",
      height: "100%",
      flexDirection: "column",
      paddingHorizontal: 12,
      justifyContent: "center",
    },
    Ліворуч: {
      position: "absolute",
      left: 0,
      height: "100%",
      flexDirection: "column",
      paddingHorizontal: 12,
      justifyContent: "center",
    },
  };

  return (
    <View
      style={[
        !isVertical && s.container2,
        positionStyles[placedAt],
        {
          backgroundColor: isCustomisation
            ? userConfig?.navbar?.backgroundColor || themeColors.background
            : themeColors.background,
          borderRadius: isCustomisation
            ? userConfig?.navbar?.borderRadius
            : isVertical
              ? 16
              : 0,
          overflow: "hidden",
        },
      ]}
    >
      {isCustomisation && userConfig?.navbar?.isBlurBackground && (
        <BlurView
          tint="dark"
          intensity={userConfig?.navbar?.blurIntensity || 80}
          blurReductionFactor={userConfig?.navbar?.blurReductionFactor || 8}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: isCustomisation
                ? userConfig?.navbar?.borderRadius
                : 8,
            },
          ]}
          experimentalBlurMethod="dimezisBlurView"
        />
      )}
      {visibleRoutes.map((route, index) => {
        const labels = {
          Home: "Головна",
          Bookmarks: "Обрані",
          Download: "Збережені",
          Profile: "Профіль",
        };
        const isFocused = visibleStateIndex === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                if (isPreview) {
                  setPreviewIndex(index);
                } else {
                  if (route.name === "Bookmarks" || route.name === "Download") {
                    navigation.navigate(route.name, {
                      title: labels[route.name],
                    });
                  } else {
                    navigation.navigate(route.name);
                  }
                }
              }
            }}
            style={[isVertical ? s.tabItemVerticalSide : s.tabItemVertical, {}]}
          >
            <View style={s.iconShadow} pointerEvents="none">
              {(() => {
                const IconComponent =
                  {
                    Home: Icons.House,
                    Bookmarks: Icons.BookmarkSimple,
                    Download: Icons.DownloadSimple,
                    Profile: Icons.UserCircle,
                  }[route.name] || null;
                return (
                  IconComponent && (
                    <AnimatedIconContainer
                      focused={isFocused}
                      themeColors={themeColors}
                    >
                      <IconComponent
                        size={25}
                        weight={isFocused ? "fill" : "regular"}
                        color={
                          isFocused ? themeColors.primary : themeColors.text
                        }
                      />
                    </AnimatedIconContainer>
                  )
                );
              })()}
            </View>
            <Text
              selectable={true}
              style={[
                s.textBelow,
                { color: themeColors.text, paddingVertical: 4 },
              ]}
            >
              {labels[route.name]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function ThemedNavBar({ state, navigation, isPreview = false }) {
  const isTV = useIsTV();
  const userConfig = SettingsStorage.getParameter("userConfig");
  // Use array destructuring and provide a safe default
  const [navbarType, setNavbarType] = useState(
    userConfig?.navbar?.style ?? "Default",
  );

  // TV uses sidebar navigation, not bottom navbar
  if (isTV) return null;

  useEffect(() => {
    const unsubscribe = EventBus.on("userConfig", (newConfig) => {
      setNavbarType(newConfig?.navbar?.style ?? "Default");
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  if (navbarType == "MD3") {
    return (
      <MD3StyleNavBar
        state={state}
        navigation={navigation}
        isPreview={isPreview}
      />
    );
  } else if (navbarType === "Default") {
    return (
      <CustomNavBar
        state={state}
        navigation={navigation}
        isPreview={isPreview}
      />
    );
  } else {
    return (
      <CustomNavBar
        state={state}
        navigation={navigation}
        isPreview={isPreview}
      />
    );
  }
}

// Кастомна панель навігації
export function CustomNavBar({ state, navigation, isPreview = false }) {
  const s = useScreenControllerStyles();
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig"),
  );
  const isCustomisation = userConfig?.navbar?.isCustomisation;
  // Використовуємо insets.bottom для правильного відступу від системного навбару
  const bottomOffset = Math.max(insets.bottom, 10);

  useEffect(() => {
    EventBus.on("userConfig", (newConfig) => {
      setUserConfig(newConfig);
    });
  }, []);

  const [previewIndex, setPreviewIndex] = useState(state.index);
  const visibleRoutes = state.routes;
  const visibleStateIndex = isPreview ? previewIndex : state.index;

  const totalTabs = visibleRoutes.length || 1;
  const baseWidth = userConfig?.navbar?.width
    ? (width * (userConfig.navbar.width || 80)) / 100
    : width * 0.8;
  const tabWidth = baseWidth / totalTabs;

  const indicatorTranslateX = useSharedValue(0);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: indicatorTranslateX.value,
      },
    ],
  }));

  useEffect(() => {
    const targetX = visibleStateIndex * tabWidth;
    indicatorTranslateX.value = withTiming(targetX, { duration: 250 });
  }, [visibleStateIndex, tabWidth]);

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: isCustomisation
            ? userConfig?.navbar?.backgroundColor || themeColors.background
            : themeColors.background,
          borderRadius: isCustomisation ? userConfig?.navbar?.borderRadius : 8,
          bottom: isCustomisation
            ? userConfig?.navbar?.bottomOffset || bottomOffset
            : bottomOffset,
          width: isCustomisation
            ? `${userConfig?.navbar?.width || 80}%`
            : "80%",
        },
      ]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: userConfig?.navbar?.borderRadius || 8,
            backgroundColor: themeColors.Primary(0.25),
            width: tabWidth,
          },
          indicatorStyle,
        ]}
      />
      {isCustomisation && userConfig?.navbar?.isBlurBackground && (
        <BlurView
          tint="dark"
          intensity={userConfig?.navbar?.blurIntensity || 80}
          blurReductionFactor={userConfig?.navbar?.blurReductionFactor || 8}
          borderRadius={userConfig?.navbar?.borderRadius || 8}
          style={[StyleSheet.absoluteFill]}
          experimentalBlurMethod="dimezisBlurView"
        />
      )}
      {visibleRoutes.map((route, index) => {
        const labels = {
          Home: "Головна",
          Bookmarks: "Обрані",
          Download: "Завантажені",
          Profile: "Профіль",
        };
        const isFocused = visibleStateIndex === index;

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.7)}
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                Logger.debug("ScreenController", "Route changed", {
                  route: route.name,
                });
                if (isPreview) {
                  setPreviewIndex(index);
                } else {
                  navigation.navigate(route.name);
                }
              }
            }}
            style={[
              s.tabItem,
              {
                width: tabWidth,
                justifyContent: "center",
              },
            ]}
          >
            {(() => {
              const IconComponent =
                {
                  Home: Icons.House,
                  Bookmarks: Icons.Heart,
                  Download: Icons.DownloadSimple,
                  Profile: Icons.UserCircle,
                }[route.name] || null;
              return (
                IconComponent && (
                  <IconComponent
                    size={32}
                    weight={"regular"}
                    color={isFocused ? themeColors.primary : themeColors.text}
                  />
                )
              );
            })()}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(600)}
                exiting={FadeOut.duration(100)}
                style={[H7, { color: themeColors.text, paddingLeft: 6 }]}
              >
                {labels[route.name]}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
}

function HiddenStack() {
  return (
    <HiddenStackNav.Navigator
      screenOptions={{
        animation: "ios_from_right",
        animationDuration: 250,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        headerShown: true,
        headerTransparent: true,
        headerStyle: { backgroundColor: "transparent" },
        headerShadowVisible: false,
        header: ({ navigation, route, options }) => (
          <Header
            navigation={navigation}
            route={route}
            title={options?.headerTitle}
            isArrow={options?.isArrow ?? route?.params?.isArrow ?? true}
          />
        ),
        contentStyle: { backgroundColor: background },
      }}
    >
      <HiddenStackNav.Screen
        name="AnimeList"
        component={AnimeListScreen}
        options={{ headerShown: true }}
      />
      <HiddenStackNav.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <HiddenStackNav.Screen
        name="AnimePreview"
        component={AnimePreviewScreen}
        options={{ headerShown: false }}
      />
      <HiddenStackNav.Screen
        name="AnimeWatch"
        component={AnimeWatchScreen}
        options={{ headerShown: false }}
      />
      <HiddenStackNav.Screen
        name="SecretScreen"
        component={() => {
          const navigation = useNavigation();
          navigation.goBack();
          Linking.openURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        }}
        options={{ headerShown: false }}
      />
      <HiddenStackNav.Screen
        name="WebVideoPlayer"
        component={WebVideoPlayerScreen}
        options={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200,
        }}
      />
      <HiddenStackNav.Screen
        name="LocalVideoPlayer"
        component={LocalVideoPlayerV2Screen}
        options={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200,
        }}
      />
      <HiddenStackNav.Screen
        name="ButtonsScreen"
        component={ButtonsScreen}
        options={{ headerShown: true }}
      />
      <HiddenStackNav.Screen
        name="CustomisationScreen"
        component={CustomisationScreen}
        options={{
          headerShown: true,
          headerTitle: "Налаштування",
        }}
      />
      <HiddenStackNav.Screen
        name="MainScreenCustomisation"
        component={MainScreenCustomisationScreen}
        options={{
          headerShown: true,
          headerTitle: "Особисті рекомендації",
        }}
      />
      <HiddenStackNav.Screen
        name="AppInfo"
        component={AppInfoScreen}
        options={{
          headerShown: true,
          headerTitle: "Інформація про застосунок",
        }}
      />
      <HiddenStackNav.Screen
        name="Privileges"
        component={PrivilegesScreen}
        options={{
          headerShown: true,
          headerTitle: "Привілеї",
        }}
      />
      <HiddenStackNav.Screen
        name="Donate"
        component={DonateScreen}
        initialParams={{ arrowSide: "left", isArrow: true }}
        options={{
          headerShown: true,
        }}
      />
      <HiddenStackNav.Screen
        name="InvalidLink"
        component={InvalidLinkScreen}
        options={{
          headerShown: true,
          headerTitle: "Посилання недійсне",
        }}
      />
      <HiddenStackNav.Screen
        name="CharacterScreen"
        component={CharacterScreen}
        options={{
          headerShown: false,
        }}
      />
      <HiddenStackNav.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <HiddenStackNav.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerTitle: "Налаштування",
          animation: "slide_from_bottom",
          animationDuration: 300,
        }}
      />
      <HiddenStackNav.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <HiddenStackNav.Screen
        name="AddDeviceScreen"
        component={AddDeviceScreen}
        options={{
          headerShown: false,
        }}
      />
    </HiddenStackNav.Navigator>
  );
}

export default function ScreenController({ updateInfo }) {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasForcedUpdate, setHasForcedUpdate] = useState(false);
  const lastLoggedScreen = React.useRef(null);

  useEffect(() => {
    if (!isNavigationReady || hasForcedUpdate || !updateInfo?.available) {
      return;
    }

    navigate("UpdateChecker", { updateInfo });
    setHasForcedUpdate(true);
  }, [isNavigationReady, hasForcedUpdate, updateInfo]);

  const handleNavigationError = (error) => {
    Logger.warn("ScreenController", "Navigation linking error", error);
    // Не показуємо error користувачу, просто логуємо
  };

  // Слухаємо натискання на push-сповіщення
  useEffect(() => {
    // Перевіряємо чи додаток відкрився через натискання на сповіщення (коли був закритий)
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      Notifications;
      if (response) {
        const data = response.notification.request.content.data;
        Logger.debug("ScreenController", "Initial notification found", data);
        if (data?.slug) {
          // Затримка щоб navigation та MainTabs були готові
          setTimeout(() => {
            navigateToAnime(data.slug);
          }, 500);
        }
      }
    };

    checkInitialNotification();

    // Слухаємо натискання коли додаток вже відкритий
    const unsubscribe = EventBus.on("notificationTapped", (data) => {
      Logger.debug("ScreenController", "Notification tapped", data);
      if (data?.slug) {
        // Невелика затримка щоб navigation був готовий
        setTimeout(() => {
          navigateToAnime(data.slug);
        }, 100);
      }
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  // Перевіряємо, чи користувач пройшов онбордінг
  const hasCompletedOnboarding = SettingsStorage.getParameter(
    "hasCompletedOnboarding",
  );
  const initialRouteName = hasCompletedOnboarding ? "MainTabs" : "Login";

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        ref={navigationRef}
        linking={LinkingConfig}
        onUnhandledAction={handleNavigationError}
        onReady={() => setIsNavigationReady(true)}
        onStateChange={() => {
          const route = navigationRef.current?.getCurrentRoute();
          if (route?.name && route.name !== lastLoggedScreen.current) {
            lastLoggedScreen.current = route.name;
            AnalyticsService.logScreen(route.name);
          }
        }}
        fallback={null}
      >
        <RootStack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
            presentation: "modal",
            animation: "fade",
            animationDuration: 200,
          }}
        >
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="QRLogin" component={QRLoginScreen} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="HiddenStack" component={HiddenStack} />
          <RootStack.Screen
            name="UpdateChecker"
            component={UpdateCheckerScreen}
            options={{ gestureEnabled: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
      <SnowflakesWidget />
    </View>
  );
}
