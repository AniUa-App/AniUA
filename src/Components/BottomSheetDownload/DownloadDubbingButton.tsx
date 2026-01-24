import React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H4, H5 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { Player } from "./types";
import { styles } from "./styles";

interface DownloadDubbingButtonProps {
  dubbingName: string;
  currentPlayer: Player;
  onPress: () => void;
  onOpenFolder?: () => void;
}

export const DownloadDubbingButton = React.memo(
  ({
    dubbingName,
    currentPlayer,
    onPress,
    onOpenFolder,
  }: DownloadDubbingButtonProps) => {
    const themeColors = useThemeColors();

    return (
      <View style={styles.dubbingButtonContainer}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[H4, { color: themeColors.text, marginLeft: 4 }]}>
            Озвучка:
          </Text>
          <TouchableOpacity
            style={[
              styles.dubbingChip,
              { backgroundColor: themeColors.subtle },
            ]}
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
        </View>

        {onOpenFolder && (
          <TouchableOpacity
            style={[
              styles.dubbingChip,
              {
                backgroundColor: themeColors.subtle,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 16,
                width: 44,
                height: 44,
              },
            ]}
            onPress={onOpenFolder}
          >
            <Icon.FolderOpen size={28} color={themeColors.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

DownloadDubbingButton.displayName = "DownloadDubbingButton";
