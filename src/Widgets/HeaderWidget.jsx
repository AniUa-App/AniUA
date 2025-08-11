import { View, Text, StatusBar } from "react-native";
import { TouchableOpacity } from "./Button";
import { createStackNavigator } from "@react-navigation/stack";
import Icons from "../Styles/Icons";
import { appColor, black, white } from "../Styles/Colors";
import { H3 } from "../Styles/Fonts";

const Stack = createStackNavigator();

export default function Header({ navigation, route, isArrow = true }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: black,
        paddingTop: StatusBar.currentHeight + 10,
        paddingVertical: 10,
        paddingHorizontal: 25,
      }}
    >
      {/* Название экрана */}
      <Text style={[H3, { color: white }]} numberOfLines={1}>
        {route.params.title?.length > 24
          ? route.params.title.slice(0, 24) + "..."
          : route.params.title}
      </Text>

      {/* Кнопка "Назад" справа */}
      {isArrow && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.ArrowLeft fill={appColor} size={34} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// <CustomHeader navigation={navigation} />
