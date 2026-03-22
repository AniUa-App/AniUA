import { View, Text } from "react-native";
import { TouchableOpacity } from "./Button";
import { createStackNavigator } from "@react-navigation/stack";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import SettingsStorage from "../Storage/SettingsStorage";
import { useState, useEffect } from "react";
import { EventBus } from "../Global/EventBus";
import { getNavbarWidth, useIsTV } from "../Styles/Responsive";
import { useHeaderStyles } from "../Styles/components/HeaderWidgetStyles";

const Stack = createStackNavigator();

export default function Header({
  navigation,
  route,
  isArrow = true,
  title = "",
}) {
  const themeColors = useThemeColors();
  const s = useHeaderStyles();
  const isTV = useIsTV();
  const [userConfig, setUserConfig] = useState(
    SettingsStorage.getParameter("userConfig"),
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
    <View style={s.container}>
      {isArrow && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backButton}
          hasTVPreferredFocus={isTV}
        >
          <Icons.ArrowLeft fill={themeColors.primary} size={s.icon.size} />
        </TouchableOpacity>
      )}

      <Text selectable={true} style={s.title} numberOfLines={1}>
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
