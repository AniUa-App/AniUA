import { useCallback } from "react";
import {
  View,
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
import { useMusicOSTStyles } from "../Styles/components/MusicOSTStyles";

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
  const s = useMusicOSTStyles();

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
            s.cardContainer,
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
            style={s.gradient}
          />

          {/* Badge */}
          <View style={[s.badge, { backgroundColor: colors.primary }]}>
            <Text
              selectable={true}
              selectable={true}
              style={[H6, { color: "#FFFFFF" }]}
            >
              {getOSTLabel(item.ost_type, item.index)}
            </Text>
          </View>

          {/* Center icon */}
          <View style={s.iconContainer}>
            <Icon.SpotifyLogo size={48} color="#FFFFFF" weight="fill" />
          </View>

          {/* Bottom info */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={s.bottomGradient}
          >
            <Text
              selectable={true}
              style={[H5, s.title]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              selectable={true}
              style={[H6, s.author]}
              numberOfLines={1}
            >
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
      ItemSeparatorComponent={() => <View style={s.separator} />}
    />
  );
}

