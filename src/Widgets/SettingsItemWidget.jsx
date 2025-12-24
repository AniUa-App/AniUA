import { View, Text, StyleSheet } from "react-native";
import { H4, H3, H6 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import React from "react";
import { TouchableOpacity } from "./Button";

export default function SettingsItem({
  title = "",
  subtitle = "",
  button = null,
  onPress,
  onPressBody = () => {},
  color,
}) {
  const themeColors = useThemeColors();
  color = color || themeColors.primary;
  let len = title.length;
  let lenSub = subtitle.length;
  return (
    <TouchableOpacity
      onPress={onPressBody}
      style={[styles.cacheBox, { backgroundColor: themeColors.subtle }]}
    >
      <View style={styles.textContainer}>
        {len > 1 && (
          <Text style={[H4, { color: themeColors.text, fontWeight: "600" }]}>
            {title}
          </Text>
        )}
        {lenSub > 1 && (
          <Text style={[H6, { color: themeColors.Text(0.7) }]}>{subtitle}</Text>
        )}
      </View>
      {button?.Icon !== null || button?.Text !== null ? (
        <TouchableOpacity
          style={[
            styles.button,
            {
              padding: button?.Icon ? 4 : 10,
              backgroundColor: color,
            },
          ]}
          onPress={onPress}
        >
          {button?.Icon ? (
            button?.Icon
          ) : (
            <Text
              style={[H4, { color: themeColors.text, textAlign: "center" }]}
            >
              {button.Text}
            </Text>
          )}
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cacheBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 2,
    paddingHorizontal: 12,
    paddingVertical: 12,

    borderRadius: 16,
    justifyContent: "space-between",
  },
  textContainer: {
    flexDirection: "column",
    width: "70%",
  },
  title: {},
  subtitle: {},
  button: {
    borderRadius: 8,
  },
});
