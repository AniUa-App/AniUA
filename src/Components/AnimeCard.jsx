import { View, Text, StyleSheet, Pressable } from "react-native";
import { memo, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import { H6, H7 } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { useIsTV } from "../Styles/Responsive";

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
  navigation: propNavigation,
}) {
  const navigation = propNavigation || useNavigation();
  const themeColors = useThemeColors();
  const [details, setDetails] = useState(null);
  const isTV = useIsTV();
  const [isFocused, setIsFocused] = useState(null);

  // Підвантажуємо деталі якщо немає жанрів
  useEffect(() => {
    if (showDetails && !anime.genres && anime.slug) {
      HikkaApiComplete.getAnimeDetails(anime.slug).then((data) => {
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
        params: { slug: anime.slug, _fromTap: true },
      });
    }
  };

  return (
    <Pressable
      style={({ focused, pressed }) => [
        styles.container,
        { width },
        isTV &&
          focused && {
            ...styles.tvFocused,
            borderColor: themeColors.primary,
            backgroundColor: themeColors.accent,
            width: width + 4,
          },
        !isTV && {
          padding: 8,
        },
      ]}
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Image
        uri={anime.image}
        style={[
          {
            width: "100%",
            aspectRatio: showDetails ? 0.75 : 0.7,
            borderRadius: 21,
            marginTop: 1,
          },
        ]}
      />
      {showDetails && (
        <View style={styles.details}>
          <Text
            selectable={false}
            style={[H7, styles.title, { color: themeColors.text }]}
            numberOfLines={2}
          >
            {anime.title_ua || anime.title_en || anime.title_ja}
          </Text>
          <View style={styles.infoRow}>
            {genres && (
              <Text
                selectable={false}
                style={[H6, styles.genres, { color: themeColors.primary }]}
                numberOfLines={1}
              >
                {genres}
              </Text>
            )}
            {episodes && (
              <Text
                selectable={false}
                style={[H6, styles.episodes, { color: themeColors.primary }]}
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
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 4,
    paddingBottom: 6,
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
  tvFocused: {
    borderWidth: 1,
    zIndex: 100,
    transform: [{ scale: 1.09 }],
  },
});

export default AnimeCard;
