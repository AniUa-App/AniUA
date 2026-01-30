import React, { useCallback } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { H4, H6 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import { Episode } from "../../Api/AniuaApi";
import { styles } from "./styles";

export interface DownloadStatus {
  episode: number;
  status: "idle" | "downloading" | "completed" | "error";
  progress: number;
  error?: string;
}

interface BaseEpisodeItemProps {
  episode: Episode;
  anime: any;
}

interface WatchModeProps extends BaseEpisodeItemProps {
  mode: "watch";
  isWatched?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  player: string;
  useBuiltIn: boolean;
}

interface DownloadModeProps extends BaseEpisodeItemProps {
  mode: "download";
  isDownloaded: boolean;
  downloadStatus?: DownloadStatus;
  onDownloadPress: () => void;
  onOpenPress?: () => void;
  onSharePress?: () => void;
}

export type EpisodeItemProps = WatchModeProps | DownloadModeProps;

export const EpisodeItem = React.memo((props: EpisodeItemProps) => {
  const { episode, anime, mode } = props;
  const themeColors = useThemeColors();

  // Watch mode specific
  const isWatchMode = mode === "watch";
  const isWatched = isWatchMode ? (props as WatchModeProps).isWatched : false;
  const player = isWatchMode ? (props as WatchModeProps).player : "";
  const useBuiltIn = isWatchMode ? (props as WatchModeProps).useBuiltIn : false;

  // Download mode specific
  const isDownloadMode = mode === "download";
  const isDownloaded = isDownloadMode
    ? (props as DownloadModeProps).isDownloaded
    : false;
  const downloadStatus = isDownloadMode
    ? (props as DownloadModeProps).downloadStatus
    : undefined;
  const isDownloading = downloadStatus?.status === "downloading";
  const hasError = downloadStatus?.status === "error";
  const progress = downloadStatus?.progress || 0;

  const episodeName =
    episode.title_ua ||
    episode.title_en ||
    episode.title_jp ||
    anime?.title_ua ||
    anime?.title_en ||
    anime?.title_jp ||
    null;

  const handleShare = useCallback(async () => {
    if (!isWatchMode) return;

    const shareUrl = `https://aniua.yuzka.site/anime/${anime?.slug}/watch?episode=${episode.episode}&studio=${encodeURIComponent(episode.team)}&provider=${player}&time=0&build_in=${useBuiltIn}`;

    try {
      await Share.share({
        message: shareUrl,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  }, [
    anime?.slug,
    episode.episode,
    episode.team,
    player,
    useBuiltIn,
    isWatchMode,
  ]);

  const getBackgroundColor = () => {
    if (isWatchMode && isWatched) return themeColors.primary;
    if (isDownloadMode && isDownloaded) return themeColors.primary;
    if (isDownloadMode && hasError) return `${themeColors.primary}4D`; // 30% opacity
    return themeColors.background;
  };

  const handlePress = () => {
    if (isWatchMode) {
      (props as WatchModeProps).onPress();
    } else {
      const downloadProps = props as DownloadModeProps;
      if (isDownloaded && downloadProps.onOpenPress) {
        downloadProps.onOpenPress();
      } else if (!isDownloading) {
        downloadProps.onDownloadPress();
      }
    }
  };

  const handleLongPress = () => {
    if (isWatchMode && (props as WatchModeProps).onLongPress) {
      (props as WatchModeProps).onLongPress!();
    }
  };

  const renderActionButton = () => {
    if (isWatchMode) {
      return (
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon.ShareNetwork
            size={24}
            color={isWatched ? themeColors.subtle : themeColors.primary}
          />
        </TouchableOpacity>
      );
    }

    // Download mode
    if (isDownloading) {
      return null;
    }

    const downloadProps = props as DownloadModeProps;

    if (isDownloaded) {
      return (
        <TouchableOpacity
          onPress={downloadProps.onSharePress}
          style={styles.downloadButton}
        >
          <Icon.ShareNetwork size={28} color={themeColors.background} />
        </TouchableOpacity>
      );
    }

    if (hasError) {
      return (
        <TouchableOpacity
          onPress={downloadProps.onDownloadPress}
          style={[
            styles.downloadButton,
            { backgroundColor: `${themeColors.primary}33` },
          ]}
        >
          <Icon.ArrowClockwise size={28} color={themeColors.primary} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={downloadProps.onDownloadPress}
        style={styles.downloadButton}
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
      onLongPress={isWatchMode ? handleLongPress : undefined}
    >
      <View style={styles.episodeContent}>
        {episode.poster && (
          <Image
            uri={episode.poster}
            style={{
              width: 160,
              height: 90,
              borderRadius: 16,
            }}
            resizeMode="cover"
            onLoad={() => {}}
          />
        )}
        <View style={styles.episodeInfo}>
          <Text
            selectable={true}
            numberOfLines={2}
            style={[
              H4,
              {
                color: themeColors.text,
                fontWeight: isDownloadMode ? "100" : undefined,
                padding: episode.poster ? 0 : 8,
              },
            ]}
          >
            {episodeName}
          </Text>
          {episodeName && (
            <Text
              selectable={true}
              style={[
                H6,
                {
                  color: themeColors.text,
                  marginTop: isDownloadMode ? 8 : 0,
                  marginLeft: 8,
                },
              ]}
              numberOfLines={isDownloadMode ? 1 : 2}
            >
              Серія {episode.episode}
            </Text>
          )}
          {isDownloadMode && isDownloading && (
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
          {isDownloadMode && hasError && (
            <Text
              selectable={true}
              style={[H6, { color: themeColors.primary, marginTop: 2 }]}
              numberOfLines={1}
            >
              Помилка: натисніть для повтору
            </Text>
          )}
        </View>
        <View
          style={[
            styles.shareButtonContainer,
            {
              position: episode.poster ? "absolute" : "relative",
            },
          ]}
        >
          {renderActionButton()}
        </View>
      </View>
    </Pressable>
  );
});

EpisodeItem.displayName = "EpisodeItem";
