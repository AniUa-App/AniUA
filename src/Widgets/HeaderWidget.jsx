import { View, Text, StatusBar } from "react-native";
import { TouchableOpacity } from "./Button";
import { createStackNavigator } from "@react-navigation/stack";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import { useState, useEffect } from "react";
import { EventBus } from "../Global/EventBus";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNavbarWidth } from "../Styles/Responsive";

const Stack = createStackNavigator();

export default function Header({
  navigation,
  route,
  isArrow = true,
  title = "",
  arrowSide = "right",
}) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets?.() || { top: 0 };
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig")
  );

  useEffect(() => {
    setUserConfig(SettingsStorage.getParameter("userConfig"));
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.on("userConfig", (config) => {
      setUserConfig(config);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor:
          userConfig?.background?.isCustomisation &&
          userConfig?.background?.image
            ? "transparent"
            : themeColors.background,
        // Respect safe area on all platforms
        paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 10,
        paddingVertical: 10,
        // Avoid overlap with vertical MD3 navbar
        paddingLeft:
          userConfig?.navbar?.style === "MD3" &&
          userConfig?.navbar?.placedAt === "Ліворуч"
            ? getNavbarWidth() / 1.1
            : 25,
        paddingRight:
          userConfig?.navbar?.style === "MD3" &&
          userConfig?.navbar?.placedAt === "Праворуч"
            ? getNavbarWidth() / 1.1
            : 25,
      }}
    >
      {arrowSide === "left" && isArrow && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.ArrowLeft fill={themeColors.primary} size={34} />
        </TouchableOpacity>
      )}

      <Text
        style={[
          H3,
          {
            color: themeColors.text,
            paddingLeft: 10,
            flex: 1,
          },
        ]}
        numberOfLines={1}
      >
        {(() => {
          const explicitTitle =
            title != null && String(title).trim() !== "" ? String(title) : null;
          const paramsTitle =
            route?.params?.title != null ? String(route.params.title) : null;
          const chosen = explicitTitle ?? paramsTitle ?? "";
          const safe = String(chosen).trim() || "";
          return safe.length > 24 ? safe.slice(0, 24) + "..." : safe;
        })()}
      </Text>

      {/* Кнопка "Назад" справа */}
      {arrowSide === "right" && isArrow && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.ArrowLeft fill={themeColors.primary} size={34} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// <CustomHeader navigation={navigation} />
