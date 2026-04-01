import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useState, useCallback } from "react";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import MangaPreviewWidget from "../../Widgets/MangaPreviewWidget";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import { useFocusEffect } from "@react-navigation/native";
import { H2 } from "../../Styles/Fonts";
import Logger from "../../Logger/Logger";
import { styles } from "../../Styles/components/Screens/AnimeListStyles";

const MAX_CONCURRENT_REQUESTS = 10;

export default function MangaListPhone({
  route,
  isNavBarPadding,
  hasManualHeader,
}) {
  const { type, initialData, title } = route.params;
  const { height } = useWindowDimensions();
  const themeColors = useThemeColors();

  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingInternet, setIsCheckingInternet] = useState(null);

  const fetchMangaDetails = useCallback(async (mangaSlug) => {
    try {
      return await HikkaApiComplete.getMangaDetails(mangaSlug);
    } catch (error) {
      Logger.error("MangaListPhone", "Помилка при отриманні деталей манґи", {
        mangaSlug,
        error,
      });
      return null;
    }
  }, []);

  const fetchWithConcurrencyLimit = useCallback(async (tasks) => {
    const results = [];

    for (let i = 0; i < tasks.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = tasks.slice(i, i + MAX_CONCURRENT_REQUESTS);
      const batchResults = await Promise.all(batch.map((task) => task()));

      const validResults = batchResults.filter(Boolean);
      if (validResults.length > 0) {
        setMangaList((prev) => [...prev, ...validResults]);
      }

      results.push(...batchResults);
    }

    return results;
  }, []);

  const fetchMoreManga = useCallback(async () => {
    setIsLoading(true);
    setMangaList([]);

    let dataToFetch;

    switch (type) {
      case "Liked":
        if (!HikkaAuthService.isAuthenticated()) {
          Logger.debug("MangaListPhone", "Користувач не авторизований");
          setIsLoading(false);
          return;
        }
        try {
          const user = HikkaAuthService.getCurrentUser();
          if (user?.username) {
            const favoritesResponse = await HikkaApiComplete.getUserFavorites(
              "manga",
              user.username,
              { page: 1, size: 100 },
            );
            dataToFetch = (favoritesResponse?.list || []).map(
              (item) => item.manga || item,
            );
            Logger.debug("MangaListPhone", "Завантаження улюбленого з Hikka", {
              count: dataToFetch.length,
            });
          } else {
            dataToFetch = [];
          }
        } catch (error) {
          Logger.error("MangaListPhone", "Помилка завантаження улюбленого", error);
          dataToFetch = [];
        }
        setIsCheckingInternet(true);
        break;
      default:
        dataToFetch = initialData;
        Logger.debug("MangaListPhone", "Завантаження початкових даних", {
          data: dataToFetch,
        });
        setIsCheckingInternet(true);
    }

    if (!Array.isArray(dataToFetch) || dataToFetch.length === 0) {
      setIsLoading(false);
      return;
    }

    const tasks = dataToFetch.map((item) => {
      if (typeof item === "object" && item?.slug) {
        return async () => {
          if (item.genres) return item;
          return await fetchMangaDetails(item.slug);
        };
      } else if (typeof item === "string") {
        return async () => await fetchMangaDetails(item);
      }
      return async () => null;
    });

    await fetchWithConcurrencyLimit(tasks);
    setIsLoading(false);
  }, [type, initialData, fetchMangaDetails, fetchWithConcurrencyLimit]);

  useFocusEffect(
    useCallback(() => {
      fetchMoreManga();
    }, [fetchMoreManga]),
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!item?.slug) return null;
      return (
        <MangaPreviewWidget
          manga={item}
          key={`${item.slug}-${index}`}
          type={type}
        />
      );
    },
    [type],
  );

  const keyExtractor = (item, index) => `${item.slug}-${index}`;

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Text selectable={true} style={[styles.emptyMessage, H2]}>
            {type === "Liked"
              ? HikkaAuthService.isAuthenticated()
                ? "Список улюбленого порожній"
                : "Увійдіть в акаунт Hikka для перегляду улюбленого"
              : "Список порожній"}
          </Text>
        </View>
      ) : null,
    [isLoading, type, height],
  );

  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : null,
    [isLoading, themeColors.primary],
  );

  return (
    <DefaultScreenWidget
      isCheckInternet={isCheckingInternet}
      isNavBarPadding={isNavBarPadding}
      hasManualHeader={hasManualHeader}
    >
      <FlatList
        data={mangaList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.listContentContainer}
      />
    </DefaultScreenWidget>
  );
}
