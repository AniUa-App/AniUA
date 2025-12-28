import { useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Linking,
  Text,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Icon from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H5, H6 } from "../Styles/Fonts";
import LinearGradient from "react-native-linear-gradient";

interface OSTItem {
  index: number;
  title: string;
  author: string;
  spotify: string;
  ost_type: "opening" | "ending" | string;
}

interface MusicOSTProps {
  ost: OSTItem[];
  style?: ViewStyle;
}

function getOSTLabel(type: string, index: number): string {
  if (type === "opening") return `OP ${index}`;
  if (type === "ending") return `ED ${index}`;
  return type.toUpperCase();
}

export default function MusicOST({ ost, style }: MusicOSTProps) {
  const { width: windowWidth } = useWindowDimensions();
  const colors = useThemeColors();

  const cardWidth = windowWidth * 0.65;
  const cardHeight = cardWidth * (9 / 16);

  const handlePress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: OSTItem }) => {
      return (
        <TouchableOpacity
          style={[
            styles.cardContainer,
            {
              width: cardWidth,
              height: cardHeight,
            },
          ]}
          onPress={() => handlePress(item.spotify)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#1DB954", "#191414"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[H6, { color: "#FFFFFF" }]}>
              {getOSTLabel(item.ost_type, item.index)}
            </Text>
          </View>

          {/* Center icon */}
          <View style={styles.iconContainer}>
            <Icon.SpotifyLogo size={48} color="#FFFFFF" weight="fill" />
          </View>

          {/* Bottom info */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.bottomGradient}
          >
            <Text style={[H5, styles.title]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[H6, styles.author]} numberOfLines={1}>
              {item.author}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [cardWidth, cardHeight, colors.primary, handlePress]
  );

  const keyExtractor = useCallback(
    (item: OSTItem, index: number) =>
      `ost-${item.ost_type}-${item.index}-${index}`,
    []
  );

  if (!ost || ost.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={ost}
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
  cardContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  iconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: 24,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  author: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  separator: {
    width: 12,
  },
});
