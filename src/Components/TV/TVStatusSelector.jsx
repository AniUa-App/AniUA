import React, { useRef, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";

const STATUSES = [
  {
    key: "favourite",
    label: "Улюблене",
    icon: "Heart",
    colorKey: "pinkBookmark",
  },
  {
    key: "watching",
    label: "Дивлюсь",
    icon: "PlayCircle",
    colorKey: "primary",
  },
  {
    key: "planned",
    label: "Заплановано",
    icon: "PlusCircle",
    colorKey: "yellowBookmark",
  },
  {
    key: "completed",
    label: "Переглянуто",
    icon: "CheckCircle",
    colorKey: "orangeBookmark",
  },
  {
    key: "on_hold",
    label: "Відкладено",
    icon: "PauseCircle",
    colorKey: "blueBookmark",
  },
  {
    key: "dropped",
    label: "Закинуто",
    icon: "XCircle",
    colorKey: "redBookmark",
  },
];

export default function TVStatusSelector({
  currentStatus,
  onStatusChange,
  isFavoritesTab = true,
}) {
  const themeColors = useThemeColors();
  const lastPressTime = useRef(0);

  const handlePress = useCallback(
    (key) => {
      const now = Date.now();
      if (now - lastPressTime.current < 300) return;
      lastPressTime.current = now;
      onStatusChange(key);
    },
    [onStatusChange],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {STATUSES.map((status) => {
        const isActive = currentStatus === status.key;
        const IconComponent = Icons[status.icon];

        return (
          <TVButton
            key={status.key}
            style={[
              styles.tab,
              {
                backgroundColor: themeColors.accent,
                borderBottomLeftRadius: isActive ? 0 : 18,
                borderBottomRightRadius: isActive ? 0 : 18,
                height: isActive ? 40 : 34,
                paddingBottom: isActive ? 2 : 0,
              },
            ]}
            onPress={() => handlePress(status.key)}
            hasTVPreferredFocus={isActive}
          >
            <View style={styles.tabContent}>
              {IconComponent && (
                <IconComponent
                  size={18}
                  color={themeColors[status.colorKey]}
                  weight="fill"
                />
              )}
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive
                      ? themeColors.text
                      : themeColors.inActiveText,
                  },
                ]}
              >
                {status.label}
              </Text>
            </View>
          </TVButton>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: TV.padding.screen,
    paddingVertical: 16,
    height: 55,
    gap: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Nunito-SemiBold",
    marginLeft: 6,
  },
});
