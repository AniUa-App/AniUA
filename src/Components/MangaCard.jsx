import { View, Text, Pressable } from "react-native";
import { memo, useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Image } from "../Widgets/LoadersWidgets";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import { useIsTV } from "../Styles/Responsive";
import { useAnimeCardStyles } from "../Styles/components/AnimeCardStyles";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";

/**
 * Компонент картки манґи для горизонтальних списків
 * @param {Object} manga - Об'єкт манґи
 * @param {number} width - Ширина картки
 * @param {boolean} showDetails - Показувати деталі
 * @param {function} onPress - Callback при натисканні (опціонально)
 */
const MangaCard = memo(function MangaCard({
  manga,
  width,
  showDetails = true,
  onPress,
  navigation: propNavigation,
}) {
  const navigation = propNavigation || useNavigation();
  const s = useAnimeCardStyles();
  const isTV = useIsTV();
  const [details, setDetails] = useState(null);

  // Підвантажуємо деталі якщо немає жанрів
  useEffect(() => {
    if (showDetails && !manga.genres && manga.slug) {
      HikkaApiComplete.getMangaDetails(manga.slug).then((data) => {
        if (data) setDetails(data);
      });
    }
  }, [manga.slug, manga.genres, showDetails]);

  const mangaData = details || manga;

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

  const genres = mangaData.genres?.[0]
    ? (mangaData.genres[0].name_ua || mangaData.genres[0].name_en) + ","
    : null;

  const chaptersText = mangaData.chapters
    ? `${mangaData.chapters} розд.`
    : getStatusText(mangaData.status);

  const handlePress = () => {
    if (onPress) {
      onPress(manga);
    } else {
      prefetchBloomImage(manga.image);
      navigation.navigate("HiddenStack", {
        screen: "MangaPreview",
        params: { slug: manga.slug, _fromTap: true },
      });
    }
  };

  return (
    <Pressable
      style={({ focused }) => [
        s.container,
        { width },
        isTV && focused && { ...s.tvFocused },
        !isTV && s.containerPhone,
      ]}
      onPress={handlePress}
    >
      <Image uri={manga.image} style={showDetails ? s.image : s.imageCompact} />
      {showDetails && (
        <View style={s.details}>
          <Text selectable={false} style={s.title} numberOfLines={2}>
            {mangaData.title_ua || mangaData.title_en || mangaData.title_original}
          </Text>
          <View style={s.infoRow}>
            {genres && (
              <Text selectable={false} style={s.genre} numberOfLines={1}>
                {genres}
              </Text>
            )}
            {chaptersText && (
              <Text selectable={false} style={s.episodes}>
                {genres?.length > 15
                  ? null
                  : genres?.length > 9
                    ? chaptersText.slice(0, 5)
                    : chaptersText}
              </Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
});

export default MangaCard;
