import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import AnimePreviewWidget from "../../Widgets/AnimePreviewWidget";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import { useFocusEffect } from "@react-navigation/native";
import AnimeStorage from "../../Storage/AnimeStorage";
import { H2 } from "../../Styles/Fonts";
import Logger from "../../Logger/Logger";
import { useGridColumns } from "../../Styles/Responsive";
import { styles, getGridItemWidth } from "./styles";
import { TVFocusableGrid, TVCard } from "../../Components/TV";

const MAX_CONCURRENT_REQUESTS = 10;

export default function AnimeListTV({
  route,
  isNavBarPadding,
  hasManualHeader,
}) {
  const { type, initialData, title } = route.params;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const numColumns = useGridColumns(200);

  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState({});
  const [isCheckingInternet, setIsCheckingInternet] = useState(null);

  const cardWidth = useMemo(() => {
    return getGridItemWidth(width, numColumns, 32);
  }, [width, numColumns]);

  const getInfos = useCallback(() => {
    try {
      const storedInfos = AnimeStorage.getAll();
      setInfo(storedInfos || {});
    } catch (error) {
      Logger.error("AnimeListTV", "Помилка при завантаженні інформації", error);
      setInfo({});
    }
  }, []);

  const updateInfos = useCallback((slug, newInfoData) => {
    setInfo((prevInfo) => {
      const updatedInfo = {
        ...prevInfo,
        [slug]: { ...(prevInfo[slug] || {}), ...newInfoData },
      };
      AnimeStorage.set(slug, newInfoData);
      return updatedInfo;
    });
  }, []);

  const fetchAnimeDetails = useCallback(async (animeSlug) => {
    try {
      return await HikkaApiComplete.getAnimeDetails(animeSlug);
    } catch (error) {
      Logger.error("AnimeListTV", "Помилка при отриманні деталей аніме", {
        animeSlug,
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
        setAnimeList((prev) => [...prev, ...validResults]);
      }

      results.push(...batchResults);
    }

    return results;
  }, []);

  const fetchMoreAnime = useCallback(async () => {
    setIsLoading(true);
    setAnimeList([]);

    const currentInfo = AnimeStorage.getAll();
    let dataToFetch;

    switch (type) {
      case "Liked":
        if (!HikkaAuthService.isAuthenticated()) {
          setIsLoading(false);
          return;
        }
        try {
          const user = HikkaAuthService.getCurrentUser();
          if (user?.username) {
            const favoritesResponse = await HikkaApiComplete.getUserFavorites(
              "anime",
              user.username,
              { page: 1, size: 100 }
            );
            dataToFetch = (favoritesResponse?.list || []).map(
              (item) => item.anime || item
            );
          } else {
            dataToFetch = [];
          }
        } catch (error) {
          Logger.error("AnimeListTV", "Помилка завантаження улюбленого", error);
          dataToFetch = [];
        }
        setIsCheckingInternet(true);
        break;
      case "Downloaded":
        dataToFetch = Object.keys(currentInfo).filter(
          (slug) => (currentInfo[slug]?.downloaded_episodes?.length || 0) > 0
        );
        setIsCheckingInternet(false);
        break;
      default:
        dataToFetch = initialData;
        setIsCheckingInternet(true);
    }

    if (!Array.isArray(dataToFetch) || dataToFetch.length === 0) {
      setIsLoading(false);
      return;
    }

    const tasks = dataToFetch.map((item) => {
      if (typeof item === "object" && item?.slug) {
        return async () => await fetchAnimeDetails(item.slug);
      } else if (typeof item === "string") {
        return async () => await fetchAnimeDetails(item);
      }
      return async () => null;
    });

    await fetchWithConcurrencyLimit(tasks);
    setIsLoading(false);
  }, [type, initialData, fetchAnimeDetails, fetchWithConcurrencyLimit]);

  useFocusEffect(
    useCallback(() => {
      const loadDataSequentially = async () => {
        await getInfos();
        await fetchMoreAnime();
      };
      loadDataSequentially();
    }, [getInfos, fetchMoreAnime])
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!item?.slug) return null;

      const currentItemInfo = info?.[item.slug] || {};

      return (
        <AnimePreviewWidget
          anime={item}
          key={`${item.slug}-${index}`}
          info={currentItemInfo}
          updateInfo={updateInfos}
          type={type}
          gridMode={true}
          cardWidth={cardWidth}
        />
      );
    },
    [info, updateInfos, type, cardWidth]
  );

  const keyExtractor = useCallback(
    (item, index) => `${item.slug}-${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Text
            selectable={true}
            style={[styles.emptyMessage, H2, { fontSize: 24 }]}
          >
            {type === "Liked"
              ? HikkaAuthService.isAuthenticated()
                ? "Список улюбленого порожній"
                : "Увійдіть в акаунт Hikka для перегляду улюбленого"
              : type === "Downloaded"
                ? "Список завантаженого порожній"
                : "Список порожній"}
          </Text>
        </View>
      ) : null,
    [isLoading, type, height]
  );

  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : null,
    [isLoading, themeColors.primary]
  );

  return (
    <DefaultScreenWidget
      isCheckInternet={isCheckingInternet}
      isNavBarPadding={isNavBarPadding}
      hasManualHeader={hasManualHeader}
    >
      <TVFocusableGrid
        data={animeList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`grid-${numColumns}`}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={[
          styles.listContentContainer,
          styles.gridContainer,
          { paddingHorizontal: 32 },
        ]}
        columnWrapperStyle={styles.gridColumnWrapper}
      />
    </DefaultScreenWidget>
  );
}
