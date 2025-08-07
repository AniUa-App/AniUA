import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import React from "react";
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
} from "react-native-reanimated";
import { black, appColor, white } from "../../Styles/Colors";
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

// Головний компонент для вкладок навігації
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomNavBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen
        name="Liked"
        initialParams={{ type: "Liked" }}
        options={{
          headerShown: true,
          header: ({ navigation, route }) => (
            <Header navigation={navigation} route={route} isArrow={false} />
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
          header: ({ navigation, route }) => (
            <Header navigation={navigation} route={route} isArrow={false} />
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

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

// Кастомна панель навігації
function CustomNavBar({ state, navigation }) {
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== "AnimeList"
  );
  const visibleStateIndex = state.routes.findIndex(
    (route) => route.key === state.routes[state.index].key
  );

  return (
    <View style={styles.container}>
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
                if (route.name === "Liked" || route.name === "Download") {
                  navigation.navigate(route.name, {
                    title: labels[route.name],
                  });
                } else {
                  navigation.navigate(route.name);
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
            {(
              {
                Home: HomeIcon,
                Liked: LikeIcon,
                Download: DownloadIcon,
                Settings: SettingsIcon,
              }[route.name] || (() => null)
            )({ fill: isFocused ? appColor : white })}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.text}
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
        header: ({ navigation, route }) => (
          <Header navigation={navigation} route={route} />
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
    backgroundColor: black,
    width: "85%",
    alignSelf: "center",
    bottom: 20,
    borderRadius: 8,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  text: {
    fontFamily: "Nunito-SemiBold",
    color: white,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
});
