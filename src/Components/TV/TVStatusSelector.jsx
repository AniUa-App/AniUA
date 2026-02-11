import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";

const STATUSES = [
  { key: "favourite", label: "Улюблене", icon: "Heart" },
  { key: "watching", label: "Дивлюсь", icon: "Play" },
  { key: "completed", label: "Переглянуто", icon: "Check" },
  { key: "planned", label: "Заплановано", icon: "Clock" },
  { key: "dropped", label: "Закинуто", icon: "X" },
];

export default function TVStatusSelector({
  currentStatus,
  onStatusChange,
  isFavoritesTab = true,
}) {
  const themeColors = useThemeColors();

  return (
    <View style={styles.container}>
      {STATUSES.map((status) => {
        const isActive = currentStatus === status.key;
        const IconComponent = Icons[status.icon];

        return (
          <TVButton
            key={status.key}
            style={[
              styles.button,
              {
                backgroundColor: isActive
                  ? themeColors.primary
                  : themeColors.subtle,
              },
            ]}
            onPress={() => onStatusChange(status.key)}
            hasTVPreferredFocus={isActive}
          >
            {IconComponent && (
              <IconComponent
                size={24}
                color={isActive ? themeColors.background : themeColors.text}
                weight={isActive ? "fill" : "regular"}
              />
            )}
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? themeColors.background : themeColors.text,
                },
              ]}
            >
              {status.label}
            </Text>
          </TVButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: TV.padding.screen,
    paddingVertical: 16,
    flexWrap: "wrap",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: TV.button.borderRadius,
    minHeight: TV.button.minHeight,
  },
  label: {
    fontFamily: "Nunito-SemiBold",
  },
});
