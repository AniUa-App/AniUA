import React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H4, H5 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { DubbingButtonProps } from "./types";
import { styles } from "./styles";

export const DubbingButton = React.memo(
  ({
    dubbingName,
    currentPlayer,
    onPress,
    useBuiltIn,
    onPlayerTypeToggle,
  }: DubbingButtonProps) => {
    const themeColors = useThemeColors();

    return (
      <View style={styles.dubbingButtonContainer}>
        <Text style={[H4, { color: themeColors.text }]}>Озвучка:</Text>
        <TouchableOpacity
          style={[styles.dubbingChip, { backgroundColor: themeColors.subtle }]}
          onPress={onPress}
        >
          {currentPlayer.icon}
          <Text
            style={[H5, { color: themeColors.primary, marginLeft: 8 }]}
            numberOfLines={1}
          >
            {dubbingName.length > 12
              ? dubbingName.slice(0, 12) + "..."
              : dubbingName || "Вибрати"}
          </Text>
          <Icon.CaretRight size={24} color={themeColors.primary} />
        </TouchableOpacity>

        {/* Player Type Selector */}
        <View style={styles.playerTypeContainer}>
          <TouchableOpacity
            style={[
              styles.playerTypeTab,
              { backgroundColor: themeColors.subtle },
            ]}
            onPress={() => onPlayerTypeToggle(true)}
          >
            <Icon.MonitorPlay
              size={32}
              color={useBuiltIn ? themeColors.primary : themeColors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.playerTypeTab,
              { backgroundColor: themeColors.subtle },
            ]}
            onPress={() => onPlayerTypeToggle(false)}
          >
            <Icon.Globe
              size={32}
              color={!useBuiltIn ? themeColors.primary : themeColors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

DubbingButton.displayName = "DubbingButton";
