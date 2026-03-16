import { useEffect, useCallback, useState } from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue, withSpring } from "react-native-reanimated";
import Icons from "../Styles/Icons";
import { useTopNavigationStyles } from "../Styles/components/TopNavigationStyles";
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


export default function TopNavigationComponent({
  activeTab = "anime",
  onTabChange,
}) {
  const s = useTopNavigationStyles();
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
        s.container,
        {
          paddingTop: insets.top + 2,
          backgroundColor: "transparent",
          flex: 1,
          width: isTabletLandscape ? BANNER_WIDTH : "100%",
        },
      ]}
    >
      {/* Left - Notification Bell */}
      <TouchableOpacity style={s.iconButton} onPress={handleNotificationPress}>
        <Icons.BellSimple
          size={s.iconSize}
          color={s.activeFontStyle.color}
          weight={unreadCount > 0 ? "fill" : "regular"}
        />
        {unreadCount > 0 && (
          <View style={s.badge}>
            <Text selectable={true} style={s.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Category Tabs */}
      <SegmentedControl
        values={TABS.map((tab) => String(tab.label))}
        selectedIndex={activeIndex}
        onChange={(event) =>
          handleTabPress(
            TABS[event.nativeEvent.selectedSegmentIndex].key,
            event.nativeEvent.selectedSegmentIndex,
          )
        }
        tintColor={s.badge.backgroundColor}
        backgroundColor={"transparent"}
        sliderStyle={s.segmentedSlider}
        style={s.segmentedControl}
        fontStyle={s.fontStyle}
        activeFontStyle={s.activeFontStyle}
      />

      {/* Right - Search Icon */}
      <TouchableOpacity style={s.iconButton} onPress={handleSearchPress}>
        <Icons.MagnifyingGlass size={s.iconSize} color={s.activeFontStyle.color} />
      </TouchableOpacity>
    </View>
  );
}

