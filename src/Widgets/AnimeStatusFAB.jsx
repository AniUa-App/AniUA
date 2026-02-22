import { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, Animated, Pressable } from "react-native";
import { TouchableOpacity } from "./Button";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5 } from "../Styles/Fonts";
import Icon from "../Styles/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Color from "color";
import { isTablet } from "../Styles/Responsive";

export default function AnimeStatusFAB({
  currentStatus = null,
  onStatusChange,
  style,
  bottomOffset = 20,
  isFavoritesTab = false,
  size = 64,
}) {
  const themeColors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: isOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isOpen]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.6,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const defaultMenuItems = [
    {
      key: "planned",
      label: "Заплановано",
      icon: Icon.PlusCircle,
      color: themeColors.yellowBookmark,
    },
    {
      key: "completed",
      label: "Переглянуто",
      icon: Icon.CheckCircle,
      color: themeColors.orangeBookmark,
    },
    {
      key: null,
      label: "Не дивлюсь",
      icon: Icon.PlusCircle,
      color: themeColors.withoutBookmark,
    },
    {
      key: "on_hold",
      label: "Відкладено",
      icon: Icon.PauseCircle,
      color: themeColors.blueBookmark,
    },
    {
      key: "dropped",
      label: "Закинуто",
      icon: Icon.XCircle,
      color: themeColors.redBookmark,
    },
    {
      key: "watching",
      label: "Дивлюсь",
      icon: Icon.PlayCircle,
      color: themeColors.primary,
    },
  ];
  const favoritesMenuItems = [
    {
      key: "planned",
      label: "Заплановано",
      icon: Icon.PlusCircle,
      color: themeColors.yellowBookmark,
    },
    {
      key: "completed",
      label: "Переглянуто",
      icon: Icon.CheckCircle,
      color: themeColors.orangeBookmark,
    },
    {
      key: "on_hold",
      label: "Відкладено",
      icon: Icon.PauseCircle,
      color: themeColors.blueBookmark,
    },
    {
      key: "dropped",
      label: "Закинуто",
      icon: Icon.XCircle,
      color: themeColors.redBookmark,
    },
    {
      key: "watching",
      label: "Дивлюсь",
      icon: Icon.PlayCircle,
      color: themeColors.primary,
    },
    {
      key: "favourite",
      label: "Улюблене",
      icon: Icon.Heart,
      color: themeColors.pinkBookmark,
    },
  ];

  const menuItems = !isFavoritesTab ? defaultMenuItems : favoritesMenuItems;
  const selectedItem = menuItems.find((item) => item.key === currentStatus);

  return (
    <>
      {/* Overlay для закриття меню при натисканні поза FAB */}
      {isOpen && (
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)} />
      )}
      <View
        style={[
          styles.container,

          style,
          {
            right: 20,
            bottom: insets.bottom + bottomOffset,
          },
        ]}
      >
        {/* Елементи меню */}
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isSelected = currentStatus === item.key;

          // Затримка для кожного елемента (останній з'являється першим)
          const reverseIndex = menuItems.length - 1 - index;
          const delay = reverseIndex * 0.15;
          const startPoint = delay;
          const endPoint = Math.min(startPoint + 0.4, 1);

          const translateY = menuAnim.interpolate({
            inputRange: [0, startPoint, endPoint, 1],
            outputRange: [50, 50, 0, 0],
            extrapolate: "clamp",
          });

          const opacity = menuAnim.interpolate({
            inputRange: [0, startPoint, endPoint, 1],
            outputRange: [0, 0, 1, 1],
            extrapolate: "clamp",
          });

          const scale = menuAnim.interpolate({
            inputRange: [0, startPoint, endPoint, 1],
            outputRange: [0.8, 0.8, 1, 1],
            extrapolate: "clamp",
          });

          if (!isSelected) {
            return (
              <Animated.View
                key={item.key}
                style={{
                  transform: [{ translateY }, { scale }],
                  opacity,
                }}
                pointerEvents={isOpen ? "auto" : "none"}
              >
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    { backgroundColor: themeColors.subtle },
                  ]}
                  onPress={() => {
                    onStatusChange(isSelected ? null : item.key);
                    setIsOpen(false);
                  }}
                >
                  <IconComponent
                    size={size / 2}
                    color={item.color}
                    weight={isSelected ? "fill" : "regular"}
                  />
                  <Text selectable={true} style={[H4, { marginLeft: 5 }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }
        })}

        {/* FAB кнопка */}
        <View
          style={[
            styles.fab,
            {
              backgroundColor: themeColors.subtle,
              width: size,
              height: size,
              borderRadius: size / 4,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.fab,
              {
                width: size,
                height: size,
                borderRadius: size / 4,
                backgroundColor:
                  selectedItem.label === "Не дивлюсь"
                    ? themeColors.inActiveIcon
                    : `rgba(${Color(selectedItem.color).red()}, ${Color(selectedItem.color).green()}, ${Color(selectedItem.color).blue()}, 0.5)`,
              },
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.fab,
                {
                  transform: [{ scale: scaleAnim }],
                  width: size,
                  height: size,
                  borderRadius: size / 4,
                },
              ]}
            >
              {selectedItem ? (
                (() => {
                  const SelectedIcon = selectedItem.icon;
                  return (
                    <SelectedIcon
                      size={size / 2}
                      color={selectedItem.color}
                      weight={"fill"}
                    />
                  );
                })()
              ) : (
                <Icon.CircleTrash
                  size={size / 2}
                  color={themeColors.inActiveIcon}
                  weight={isOpen ? "fill" : "regular"}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    position: "absolute",
    alignItems: "flex-end",
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
});
