import React from "react";
import { View, Image } from "react-native";
import { H3, H4, H5, Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTVSidebarNavStyles } from "../../Styles/components/TV/TVSidebarNavStyles";

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
  {
    name: "SettingsScreen",
    label: "Налаштування",
    icon: "GearSix",
    isHiddenStack: true,
  },
];

export default function TVSidebarNav({ state, navigation }) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const s = useTVSidebarNavStyles();

  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: themeColors.Background(0.95),
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      {/* App logo/title area */}
      <View style={s.logoArea}>
        <Image
          source={require("../../../assets/AniUA-Logo.png")}
          style={[s.logo]}
          resizeMode="contain"
        />
        <View style={{ flexDirection: "column" }}>
          <Text style={[H4, { color: themeColors.primary }]}>AniUA</Text>
          <Text style={[H4, { color: themeColors.text }]}>Аніме Cоловїною</Text>
        </View>
      </View>

      {/* Nav items */}
      <View style={s.navItems}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeRouteName === item.name;
          const IconComponent = Icons[item.icon];

          return (
            <TVButton
              key={item.name}
              style={[
                s.navItem,
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
                  s.navLabel,
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

