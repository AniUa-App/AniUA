import { View, Text, StyleSheet } from "react-native";
import { memo, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useThemeColors } from "../Global/useTheme";
import { H6, H7 } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../Widgets/Button";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import { HikkaApi } from "../Sources/hikka";

/**
 * Компонент картки аніме з підвантаженням деталей
 * @param {Object} anime - Об'єкт аніме
 * @param {number} width - Ширина картки
 * @param {boolean} showDetails - Показувати деталі (назва, жанри, епізоди)
 * @param {function} onPress - Callback при натисканні (опціонально)
 */
const AnimeCard = memo(function AnimeCard({
  anime,
  width,
  showDetails = true,
  onPress,
}) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [details, setDetails] = useState(null);

  // Підвантажуємо деталі якщо немає жанрів
  useEffect(() => {
    if (showDetails && !anime.genres && anime.slug) {
      HikkaApi.getAnimeDetails(anime.slug).then((data) => {
        if (data) setDetails(data);
      });
    }
  }, [anime.slug, anime.genres, showDetails]);

  const animeData = details || anime;

  // Отримуємо жанри
  const genres = animeData.genres?.[0]
    ? (animeData.genres[0].name_ua || animeData.genres[0].name_en) + ","
    : null;

  // Кількість епізодів або статус
  const getStatusText = (status) => {
    switch (status) {
      case "ongoing":
        return "Онґоінг";
      case "finished":
        return "Завершено";
      case "announced":
        return "Анонс";
      default:
        return null;
    }
  };

  const episodes = animeData.episodes_total
    ? `${animeData.episodes_released || 0}/${animeData.episodes_total} еп.`
    : animeData.episodes_released
      ? `${animeData.episodes_released}`
      : getStatusText(animeData.status);

  const handlePress = () => {
    if (onPress) {
      onPress(anime);
    } else {
      prefetchBloomImage(anime.image);
      navigation.navigate("HiddenStack", {
        screen: "AnimePreview",
        params: { anime },
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.container, { width }]}
      onPress={handlePress}
    >
      <Image
        uri={anime.image}
        style={{
          width: "100%",
          aspectRatio: showDetails ? 0.75 : 0.7,
          borderRadius: 18,
        }}
      />
      {showDetails && (
        <View style={styles.details}>
          <Text
            style={[H7, styles.title, { color: themeColors.text }]}
            numberOfLines={2}
          >
            {anime.title_ua || anime.title_en || anime.title_ja}
          </Text>
          <View style={styles.infoRow}>
            {genres && (
              <Text
                style={[H6, styles.genres, { color: themeColors.Text(0.5) }]}
                numberOfLines={1}
              >
                {genres}
              </Text>
            )}
            {episodes && (
              <Text
                style={[H6, styles.episodes, { color: themeColors.Text(0.5) }]}
              >
                {genres?.length > 15
                  ? null
                  : genres?.length > 9
                    ? episodes.slice(0, 5)
                    : episodes}
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  details: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  title: {
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: "row",
    gap: 3,
  },
  genres: {
    marginTop: 2,
  },
  episodes: {
    marginTop: 2,
  },
});

export default AnimeCard;
