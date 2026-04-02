import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useThemeColors } from "../Global/useTheme";
import Icon from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { H5 } from "../Styles/Fonts";
import { useWatchButtonStyles } from "../Styles/components/WatchButtonStyles";

export enum WatchButtonState {
  LOADING = "Завантаження контенту...",
  NO_TRANSLATION = "Немає перекладу",
  START_WATCHING = "Почати перегляд",
  CONTINUE_WATCHING = "Дивитись",
  
}

interface WatchButtonProps {
  onWatchPress?: () => void;
  onDownloadPress?: () => void;
  style?: ViewStyle;
  label?: WatchButtonState | string;
  isDownloadable?: boolean;
  isActive: boolean;
}

export default function WatchButton({
  onWatchPress,
  onDownloadPress,
  style,
  label,
  isDownloadable = true,
  isActive,
}: WatchButtonProps) {
  const colors = useThemeColors();
  const s = useWatchButtonStyles();

  return (
    <View style={[s.container, {}, style]}>
      <TouchableOpacity
        style={[
          s.watchButton,
          { backgroundColor: isActive ? colors.primary : colors.Primary(0.3) },
        ]}
        onPress={isActive ? onWatchPress : null}
        activeOpacity={0.7}
      >
        <Text
          selectable={true}
          style={[H5, { color: isActive ? colors.text : colors.inActiveText }]}
        >
          {label || WatchButtonState.LOADING}
        </Text>
      </TouchableOpacity>

      {isDownloadable && (
        <TouchableOpacity
          style={[
            s.downloadButton,
            {
              borderLeftColor: colors.background,
              backgroundColor: isActive ? colors.primary : colors.Primary(0.3),
            },
          ]}
          onPress={isActive ? onDownloadPress : null}
          activeOpacity={0.7}
        >
          <Icon.DownloadSimple
            size={24}
            color={isActive ? colors.icon : colors.inActiveText}
            weight="regular"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
