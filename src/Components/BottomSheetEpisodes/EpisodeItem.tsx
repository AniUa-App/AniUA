import React, { useCallback } from "react";
import { View, Text, Pressable, Share } from "react-native";
import { H4, H6 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import { EpisodeItemProps } from "./types";
import { styles } from "./styles";

export const EpisodeItem = React.memo(
  ({
    episode,
    isWatched,
    onPress,
    onLongPress,
    anime,
    player,
    useBuiltIn,
  }: EpisodeItemProps) => {
    const themeColors = useThemeColors();

    const handleShare = useCallback(async () => {
      const shareUrl = `https://aniua.yuzka.site/anime/${anime.slug}/watch?episode=${episode.episode}&studio=${encodeURIComponent(episode.team)}&provider=${player}&time=0&build_in=${useBuiltIn}`;

      try {
        await Share.share({
          message: shareUrl,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    }, [anime, episode.episode, episode.team, player, useBuiltIn]);

    const episodeName =
      episode.title_ua ||
      episode.title_en ||
      episode.title_jp ||
      anime.title_ua ||
      anime.title_en ||
      anime.title_jp ||
      null;

    const getBackgroundColor = () => {
      if (isWatched) return themeColors.primary;
      return themeColors.background;
    };

    return (
      <Pressable
        style={[
          styles.episodeItem,
          {
            backgroundColor: getBackgroundColor(),
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
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
              <Text
                style={[
                  H6,
                  {
                    color: themeColors.text,
                  },
                ]}
                numberOfLines={2}
              >
                Серія {episode.episode}
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
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.shareButton, {}]}
            >
              <Icon.ShareNetwork
                size={24}
                color={isWatched ? themeColors.subtle : themeColors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  }
);

EpisodeItem.displayName = "EpisodeItem";
