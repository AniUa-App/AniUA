import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Icons from "../../Styles/Icons";
import { SCREEN_WIDTH } from "./constants";
import AnimeCard from "../AnimeCard";
import { H6 } from "../../Styles/Fonts";

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
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    const EmptyIcon = Icons[emptyIcon];
    return (
      <View style={styles.emptyState}>
        <EmptyIcon size={48} color={colors.Text(0.3)} weight="regular" />
        <Text
          selectable={true}
          style={[H6, styles.emptyStateText, { color: colors.Text(0.5) }]}
        >
          {emptyText}
        </Text>
      </View>
    );
  }

  const itemWidth = `${Math.floor(100 / numColumns)}%`;

  return (
    <View style={styles.animeGridContainer}>
      {data.map((item, index) => {
        const anime = getAnimeFromItem ? getAnimeFromItem(item) : item;
        return (
          <View
            key={anime?.slug || index}
            style={[styles.animeGridItem, { width: itemWidth }]}
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

const styles = StyleSheet.create({
  emptyState: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
    minHeight: "50%",
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 8,
  },
  animeGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    minHeight: "50%",
  },
  animeGridItem: {
    justifyContent: "center",
    alignItems: "center",
  },
});
