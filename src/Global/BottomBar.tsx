import React from "react";
import { Image, View, StyleSheet, Text, Pressable } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
// import { BlurView } from "@react-native-community/blur";
import { Ionicons } from "@expo/vector-icons";
import HomeTab from "./Home";

const DummyTabScene = () => {
  return (
    <View>
      <Text>Tab Screen</Text>
    </View>
  );
};

type TabType = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  component: () => React.JSX.Element;
}[];

const TABS: TabType = [
  {
    title: "home",
    icon: "home",
    iconActive: "home-outline",
    component: HomeTab,
  },
  {
    title: "search",
    icon: "search",
    iconActive: "search-outline",
    component: DummyTabScene,
  },
  {
    title: "shop",
    icon: "basket",
    iconActive: "basket-outline",
    component: DummyTabScene,
  },
  {
    title: "user",
    icon: "person",
    iconActive: "person-outline",
    component: DummyTabScene,
  },
];

// We're showing an indicator image in place of the label
const tabBarLabel: BottomTabNavigationOptions["tabBarLabel"] = ({
  focused,
}) => (
  <Image
    style={{ width: 14, height: 5, opacity: focused ? 1 : 0 }}
    source={require("../../assets/app/tab_indicator.png")}
  />
);

const BottomTab = createBottomTabNavigator();

const BottomBar = () => (
  <NavigationContainer>
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // position absolute is required to extend the tab screens to also scroll behind the tab bar area,
          // so the blur effect would only work if there is some content showing behind it.
          position: "absolute",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "rgb(47, 64, 85)",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        tabBarButton: ({ children, ...rest }) => (
          <Pressable
            {...rest}
            style={({ pressed }) => [
              rest.style,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
          >
            {children}
          </Pressable>
        ),
        tabBarBackground: () => (
          <BlurView
            // tint="light"
            // control the intensity of the blur effect
            intensity={80}
            style={{
              ...StyleSheet.absoluteFillObject,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              // The overflow hidden is just to apply above radius.
              overflow: "hidden",
              // We can also apply background to tweak blur color
              backgroundColor: "transparent",
              // backgroundColor: "rgba(101, 92, 155, 0.4)",
            }}
            experimentalBlurMethod="dimezisBlurView"
            // // if using @react-native-community/blur
            // blurAmount={80}
            // blurType="light"
          />
        ),
      }}
    >
      {TABS.map((tab, index) => (
        <BottomTab.Screen
          key={`${tab.title}_${index}`}
          name={tab.title}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? tab.icon : tab.iconActive}
                size={24}
                color={focused ? "#2E1F57" : "black"}
              />
            ),
            tabBarLabel,
            // The icon + label by default shifts to horizontal on iPad/tablet, this property is to avoid that
            tabBarLabelPosition: "below-icon",
          }}
        />
      ))}
    </BottomTab.Navigator>
  </NavigationContainer>
);

export default BottomBar;
