import { View, Text, StyleSheet } from "react-native";
import { H4, H6 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import React from "react";
import { TouchableOpacity } from "./Button";
import Icons from "../Styles/Icons";

export default function SettingsItem({
  title = "",
  subtitle = "",
  icon = null,
  iconColor = null,
  button = null,
  onPress,
  onPressBody,
  color,
  showChevron = false,
  disabled = false,
}) {
  const themeColors = useThemeColors();
  color = color || themeColors.primary;
  const effectiveIconColor = iconColor || themeColors.primary;

  const content = (
    <View style={styles.content}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: themeColors.Background(0.5) },
          ]}
        >
          {React.cloneElement(icon, {
            size: icon.props.size || 24,
            color: icon.props.color || effectiveIconColor,
          })}
        </View>
      )}
      <View style={[styles.textContainer, !icon && { marginLeft: 0 }]}>
        {title.length > 0 && (
          <Text
            style={[
              H4,
              {
                color: disabled ? themeColors.inActiveText : themeColors.text,
                fontWeight: "600",
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        {subtitle.length > 0 && (
          <Text
            style={[
              H6,
              {
                color: disabled
                  ? themeColors.Text(0.4)
                  : themeColors.Text(0.7),
              },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && !button && (
        <Icons.CaretRight size={24} color={themeColors.inActiveText} />
      )}
      {(button?.Icon || button?.Text) && (
        <TouchableOpacity
          style={[
            styles.button,
            {
              padding: button?.Icon ? 4 : 10,
              backgroundColor: button?.Icon ? "transparent" : color,
            },
          ]}
          onPress={onPress}
          disabled={disabled}
        >
          {button?.Icon ? (
            button?.Icon
          ) : (
            <Text style={[H4, { color: themeColors.text, textAlign: "center" }]}>
              {button.Text}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPressBody || (onPress && !button)) {
    return (
      <TouchableOpacity
        onPress={onPressBody || onPress}
        style={[styles.container, { backgroundColor: themeColors.subtle }]}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.subtle }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 2,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    marginRight: 8,
  },
  button: {
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
