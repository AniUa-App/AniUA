import React, { useRef, useCallback } from "react";
import { View, ScrollView } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";
import { useTVStatusSelectorStyles } from "../../Styles/components/TV/TVStatusSelectorStyles";

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
  const s = useTVStatusSelectorStyles();
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
      style={s.scrollView}
      contentContainerStyle={s.container}
    >
      {STATUSES.map((status) => {
        const isActive = currentStatus === status.key;
        const IconComponent = Icons[status.icon];

        return (
          <TVButton
            key={status.key}
            style={[
              s.tab,
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
            <View style={s.tabContent}>
              {IconComponent && (
                <IconComponent
                  size={18}
                  color={themeColors[status.colorKey]}
                  weight="fill"
                />
              )}
              <Text
                style={[
                  s.label,
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

