import React from "react";
import { View, Text, Linking } from "react-native";
import { usePrivilegesStyles } from "../Styles/components/Screens/PrivilegesStyles";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H2, H3, H4, H6 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import { TouchableOpacity } from "../Widgets/Button";
import { useNavigation } from "@react-navigation/native";

function Row({ icon, label, color }) {
  const theme = useThemeColors();
  const s = usePrivilegesStyles();
  return (
    <View style={s.row}>
      <View style={[s.iconBox, {}]}>{icon}</View>
      <Text selectable={true} style={[H4, { color: color ?? theme.Text(0.7) }]}>
        {label}
      </Text>
    </View>
  );
}

export default function PrivilegesScreen() {
  const theme = useThemeColors();
  const s = usePrivilegesStyles();
  const navigation = useNavigation();

  const goDonate = () => {
    navigation.navigate("HiddenStack", {
      screen: "Donate",
      params: { arrowSide: "left", title: "" },
    });
  };

  return (
    <DefaultScreenWidget>
      <View style={s.container}>
        {/* Кохай */}
        <Text selectable={true} style={[H2, { paddingLeft: 0 }]}>
          Кохай
        </Text>
        <View style={[s.card]}>
          <Row
            label="Перегляд аніме"
            icon={<Icons.Eye size={34} color={theme.inActiveText} />}
          />
          <Row
            label="Реклама в вбудованому плеєрі"
            icon={<Icons.Video size={34} color={theme.inActiveText} />}
          />
          <Row
            label="Завантаження за рекламу"
            icon={<Icons.DownloadSimple size={34} color={theme.inActiveText} />}
          />
        </View>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: theme.Text(0.12) }]} />

        {/* Сенпай */}
        <Text selectable={true} style={[H2, {}]}>
          Сенпай
        </Text>
        <View style={[s.card, {}]}>
          <Row
            label="Кастомізація головного меню"
            color={theme.text}
            icon={<Icons.PaintBrush size={34} color={theme.primary} />}
          />
          <Row
            label="Бета оновлення"
            color={theme.text}
            icon={<Icons.BoxArrowDown size={34} color={theme.primary} />}
          />
          <Row
            label="Внутрішній плеєр без реклами"
            color={theme.text}
            icon={
              <Icons.DeviceMobileSpeaker
                size={34}
                color={theme.primary}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            }
          />
          <Row
            label="Завантаження без обмежень"
            color={theme.text}
            icon={<Icons.DownloadSimple size={34} color={theme.primary} />}
          />
          <Text
            selectable={true}
            style={[H6, { alignSelf: "center", color: theme.Text(0.3) }]}
          >
            Лише за пожертву від 30 ₴
          </Text>
        </View>

        <TouchableOpacity
          onPress={goDonate}
          style={[s.primaryBtn, { backgroundColor: theme.primary }]}
        >
          <Text selectable={true} style={[H4, { color: theme.text }]}>
            Пожертвувати
          </Text>
        </TouchableOpacity>
      </View>
    </DefaultScreenWidget>
  );
}

