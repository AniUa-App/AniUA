import React from "react";
import { View, Text } from "react-native";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4 } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";

export default function InvalidLinkScreen({ route, navigation }) {
  const themeColors = useThemeColors();
  const { slug, code, message } = route?.params || {};

  return (
    <DefaultScreenWidget>
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
      >
        <Icons.LinkBreak size={56} color={themeColors.appColor} />
        <Text style={[H3, { color: themeColors.white, marginTop: 16, textAlign: "center" }]}>
          Посилання недійсне
        </Text>
        {slug ? (
          <Text style={[H4, { color: themeColors.white, opacity: 0.8, marginTop: 8, textAlign: "center" }]}>
            Не вдалося знайти сторінку для «{slug}».
          </Text>
        ) : null}
        <Text style={[H4, { color: themeColors.white, opacity: 0.6, marginTop: 4, textAlign: "center" }]}>
          Код помилки: {code ?? 404}
        </Text>
        {message ? (
          <Text style={[H4, { color: themeColors.white, opacity: 0.6, marginTop: 4, textAlign: "center" }]}>
            {String(message)}
          </Text>
        ) : null}

        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              backgroundColor: themeColors.appColor,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
          >
            <Icons.House size={22} color={themeColors.black} />
            <Text style={[H4, { color: themeColors.black, marginLeft: 8 }]}>На головну</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              paddingHorizontal: 18,
              paddingVertical: 12,
              backgroundColor: themeColors.black2 ?? themeColors.black,
              borderWidth: 1,
              borderColor: themeColors.white + "33",
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <Icons.ArrowLeft size={22} color={themeColors.white} />
            <Text style={[H4, { color: themeColors.white, marginLeft: 8 }]}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}
