import { View, StyleSheet, Linking } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { BlurView } from "expo-blur";
import { RootStack, Tab, HiddenStackNav } from "./Navigators";
import HomeScreen from "../Home";
import AnimeListScreen from "../AnimeList";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { black, appColor, white, AppColor } from "../../Styles/Colors";
import { useThemeColors } from "../../Global/useTheme";
import {
  HomeIcon,
  LikeIcon,
  DownloadIcon,
  AccountIcon,
  SettingsIcon,
} from "../../Styles/Icons";
import Header from "../../Widgets/HeaderWidget";
import AnimePreviewScreen from "../AnimePreview";
import WebVideoPlayerScreen from "../WebVideoPlayer";
import { GetScreenWidth } from "../../Global/Functions";
import { Black } from "../../Styles/Colors";
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

// Головний компонент для вкладок навігації
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <ThemedNavBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen
        name="Liked"
        initialParams={{ type: "Liked" }}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: true,
          headerTitle: "Обрані",
          header: ({ navigation, route, options }) => (
            <Header
              navigation={navigation}
              route={route}
              isArrow={false}
              title={options?.headerTitle}
            />
          ),
        }}
      >
        {(props) => <AnimeListScreen {...props} />}
      </Tab.Screen>

      <Tab.Screen
        name="Download"
        initialParams={{ type: "Downloaded" }}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
          headerShadowVisible: false,
          headerTitle: "Завантажені",
          header: ({ navigation, route, options }) => (
            <Header
              navigation={navigation}
              route={route}
              isArrow={false}
              title={options?.headerTitle}
            />
          ),
        }}
      >
        {(props) => <AnimeListScreen {...props} />}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarButton: () => null }}
      />
      <Tab.Screen
        name="AnimeList"
        component={AnimeListScreen}
        options={{ tabBarButton: () => null }}
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
            backgroundColor: themeColors.AppColor(0.3),
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
  const themeColors = useThemeColors();
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig")
  );
  const isCustomisation = userConfig?.navbar?.isCustomisation;

  useEffect(() => {
    EventBus.on("userConfig", (newConfig) => {
      setUserConfig(newConfig);
    });
  }, []);

  const [previewIndex, setPreviewIndex] = useState(
    state.routes.findIndex(
      (route) => route.key === state.routes[state.index].key
    )
  );
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "AnimeList"
  );
  const visibleStateIndex = isPreview
    ? previewIndex
    : state.routes.findIndex(
        (route) => route.key === state.routes[state.index].key
      );

  return (
    <View
      style={[
        styles.container2,

        {
          backgroundColor: isCustomisation
            ? userConfig?.navbar?.backgroundColor || themeColors.black
            : themeColors.black,
          borderRadius: isCustomisation
            ? userConfig?.navbar?.borderRadius || 8
            : 0,
          bottom: isCustomisation ? userConfig?.navbar?.bottomOffset || 0 : 0,
          width: isCustomisation
            ? `${userConfig?.navbar?.width || 80}%`
            : "100%",
        },
      ]}
    >
      {isCustomisation && userConfig?.navbar?.isBlurBackground && (
        <BlurView
          tint="dark"
          intensity={userConfig?.navbar?.blurIntensity || 80}
          blurReductionFactor={userConfig?.navbar?.blurReductionFactor || 8}
          style={[StyleSheet.absoluteFill]}
          experimentalBlurMethod="dimezisBlurView"
        />
      )}
      {visibleRoutes.map((route, index) => {
        const labels = {
          Home: "Головна",
          Liked: "Обрані",
          Download: "Збережені",
          Settings: "Параметри",
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
                  if (route.name === "Liked" || route.name === "Download") {
                    navigation.navigate(route.name, {
                      title: labels[route.name],
                    });
                  } else {
                    navigation.navigate(route.name);
                  }
                }
              }
            }}
            style={[styles.tabItemVertical, {}]}
          >
            <View style={styles.iconShadow} pointerEvents="none">
              {(() => {
                const IconComponent =
                  {
                    Home: Icons.House,
                    Liked: Icons.Heart,
                    Download: Icons.DownloadSimple,
                    Settings: Icons.Gear,
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
                          isFocused ? themeColors.appColor : themeColors.white
                        }
                      />
                    </AnimatedIconContainer>
                  )
                );
              })()}
            </View>
            <Text
              style={[
                styles.textBelow,
                { color: themeColors.white, paddingVertical: 4 },
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
  const userConfig = SettingsStorage.getParameter("userConfig");
  // Use array destructuring and provide a safe default
  const [navbarType, setNavbarType] = useState(
    userConfig?.navbar?.style ?? "Default"
  );

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

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

// Кастомна панель навігації
export function CustomNavBar({ state, navigation, isPreview = false }) {
  const themeColors = useThemeColors();
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig")
  );
  const isCustomisation = userConfig?.navbar?.isCustomisation;

  useEffect(() => {
    EventBus.on("userConfig", (newConfig) => {
      setUserConfig(newConfig);
    });
  }, []);

  const [previewIndex, setPreviewIndex] = useState(
    state.routes.findIndex(
      (route) => route.key === state.routes[state.index].key
    )
  );
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "AnimeList"
  );
  const visibleStateIndex = isPreview
    ? previewIndex
    : state.routes.findIndex(
        (route) => route.key === state.routes[state.index].key
      );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCustomisation
            ? userConfig?.navbar?.backgroundColor || themeColors.black
            : themeColors.black,
          borderRadius: isCustomisation
            ? userConfig?.navbar?.borderRadius || 8
            : 8,
          bottom: isCustomisation ? userConfig?.navbar?.bottomOffset || 25 : 25,
          width: isCustomisation
            ? `${userConfig?.navbar?.width || 80}%`
            : "80%",
        },
      ]}
    >
      {isCustomisation && userConfig?.navbar?.isBlurBackground && (
        <BlurView
          tint="dark"
          intensity={userConfig?.navbar?.blurIntensity || 80}
          blurReductionFactor={userConfig?.navbar?.blurReductionFactor || 8}
          style={[StyleSheet.absoluteFill]}
          experimentalBlurMethod="dimezisBlurView"
        />
      )}
      {visibleRoutes.map((route, index) => {
        const labels = {
          Home: "Головна",
          Liked: "Обрані",
          Download: "Завантажені",
          Settings: "Параметри",
        };
        const isFocused = visibleStateIndex === index;

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={() => {
              if (!isFocused) {
                console.log(route.name);
                if (isPreview) {
                  setPreviewIndex(index);
                } else {
                  if (route.name === "Liked" || route.name === "Download") {
                    navigation.navigate(route.name, {
                      title: labels[route.name],
                    });
                  } else {
                    navigation.navigate(route.name);
                  }
                }
              }
            }}
            style={[
              styles.tabItem,
              {
                backgroundColor: "transparent",
                paddingHorizontal: isFocused
                  ? GetScreenWidth() * 0.01
                  : GetScreenWidth() * 0.04,
              },
            ]}
          >
            <View style={styles.iconShadow} pointerEvents="none">
              {(() => {
                const IconComponent =
                  {
                    Home: Icons.House,
                    Liked: Icons.Heart,
                    Download: Icons.DownloadSimple,
                    Settings: Icons.Gear,
                  }[route.name] || null;
                return (
                  IconComponent && (
                    <IconComponent
                      size={32}
                      weight={"regular"}
                      color={
                        isFocused ? themeColors.appColor : themeColors.white
                      }
                    />
                  )
                );
              })()}
            </View>
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[H7, { color: themeColors.white, marginLeft: 8 }]}
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
        animation: "slide_from_right",
        headerShown: true,
        headerTransparent: true,
        headerStyle: { backgroundColor: "transparent" },
        headerShadowVisible: false,
        header: ({ navigation, route, options }) => (
          <Header
            navigation={navigation}
            route={route}
            title={options?.headerTitle}
          />
        ),
        contentStyle: { backgroundColor: black },
      }}
    >
      <HiddenStackNav.Screen
        name="AnimeList"
        component={AnimeListScreen}
        options={{ headerShown: true }}
      />
      <HiddenStackNav.Screen
        name="AnimePreview"
        component={AnimePreviewScreen}
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
        options={{ headerShown: false }}
      />
      <HiddenStackNav.Screen
        name="LocalVideoPlayer"
        component={LocalVideoPlayerV2Screen}
        options={{ headerShown: false }}
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
    </HiddenStackNav.Navigator>
  );
}

export default function ScreenController() {
  const handleNavigationError = (error) => {
    console.warn("Navigation linking error:", error);
    // Не показуємо error користувачу, просто логуємо
  };

  return (
    <NavigationContainer
      linking={LinkingConfig}
      onUnhandledAction={handleNavigationError}
      fallback={null}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: "modal",
        }}
      >
        <RootStack.Screen name="MainTabs" component={MainTabs} />
        <RootStack.Screen name="HiddenStack" component={HiddenStack} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Black(0.6),
    width: "80%",
    alignSelf: "center",
    bottom: 25,
    borderRadius: 8,
    paddingVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  container2: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Black(0.6),
    paddingHorizontal: 30,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 8,
    paddingBottom: 25,
    borderRadius: 8,
    overflow: "hidden",
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    borderRadius: 30,
  },
  tabItemVertical: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 14,
  },
  text: {},
  textBelow: {
    fontFamily: "Nunito-SemiBold",
    color: white,
    fontSize: 12,
    textAlign: "center",
  },
  iconShadow: {},
});
