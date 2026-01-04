import React, { useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import { H4, H5, H3, H7, H6 } from "../Styles/Fonts";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const TABS = [
  { key: "dorama", label: "Дорама" },
  { key: "anime", label: "Аніме" },
  { key: "manga", label: "Манґа" },
];

const TAB_WIDTH = 68;
const TAB_HEIGHT = 44;
const INDICATOR_PADDING = 4;

export default function TopNavigationComponent({
  activeTab = "anime",
  onTabChange,
  scrollY = null,
}) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 1);
  const tabsContainerWidth = TAB_WIDTH * TABS.length + INDICATOR_PADDING * 10;

  useEffect(() => {
    const newIndex = TABS.findIndex((tab) => tab.key === activeTab);
    if (newIndex >= 0) {
      indicatorPosition.value = withSpring(newIndex, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [activeTab]);

  const handleTabPress = useCallback(
    (tabKey, index) => {
      indicatorPosition.value = withSpring(index, {
        damping: 15,
        stiffness: 150,
      });
      if (onTabChange) {
        onTabChange(tabKey);
      }
    },
    [onTabChange]
  );

  const handleSearchPress = useCallback(() => {
    navigation.navigate("HiddenStack", {
      screen: "SearchScreen",
    });
  }, [navigation]);

  const handleNotificationPress = useCallback(() => {
    // TODO: Navigate to notifications screen
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 2,
          backgroundColor: "transparent",
          flex: 1,
        },
      ]}
    >
      {/* Left - Notification Bell */}
      <Pressable
        style={[styles.iconButton, { backgroundColor: themeColors.Text(0.08) }]}
        onPress={handleNotificationPress}
      >
        <Icons.BellSimple size={28} color={themeColors.text} />
      </Pressable>

      {/* Center - Category Tabs */}
      <SegmentedControl
        values={TABS.map((s) => String(s.label))}
        selectedIndex={activeIndex}
        onChange={(event) =>
          handleTabPress(
            TABS[event.nativeEvent.selectedSegmentIndex].key,
            event.nativeEvent.selectedSegmentIndex
          )
        }
        tintColor={themeColors.primary}
        backgroundColor={"transparent"}
        sliderStyle={{
          borderRadius: 16,
        }}
        style={{
          width: "70%",
          height: 44,
        }}
        fontStyle={{
          ...H5,
          color: themeColors.Text(0.5),
        }}
        activeFontStyle={{
          ...H5,
          fontWeight: "normal",
          color: themeColors.text,
        }}
      />

      {/* Right - Search Icon */}
      <Pressable
        style={[
          styles.iconButton,
          {
            backgroundColor: themeColors.Text(0.08),
          },
        ]}
        onPress={handleSearchPress}
      >
        <Icons.MagnifyingGlass size={28} color={themeColors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    height: TAB_HEIGHT,
    borderRadius: 16,
    top: INDICATOR_PADDING,
  },
  tab: {
    width: TAB_WIDTH,
    height: TAB_HEIGHT + INDICATOR_PADDING * 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {},
});
