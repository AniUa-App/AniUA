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
import { getNavbarWidth, useIsTV } from "../Styles/Responsive";

const Stack = createStackNavigator();

export default function Header({
  navigation,
  route,
  isArrow = true,
  title = "",
}) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets?.() || { top: 0 };
  const isTV = useIsTV();
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
        justifyContent: "flex-start",
        backgroundColor: "transparent",
        paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + 10,
        paddingVertical: 10,
        paddingLeft: 16,
      }}
    >
      {isArrow && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: themeColors.accent,
            padding: isTV ? 10 : 6,
            borderRadius: 16,
            minWidth: isTV ? 52 : undefined,
            minHeight: isTV ? 52 : undefined,
            alignItems: "center",
            justifyContent: "center",
          }}
          hasTVPreferredFocus={isTV}
        >
          <Icons.ArrowLeft fill={themeColors.primary} size={isTV ? 36 : 28} />
        </TouchableOpacity>
      )}

      <Text
        selectable={true}
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
    </View>
  );
}

// <CustomHeader navigation={navigation} />
