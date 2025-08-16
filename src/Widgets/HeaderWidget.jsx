import { View, Text, StatusBar } from "react-native";
import { TouchableOpacity } from "./Button";
import { createStackNavigator } from "@react-navigation/stack";
import Icons from "../Styles/Icons";
import { appColor, Black, black, white } from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import { useState, useEffect } from "react";
import { EventBus } from "../Global/EventBus";

const Stack = createStackNavigator();

export default function Header({ navigation, route, isArrow = true, title }) {
  const themeColors = useThemeColors();
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
            : themeColors.black,
        paddingTop: StatusBar.currentHeight + 10,
        paddingVertical: 10,
        paddingHorizontal: 25,
      }}
    >
      {/* Название экрана */}
      <Text style={[H3, { color: themeColors.white }]} numberOfLines={1}>
        {(() => {
          const fallback = route?.name || "";
          const rawTitle = title ?? route?.params?.title ?? fallback;
          if (typeof rawTitle !== "string") return fallback;
          return rawTitle.length > 24
            ? rawTitle.slice(0, 24) + "..."
            : rawTitle;
        })()}
      </Text>

      {/* Кнопка "Назад" справа */}
      {isArrow && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.ArrowLeft fill={themeColors.appColor} size={34} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// <CustomHeader navigation={navigation} />
