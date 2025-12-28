import { useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Linking,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { Image } from "../Widgets/LoadersWidgets";
import Icon from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";

interface VideoItem {
  url: string;
  title?: string | null;
  description?: string | null;
  video_type?: string;
}

interface YouTubeVideosProps {
  videos: VideoItem[];
  style?: ViewStyle;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function getThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

export default function YouTubeVideos({
  videos,
  style,
}: YouTubeVideosProps) {
  const { width: windowWidth } = useWindowDimensions();
  const colors = useThemeColors();

  const videoWidth = windowWidth * 0.65;
  const videoHeight = videoWidth * (9 / 16);

  const handlePress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: VideoItem }) => {
      const videoId = extractVideoId(item.url);
      if (!videoId) return null;

      const thumbnailUrl = getThumbnailUrl(videoId);

      return (
        <TouchableOpacity
          style={[
            styles.videoContainer,
            {
              width: videoWidth,
              height: videoHeight,
              backgroundColor: colors.background,
            },
          ]}
          onPress={() => handlePress(item.url)}
          activeOpacity={0.8}
        >
          <Image uri={thumbnailUrl} style={styles.thumbnail} />
          <View
            style={[
              styles.playButtonContainer,
              { backgroundColor: colors.Background(0.5) },
            ]}
          >
            <Icon.PlayCircle size={44} color={colors.primary} weight="fill" />
          </View>
        </TouchableOpacity>
      );
    },
    [videoWidth, videoHeight, handlePress, colors.background]
  );

  const keyExtractor = useCallback(
    (item: VideoItem, index: number) =>
      `youtube-${extractVideoId(item.url) || index}`,
    []
  );

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[style]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  separator: {
    width: 12,
  },
});
