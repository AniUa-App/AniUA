import { View, Text as TextNative, StyleSheet, ScrollView } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import React from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4 } from "../Styles/Fonts";
import { appColor } from "../Styles/Colors";
import Config from "../cfgs/MainConfig";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-root-toast";
import { AppIcon } from "../Styles/Icons";
import * as Updates from "expo-updates";
import Constants from "expo-constants";

export default function AppInfoScreen() {
  const expoChannel =
    (Updates && Updates.channel) ||
    Constants?.expoConfig?.updates?.channel ||
    "unknown";
  const updateId = (Updates && Updates.updateId) || null;
  const jsBundleHash = Updates?.manifest?.launchAsset?.hash || null;
  const APP_INFO = [
    { title: "Версія", value: String(Config.devInfo.version || "unknown") },
    { title: "Build ID", value: String(Config.devInfo.buildId || "unknown") },
    {
      title: "Git (short)",
      value: String(
        Config.devInfo.gitShortHash || Config.devInfo.gitHash || "unknown"
      ),
    },
    { title: "Git (full)", value: String(Config.devInfo.gitHash || "unknown") },
    {
      title: "Дата збірки",
      value: String(Config.devInfo.buildDate || "unknown"),
    },
    { title: "Expo канал", value: String(expoChannel) },
    { title: "EAS Update ID", value: String(updateId || "unknown") },
    { title: "EAS fingerprint", value: String(jsBundleHash || "unknown") },
    { title: "Bundle ID", value: String(Config.devInfo.bundleId || "unknown") },
    {
      title: "Пристрій",
      value: String(Config.devInfo.deviceName || "Unknown Device"),
    },
    { title: "Модель", value: String(Config.devInfo.model || "Unknown") },
    {
      title: "Система",
      value:
        `${Config.devInfo.systemName || "OS"} ${Config.devInfo.systemVersion || ""}`.trim(),
    },
    { title: "Device ID", value: String(Config.devInfo.deviceId || "unknown") },
  ];

  return (
    <DefaultScreenWidget>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <View style={{ marginTop: 6 }}>
          {APP_INFO.map((item, index) => (
            <InfoRow
              key={`${item.title}-${index}`}
              title={item.title}
              value={item.value}
            />
          ))}
        </View>
      </ScrollView>
    </DefaultScreenWidget>
  );
}
function InfoRow({ title = "", value = "" }) {
  const themeColors = useThemeColors();
  const onCopy = () => {
    Clipboard.setString(String(value));
    Toast.show("Скопійовано", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: themeColors.appColor,
      textColor: themeColors.white,
      shadow: false,
    });
  };

  return (
    <TouchableOpacity onPress={onCopy} activeOpacity={0.8} style={styles.row}>
      <View style={styles.rowTextContainer}>
        {title?.length > 0 && (
          <TextNative style={[H4, { color: themeColors.white, opacity: 0.9 }]}>
            {title}
          </TextNative>
        )}
      </View>
      <View style={[styles.valuePill, { backgroundColor: appColor }]}>
        <TextNative
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[H4, { color: themeColors.white, maxWidth: 220 }]}
        >
          {String(value)}
        </TextNative>
      </View>
    </TouchableOpacity>
  );
}

function Header() {
  const themeColors = useThemeColors();
  return (
    <View style={styles.header}>
      <AppIcon styles={{ width: 56, height: 56, borderRadius: 12 }} />
      <View style={{ marginLeft: 12 }}>
        <TextNative
          style={[H3, { color: themeColors.white, fontWeight: "700" }]}
        >
          Про застосунок
        </TextNative>
        <TextNative style={[H4, { color: themeColors.white, opacity: 0.7 }]}>
          AniUA • {String(Config.devInfo.version || "unknown")}
        </TextNative>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  rowTextContainer: {
    paddingRight: 16,
    maxWidth: "55%",
  },
  valuePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: "45%",
  },
});
