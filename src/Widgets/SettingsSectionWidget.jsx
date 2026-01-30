import { View, Text, StyleSheet } from "react-native";
import { H5 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import React from "react";

export default function SettingsSection({ title, children }) {
  const themeColors = useThemeColors();

  return (
    <View style={styles.container}>
      {title && (
        <Text
          selectable={true}
          style={[H5, styles.title, { color: themeColors.Text(0.6) }]}
        >
          {title}
        </Text>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 12,
  },
  content: {
    gap: 2,
  },
});
