import {
  View,
  Text,
  FlatList as RNFlatList,
} from "react-native";
import { TouchableOpacity } from "./Button";
import {
  ScrollView,
  FlatList as GHFlatList,
} from "react-native-gesture-handler";
import { isTV as checkIsTV } from "../Styles/Responsive";
import { useAnimeListHStyles } from "../Styles/components/AnimeListHStyles";

const FlatList = checkIsTV() ? RNFlatList : GHFlatList;

import Icon from "../Styles/Icons";
import { useEffect, useState, useCallback, useRef } from "react";
import { AniuaApi } from "../Api/AniuaApi";
import { useFocusEffect } from "@react-navigation/native";
import SettingsStorage from "../Storage/SettingsStorage";
import AnimeCard from "../Components/AnimeCard";

const TVCellRenderer = ({ children, style, ...props }) => (
  <View style={[style, { overflow: "visible" }]} collapsable={false} {...props}>
    {children}
  </View>
);

export function AnimeListHorizontal({
  animeList,
  title = "",
  onClickMore = null,
  navigation,
}) {
  const s = useAnimeListHStyles();
  // Налаштування показу деталей
  const [showAnimeDetails, setShowAnimeDetails] = useState(
    SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
  );

  // Зберігаємо slug'и для яких вже зробили prefetch
  const prefetchedSlugs = useRef(new Set());
  // Перечитуємо налаштування при фокусі на екран

  try {
    useFocusEffect(
      useCallback(() => {
        setShowAnimeDetails(
          SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
        );
      }, []),
    );
  } catch {
    useEffect(() => {
      setShowAnimeDetails(
        SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
      );
    }, []);
  }


  // Конфігурація для визначення видимих елементів
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 20,
    minimumViewTime: 100,
  }).current;

  // Callback коли змінюються видимі елементи
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    const newSlugs = viewableItems
      .map((item) => item.item?.slug)
      .filter((slug) => slug && !prefetchedSlugs.current.has(slug));

    if (newSlugs.length > 0) {
      newSlugs.forEach((slug) => prefetchedSlugs.current.add(slug));
      AniuaApi.prefetchMultipleEpisodes(newSlugs, 3);
    }
  }, []);

  const renderItem = useCallback(
    ({ item: anime, index }) => (
      <AnimeCard
        anime={anime}
        key={`${anime.slug}-${index}` || index}
        width={s.cardWidth}
        showDetails={showAnimeDetails}
        navigation={navigation}
      />
    ),
    [s, showAnimeDetails, navigation],
  );

  const keyExtractor = useCallback((item, index) => {
    return item.slug ? `${item.slug}-${index}` : String(index);
  }, []);

  const content = (
    <>
      <TouchableOpacity
        style={s.header}
        activeOpacity={1}
        onPress={onClickMore}
        tvFocusable={!!onClickMore}
      >
        {title?.length > 0 && (
          <Text style={s.title}>{title || ""}</Text>
        )}
        {!!onClickMore && (
          <View style={s.arrowIcon}>
            <Icon.ArrowRight size={s.iconSize} color={s.arrowIconColor} />
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        horizontal
        data={animeList ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        nestedScrollEnabled={true}
        focusable={false}
        contentContainerStyle={[
          s.listContent,
          checkIsTV() && { paddingVertical: 8 },
        ]}
        style={checkIsTV() ? { overflow: "visible" } : undefined}
        CellRendererComponent={checkIsTV() ? TVCellRenderer : undefined}
      />
    </>
  );

  return <View focusable={false}>{content}</View>;
}

export function PreviewAnimeListHorizontal({
  animeList,
  title,
  onPress = () => {},
}) {
  const s = useAnimeListHStyles();

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <View style={s.header} activeOpacity={1}>
        {title?.length > 0 && (
          <Text selectable={true} style={s.title}>{title || ""}</Text>
        )}
        <View style={s.arrowIcon}>
          <Icon.ArrowRight size={s.iconSize} color={s.arrowIconColor} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {animeList.map((anime, index) => (
          <AnimeCard
            key={`${anime.slug || index}-${index}`}
            anime={anime}
            width={s.cardWidth}
            onPress={() => onPress(anime)}
          />
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

