import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Icons from "../../Styles/Icons";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "./constants";
import AnimeCard from "../AnimeCard";

export default function AnimeGrid({
  data,
  isLoading,
  emptyIcon,
  emptyText,
  colors,
  scaleFontSize,
  navigation,
  getAnimeFromItem,
  showAnimeDetails,
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
          style={[
            styles.emptyStateText,
            { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
          ]}
        >
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.animeGridContainer}>
      {data.map((item, index) => {
        const anime = getAnimeFromItem ? getAnimeFromItem(item) : item;
        return (
          <View key={anime?.slug || index} style={styles.animeGridItem}>
            <AnimeCard
              anime={anime}
              width={SCREEN_WIDTH * 0.34}
              showDetails={showAnimeDetails}
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
  },
  emptyStateText: {
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    marginTop: 8,
  },
  animeGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  animeGridItem: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});
