import { View, Text, StyleSheet } from "react-native";
import { H4, H3, H6 } from "../Styles/Fonts";
import { appColor, white, White } from "../Styles/Colors";
import React from "react";
import { TouchableOpacity } from "./Button";

export default function SettingsItem({
  title,
  subtitle,
  button,
  onPress,
  onPressBody = () => {},
  color = appColor,
}) {
  let len = title.length;
  let lenSub = subtitle.length;
  return (
    <TouchableOpacity onPress={onPressBody} style={styles.cacheBox}>
      <View style={styles.textContainer}>
        {len > 1 && <Text style={[H4, styles.title]}>{title}</Text>}
        {lenSub > 1 && <Text style={[H6, styles.subtitle]}>{subtitle}</Text>}
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          {
            padding: button.Icon ? 4 : 10,
            backgroundColor: color,
          },
        ]}
        onPress={onPress}
      >
        {button.Icon ? (
          button.Icon
        ) : (
          <Text style={[H4, { color: white, textAlign: "center" }]}>
            {button.Text}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cacheBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    width: "100%",
    justifyContent: "space-between",
  },
  textContainer: {
    flexDirection: "column",
    width: "70%",
  },
  title: {
    color: white,
    fontWeight: "600",
  },
  subtitle: {
    color: White(0.7),
  },
  button: {
    backgroundColor: appColor,
    borderRadius: 8,
  },
});
