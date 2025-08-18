import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H2, H3, H4, H6 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import { TouchableOpacity } from "../Widgets/Button";

function Row({ icon, label, color }) {
  const theme = useThemeColors();
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: theme.Black(0.3) }]}>
        {icon}
      </View>
      <Text style={[H4, { color: color ?? theme.white }]}>{label}</Text>
    </View>
  );
}

export default function PrivilegesScreen({ navigation }) {
  const theme = useThemeColors();

  const goDonate = () => {
    // Replace with your donation link if you have a specific one
    Linking.openURL("https://send.monobank.ua/jar/000000000000000000000000");
  };

  const onSkip = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate("MainTabs");
  };

  return (
    <DefaultScreenWidget>
      <View style={styles.container}>
        <Text style={[H2, { marginBottom: 16 }]}>Привілеї</Text>

        {/* Кохай */}
        <Text style={[H3, { marginBottom: 8 }]}>Кохай</Text>
        <View style={[styles.card, { backgroundColor: theme.Black(0.6) }]}>
          <Row
            label="Перегляд аніме"
            icon={<Icons.Eye size={22} color={theme.white} weight="regular" />}
          />
          <Row
            label="Реклама в вбудованому плеєрі"
            icon={<Icons.PlayCircle size={22} color={theme.white} weight="regular" />}
          />
          <Row
            label="Завантаження за рекламу"
            icon={<Icons.DownloadSimple size={22} color={theme.white} weight="regular" />}
          />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: theme.White(0.12) }]} />

        {/* Сенпай */}
        <Text style={[H3, { marginBottom: 8 }]}>Сенпай</Text>
        <View style={[styles.card, { backgroundColor: theme.Black(0.6) }]}>
          <Row
            label="Кастомізація головного меню"
            color={theme.appColor}
            icon={<Icons.PencilSimple size={22} color={theme.appColor} weight="regular" />}
          />
          <Row
            label="Бета оновлення"
            color={theme.appColor}
            icon={<Icons.CloudArrowDown size={22} color={theme.appColor} weight="regular" />}
          />
          <Row
            label="Внутрішній плеєр без реклами"
            color={theme.appColor}
            icon={<Icons.DeviceMobileCamera size={22} color={theme.appColor} weight="regular" />}
          />
          <Row
            label="Завантаження без обмежень"
            color={theme.appColor}
            icon={<Icons.DownloadSimple size={22} color={theme.appColor} weight="regular" />}
          />
        </View>

        <Text style={[H6, { color: theme.White(0.5), marginTop: 8 }]}>Лише за пожертву від 30 ₴</Text>

        <TouchableOpacity onPress={goDonate} style={[styles.primaryBtn, { backgroundColor: theme.appColor }]}>
          <Text style={[H3, { color: theme.white }]}>Пожертвувати</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} style={[styles.skipBtn, { backgroundColor: theme.White(0.1) }]}>
          <Text style={[H4, { color: theme.White(0.8) }]}>Пропустити</Text>
          <Icons.ArrowRight size={20} color={theme.White(0.8)} />
        </TouchableOpacity>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  card: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
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
    marginVertical: 12,
    borderRadius: 1,
  },
  primaryBtn: {
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
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
