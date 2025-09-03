import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H2, H3, H4, H6 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import { TouchableOpacity } from "../Widgets/Button";
import { useNavigation } from "@react-navigation/native";

function Row({ icon, label, color }) {
  const theme = useThemeColors();
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, {}]}>{icon}</View>
      <Text style={[H4, { color: color ?? theme.White(0.7) }]}>{label}</Text>
    </View>
  );
}

export default function PrivilegesScreen() {
  const theme = useThemeColors();
  const navigation = useNavigation();

  const goDonate = () => {
    navigation.navigate("HiddenStack", {
      screen: "Donate",
      params: { arrowSide: "left", title: "" },
    });
  };

  return (
    <DefaultScreenWidget>
      <View style={styles.container}>
        {/* Кохай */}
        <Text style={[H2, { paddingLeft: 0 }]}>Кохай</Text>
        <View style={[styles.card]}>
          <Row
            label="Перегляд аніме"
            icon={<Icons.Eye size={34} color={theme.gray} />}
          />
          <Row
            label="Реклама в вбудованому плеєрі"
            icon={<Icons.Video size={34} color={theme.gray} />}
          />
          <Row
            label="Завантаження за рекламу"
            icon={<Icons.DownloadSimple size={34} color={theme.gray} />}
          />
        </View>

        {/* Divider */}
        <View
          style={[styles.divider, { backgroundColor: theme.White(0.12) }]}
        />

        {/* Сенпай */}
        <Text style={[H2, {}]}>Сенпай</Text>
        <View style={[styles.card, {}]}>
          <Row
            label="Кастомізація головного меню"
            color={theme.white}
            icon={<Icons.PaintBrush size={34} color={theme.appColor} />}
          />
          <Row
            label="Бета оновлення"
            color={theme.white}
            icon={<Icons.BoxArrowDown size={34} color={theme.appColor} />}
          />
          <Row
            label="Внутрішній плеєр без реклами"
            color={theme.white}
            icon={
              <Icons.DeviceMobileSpeaker
                size={34}
                color={theme.appColor}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            }
          />
          <Row
            label="Завантаження без обмежень"
            color={theme.white}
            icon={<Icons.DownloadSimple size={34} color={theme.appColor} />}
          />
          <Text style={[H6, { alignSelf: "center", color: theme.White(0.3) }]}>
            Лише за пожертву від 30 ₴
          </Text>
        </View>

        <TouchableOpacity
          onPress={goDonate}
          style={[styles.primaryBtn, { backgroundColor: theme.appColor }]}
        >
          <Text style={[H4, { color: theme.white }]}>Пожертвувати</Text>
        </TouchableOpacity>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 16,
  },
  card: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginVertical: 15,
    borderRadius: 1,
    width: "90%",
    alignSelf: "center",
  },
  primaryBtn: {
    alignSelf: "center",
    paddingHorizontal: 90,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 24,
  },
  skipBtn: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 14,
  },
});
