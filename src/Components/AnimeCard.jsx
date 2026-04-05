import { View, Text, Pressable } from "react-native";
import { memo, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Image } from "../Widgets/LoadersWidgets";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { useIsTV } from "../Styles/Responsive";
import { useAnimeCardStyles } from "../Styles/components/AnimeCardStyles";
import { Icon } from "../Styles/Colors";
import Icons from "../Styles/Icons";

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
  const s = useAnimeCardStyles();
  const [details, setDetails] = useState(null);
  const isTV = useIsTV();

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
      style={({ focused }) => [
        s.container,
        { width },
        isTV &&
          focused && {
            ...s.tvFocused,
          },
        !isTV && s.containerPhone,
      ]}
      onPress={handlePress}
    >
      <View>
        <Image
          uri={anime.image}
          style={showDetails ? s.image : s.imageCompact}
        />
        <View style={s.iconContainer}>
          <Icons.MonitorPlay style={s.icon} size={s.icon.fontSize} />
        </View>
      </View>

      {showDetails && (
        <View style={s.details}>
          <Text selectable={false} style={s.title} numberOfLines={2}>
            {anime.title_ua || anime.title_en || anime.title_original}
          </Text>
          <View style={s.infoRow}>
            {genres && (
              <Text selectable={false} style={s.genre} numberOfLines={1}>
                {genres}
              </Text>
            )}
            {episodes && (
              <Text selectable={false} style={s.episodes}>
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

export default AnimeCard;
