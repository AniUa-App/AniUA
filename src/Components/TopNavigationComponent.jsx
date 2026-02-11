import { useEffect, useCallback, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import { H5 } from "../Styles/Fonts";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import NotificationsStorage from "../Storage/NotificationsStorage";
import { EventBus } from "../Global/EventBus";
import { useIsTabletLandscape } from "../Styles/Responsive";
import { useWindowDimensions } from "react-native";

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
}) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isTabletLandscape = useIsTabletLandscape();
  const { width: PAGE_WIDTH } = useWindowDimensions();
  const BANNER_WIDTH = Math.round(PAGE_WIDTH * 0.4);

  const activeIndex = TABS.findIndex((tab) => tab.key === activeTab);
  const indicatorPosition = useSharedValue(activeIndex >= 0 ? activeIndex : 1);

  // Стан для кількості непрочитаних сповіщень
  const [unreadCount, setUnreadCount] = useState(
    NotificationsStorage.getUnreadCount(),
  );

  // Оновлюємо лічильник при фокусі та на події
  useFocusEffect(
    useCallback(() => {
      setUnreadCount(NotificationsStorage.getUnreadCount());
    }, []),
  );

  useEffect(() => {
    const unsubscribeReceived = EventBus.on("notificationReceived", () => {
      setUnreadCount(NotificationsStorage.getUnreadCount());
    });
    const unsubscribeRead = EventBus.on("notificationRead", () => {
      setUnreadCount(NotificationsStorage.getUnreadCount());
    });
    return () => {
      unsubscribeReceived();
      unsubscribeRead();
    };
  }, []);

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
    [onTabChange],
  );

  const handleSearchPress = useCallback(() => {
    navigation.navigate("HiddenStack", {
      screen: "SearchScreen",
    });
  }, [navigation]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate("HiddenStack", {
      screen: "NotificationsScreen",
    });
  }, [navigation]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 2,
          backgroundColor: "transparent",
          flex: 1,
          width: isTabletLandscape ? BANNER_WIDTH : "100%",
        },
      ]}
    >
      {/* Left - Notification Bell */}
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: themeColors.Text(0.08) }]}
        onPress={handleNotificationPress}
      >
        <Icons.BellSimple
          size={28}
          color={themeColors.text}
          weight={unreadCount > 0 ? "fill" : "regular"}
        />
        {unreadCount > 0 && (
          <View
            style={[styles.badge, { backgroundColor: themeColors.primary }]}
          >
            <Text selectable={true} style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Category Tabs */}
      <SegmentedControl
        values={TABS.map((s) => String(s.label))}
        selectedIndex={activeIndex}
        onChange={(event) =>
          handleTabPress(
            TABS[event.nativeEvent.selectedSegmentIndex].key,
            event.nativeEvent.selectedSegmentIndex,
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
      {/* Spacer to push tabs to the right - only on tablet landscape */}

      {/* Right - Search Icon */}
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: themeColors.Text(0.08),
          },
        ]}
        onPress={handleSearchPress}
      >
        <Icons.MagnifyingGlass size={28} color={themeColors.text} />
      </TouchableOpacity>
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
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Nunito-Bold",
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
