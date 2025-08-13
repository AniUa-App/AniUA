import { View, Text, StyleSheet } from "react-native";
import { H4, H3, H6 } from "../Styles/Fonts";
import { appColor, white, White, black } from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import React from "react";
import { TouchableOpacity } from "./Button";
import Icons from "../Styles/Icons";

export default function SwitchWidget({
  title = "",
  subtitle = "",
  onPress = () => {},
  value,
  onPressBody = () => {},
}) {
  const themeColors = useThemeColors();
  let len = title.length;
  let lenSub = subtitle.length;
  if (value === undefined) {
    onPress();
  }
  return (
    <TouchableOpacity onPress={onPressBody} style={styles.cacheBox}>
      <View style={styles.textContainer}>
        {len > 1 && (
          <Text style={[H4, { color: themeColors.white, fontWeight: "600" }]}>
            {title}
          </Text>
        )}
        {lenSub > 1 && (
          <Text style={[H6, { color: White(0.7) }]}>{subtitle}</Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          {
            padding: 10,
            backgroundColor: appColor,
          },
        ]}
        onPress={onPress}
      >
        {value ? (
          <Icons.ToggleRight size={34} color={white} />
        ) : (
          <Icons.ToggleLeft size={34} color={black} />
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
  title: {},
  subtitle: {},
  button: {
    backgroundColor: appColor,
    borderRadius: 8,
  },
});
