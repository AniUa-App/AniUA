import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useThemeColors } from "../Global/useTheme";
import Icon from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { H5 } from "../Styles/Fonts";

export enum WatchButtonState {
  LOADING = "Завантаження...",
  NO_TRANSLATION = "Немає перекладу",
  START_WATCHING = "Почати перегляд",
  CONTINUE_WATCHING = "Дивитись",
}

interface WatchButtonProps {
  onWatchPress?: () => void;
  onDownloadPress?: () => void;
  style?: ViewStyle;
  label?: WatchButtonState;
  isDownloadable?: boolean;
}

export default function WatchButton({
  onWatchPress,
  onDownloadPress,
  style,
  label,
  isDownloadable = true,
}: WatchButtonProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, {}, style]}>
      <TouchableOpacity
        style={[styles.watchButton, { backgroundColor: colors.primary }]}
        onPress={onWatchPress}
        activeOpacity={0.7}
      >
        <Text style={[H5]}>{label || WatchButtonState.LOADING}</Text>
      </TouchableOpacity>

      {isDownloadable && (
        <TouchableOpacity
          style={[
            styles.downloadButton,
            {
              borderLeftColor: colors.background,
              backgroundColor: colors.primary,
            },
          ]}
          onPress={onDownloadPress}
          activeOpacity={0.7}
        >
          <Icon.DownloadSimple size={24} color={colors.text} weight="regular" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    width: 44,
    height: 44,
  },
  watchButton: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  downloadButton: {
    width: "18%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
  },
});
