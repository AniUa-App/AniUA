import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  FlatList as RNFlatList,
} from "react-native";
import { TouchableOpacity } from "./Button";
import {
  ScrollView,
  FlatList as GHFlatList,
} from "react-native-gesture-handler";
import { isTV as checkIsTV, isTV } from "../Styles/Responsive";

const FlatList = checkIsTV() ? RNFlatList : GHFlatList;

import Icon from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import { Image } from "./LoadersWidgets";
import { isTablet, isTabletLandscape } from "../Styles/Responsive";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
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

  // Ширина картки
  const cardWidth = useMemo(() => {
    return isTabletLandscape()
      ? width * 0.12
      : isTablet()
        ? width * 0.2
        : isTV()
          ? width * 0.12
          : width * 0.35;
  }, [width]);

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
        width={cardWidth}
        showDetails={showAnimeDetails}
        navigation={navigation}
      />
    ),
    [cardWidth, showAnimeDetails, navigation],
  );

  const keyExtractor = useCallback((item, index) => {
    return item.slug ? `${item.slug}-${index}` : String(index);
  }, []);

  const content = (
    <>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={1}
        onPress={onClickMore}
      >
        {title?.length > 0 && (
          <Text
            style={[
              styles.title,
              H3,
              { color: themeColors.text, padding: 0, margin: 0 },
            ]}
          >
            {title || ""}
          </Text>
        )}
        {!!onClickMore && (
          <View
            style={[
              styles.arrowRightIcon,
              {
                borderRadius: 16,
                backgroundColor: themeColors.accent,
              },
            ]}
          >
            <Icon.ArrowRight size={24} color={themeColors.primary} />
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
        contentContainerStyle={[
          styles.listContent,
          checkIsTV() && { paddingVertical: 8 },
        ]}
        style={checkIsTV() ? { overflow: "visible" } : undefined}
        CellRendererComponent={checkIsTV() ? TVCellRenderer : undefined}
      />
    </>
  );

  return <View>{content}</View>;
}

export function PreviewAnimeListHorizontal({
  animeList,
  title,
  onPress = () => {},
}) {
  const themeColors = useThemeColors();
  const { width, height } = useWindowDimensions();

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <View style={styles.header} activeOpacity={1}>
        {title?.length > 0 && (
          <Text
            selectable={true}
            style={[styles.title, H3, { color: themeColors.text }]}
          >
            {title || ""}
          </Text>
        )}
        <View
          style={[
            styles.arrowRightIcon,
            {
              borderRadius: 16,
              backgroundColor: themeColors.accent,
            },
          ]}
        >
          <Icon.ArrowRight size={28} color={themeColors.primary} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {animeList.map((anime, index) => {
          // Ширина завжди однакова
          const cardWidth = isTabletLandscape()
            ? width * 0.12
            : isTablet()
              ? width * 0.2
              : width * 0.35;

          return (
            <AnimeCard
              key={`${anime.slug || index}-${index}`}
              anime={anime}
              width={cardWidth}
              onPress={() => onPress(anime)}
            />
          );
        })}
      </ScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 8,
  },
  arrowRightIcon: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "transparent",
    width: "100%",
    marginTop: 10,
  },
  listContent: {},
});
