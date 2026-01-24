import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { H4, H6 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import { DownloadEpisodeItemProps } from "./types";
import { useWindowDimensions } from "react-native";
import { styles } from "./styles";

export const DownloadEpisodeItem = React.memo(
  ({
    episode,
    anime,
    isDownloaded,
    downloadStatus,
    onDownloadPress,
    onOpenPress,
    onSharePress,
  }: DownloadEpisodeItemProps) => {
    const themeColors = useThemeColors();

    const episodeName =
      episode.title_ua ||
      episode.title_en ||
      episode.title_jp ||
      anime.title_ua ||
      anime.title_en ||
      anime.title_jp ||
      null;

    const isDownloading = downloadStatus?.status === "downloading";
    const hasError = downloadStatus?.status === "error";
    const progress = downloadStatus?.progress || 0;

    const getBackgroundColor = () => {
      if (isDownloaded) return themeColors.primary;
      if (hasError) return themeColors.Primary(0.3);
      return themeColors.background;
    };

    const handlePress = () => {
      if (isDownloaded && onOpenPress) {
        onOpenPress();
      } else if (!isDownloading) {
        onDownloadPress();
      }
    };

    const renderDownloadButton = () => {
      if (isDownloading) {
        return null;
      }

      if (isDownloaded) {
        return (
          <TouchableOpacity
            onPress={onSharePress}
            style={[styles.downloadButton]}
          >
            <Icon.ShareNetwork size={28} color={themeColors.background} />
          </TouchableOpacity>
        );
      }

      if (hasError) {
        return (
          <TouchableOpacity
            onPress={onDownloadPress}
            style={[
              styles.downloadButton,
              { backgroundColor: themeColors.Primary(0.2) },
            ]}
          >
            <Icon.ArrowClockwise size={28} color={themeColors.primary} />
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          onPress={onDownloadPress}
          style={[styles.downloadButton]}
        >
          <Icon.DownloadSimple size={28} color={themeColors.primary} />
        </TouchableOpacity>
      );
    };

    return (
      <Pressable
        style={[
          styles.episodeItem,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
        onPress={handlePress}
      >
        <View style={styles.episodeContent}>
          {episode.poster && (
            <Image
              uri={episode.poster}
              style={[styles.episodePoster]}
              resizeMode="cover"
              onLoad={() => {}}
            />
          )}
          <View style={styles.episodeInfo}>
            <Text
              numberOfLines={2}
              style={[
                H4,
                {
                  color: themeColors.text,
                  fontWeight: "100",
                  padding: episode.poster ? 0 : 8,
                },
              ]}
            >
              {episodeName}
            </Text>
            {episodeName && (
              <Text style={[H6, { marginTop: 8 }]} numberOfLines={1}>
                Серія {episode.episode}
              </Text>
            )}
            {isDownloading && (
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: themeColors.subtle, marginTop: 4 },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: themeColors.primary,
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>
            )}
            {hasError && (
              <Text
                style={[H6, { color: themeColors.primary, marginTop: 2 }]}
                numberOfLines={1}
              >
                Помилка: натисніть для повтору
              </Text>
            )}
          </View>
          {renderDownloadButton()}
        </View>
      </Pressable>
    );
  }
);

DownloadEpisodeItem.displayName = "DownloadEpisodeItem";
