import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ITEMS = [
  { name: "Home", label: "Головна", icon: "House" },
  {
    name: "SearchScreen",
    label: "Пошук",
    icon: "MagnifyingGlass",
    isHiddenStack: true,
  },
  { name: "Bookmarks", label: "Обрані", icon: "BookmarkSimple" },
  { name: "Profile", label: "Профіль", icon: "UserCircle" },
];

export default function TVSidebarNav({ state, navigation }) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();

  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.Background(0.95),
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      {/* App logo/title area */}
      <View style={styles.logoArea}>
        <Text style={[styles.appTitle, { color: themeColors.primary }]}>
          AniUA
        </Text>
      </View>

      {/* Nav items */}
      <View style={styles.navItems}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeRouteName === item.name;
          const IconComponent = Icons[item.icon];

          return (
            <TVButton
              key={item.name}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: themeColors.Primary(0.15),
                },
              ]}
              onPress={() => {
                if (item.isHiddenStack) {
                  navigation.navigate("HiddenStack", {
                    screen: item.name,
                  });
                } else {
                  navigation.navigate(item.name);
                }
              }}
              hasTVPreferredFocus={isActive}
            >
              {IconComponent && (
                <IconComponent
                  size={28}
                  color={isActive ? themeColors.primary : themeColors.text}
                  weight={isActive ? "fill" : "regular"}
                />
              )}
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive ? themeColors.primary : themeColors.text,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TVButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: TV.sidebar.width,
    zIndex: 10,
    justifyContent: "flex-start",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
  },
  logoArea: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  appTitle: {
    fontFamily: "Nunito-Bold",
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: TV.button.borderRadius,
    minHeight: 56,
  },
  navLabel: {
    fontFamily: "Nunito-SemiBold",
  },
});
