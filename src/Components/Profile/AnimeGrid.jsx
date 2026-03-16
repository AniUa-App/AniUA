import { View, Text, ActivityIndicator } from "react-native";
import Icons from "../../Styles/Icons";
import { SCREEN_WIDTH } from "./constants";
import AnimeCard from "../AnimeCard";
import { H6 } from "../../Styles/Fonts";
import { useAnimeGridStyles } from "../../Styles/components/Profile/AnimeGridStyles";

export default function AnimeGrid({
  data,
  isLoading,
  emptyIcon,
  emptyText,
  colors,
  navigation,
  getAnimeFromItem,
  showAnimeDetails,
  numColumns = 3,
  cardWidth = SCREEN_WIDTH * 0.34,
}) {
  const s = useAnimeGridStyles();

  if (isLoading) {
    return (
      <View style={s.emptyState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    const EmptyIcon = Icons[emptyIcon];
    return (
      <View style={s.emptyState}>
        <EmptyIcon size={48} color={colors.Text(0.3)} weight="regular" />
        <Text
          selectable={true}
          style={[H6, s.emptyStateText, { color: colors.Text(0.5) }]}
        >
          {emptyText}
        </Text>
      </View>
    );
  }

  const itemWidth = `${Math.floor(100 / numColumns)}%`;

  return (
    <View style={s.animeGridContainer}>
      {data.map((item, index) => {
        const anime = getAnimeFromItem ? getAnimeFromItem(item) : item;
        return (
          <View
            key={anime?.slug || index}
            style={[s.animeGridItem, { width: itemWidth }]}
          >
            <AnimeCard
              anime={anime}
              width={cardWidth}
              showDetails={showAnimeDetails}
              navigation={navigation}
            />
          </View>
        );
      })}
    </View>
  );
}

