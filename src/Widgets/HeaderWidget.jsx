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

export default function Header({
  navigation,
  route,
  isArrow = true,
  title = "",
  arrowSide = "right",
}) {
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
      {arrowSide === "left" && isArrow && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.ArrowLeft fill={themeColors.appColor} size={34} />
        </TouchableOpacity>
      )}

      <Text
        style={[
          H3,
          {
            color: themeColors.white,
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
          <Icons.ArrowLeft fill={themeColors.appColor} size={34} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// <CustomHeader navigation={navigation} />
