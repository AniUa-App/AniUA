import {
  View,
  Text,
  FlatList,
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
import { styles, getGridItemWidth } from "../../Styles/components/Screens/AnimeListStyles";

const MAX_CONCURRENT_REQUESTS = 10;

// Tablet version of AnimeList screen (grid layout)
export default function AnimeListTablet({
  route,
  isNavBarPadding,
  hasManualHeader,
}) {
  const { type, initialData, title } = route.params;
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const numColumns = 2;

  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState({});
  const [isCheckingInternet, setIsCheckingInternet] = useState(null);

  // Calculate card width based on grid columns
  const cardWidth = useMemo(() => {
    return getGridItemWidth(width, 2, 16);
  }, [width, numColumns]);

  const getInfos = useCallback(() => {
    try {
      const storedInfos = AnimeStorage.getAll();
      setInfo(storedInfos || {});
      Logger.debug("AnimeListTablet", "Інформація завантажена");
    } catch (error) {
      Logger.error(
        "AnimeListTablet",
        "Помилка при завантаженні інформації",
        error,
      );
      setInfo({});
    }
  }, []);

  const updateInfos = useCallback((slug, newInfoData) => {
    setInfo((prevInfo) => {
      const updatedInfo = {
        ...prevInfo,
        [slug]: { ...(prevInfo[slug] || {}), ...newInfoData },
      };
      Logger.debug("AnimeListTablet", "Оновлення інформації", {
        slug,
        newInfoData,
      });
      AnimeStorage.set(slug, newInfoData);
      return updatedInfo;
    });
  }, []);

  const fetchAnimeDetails = useCallback(async (animeSlug) => {
    try {
      return await HikkaApiComplete.getAnimeDetails(animeSlug);
    } catch (error) {
      Logger.error("AnimeListTablet", "Помилка при отриманні деталей аніме", {
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
          Logger.debug(
            "AnimeListTablet",
            "Користувач не авторизований для улюбленого",
          );
          setIsLoading(false);
          return;
        }
        try {
          const user = HikkaAuthService.getCurrentUser();
          if (user?.username) {
            const favoritesResponse = await HikkaApiComplete.getUserFavorites(
              "anime",
              user.username,
              { page: 1, size: 100 },
            );
            dataToFetch = (favoritesResponse?.list || []).map(
              (item) => item.anime || item,
            );
            Logger.debug("AnimeListTablet", "Завантаження улюбленого з Hikka", {
              count: dataToFetch.length,
            });
          } else {
            dataToFetch = [];
          }
        } catch (error) {
          Logger.error(
            "AnimeListTablet",
            "Помилка завантаження улюбленого з Hikka",
            error,
          );
          dataToFetch = [];
        }
        setIsCheckingInternet(true);
        break;
      case "Downloaded":
        dataToFetch = Object.keys(currentInfo).filter(
          (slug) => (currentInfo[slug]?.downloaded_episodes?.length || 0) > 0,
        );
        Logger.debug("AnimeListTablet", "Завантаження завантаженого", {
          slugs: dataToFetch,
        });
        setIsCheckingInternet(false);
        break;
      default:
        dataToFetch = initialData;
        Logger.debug("AnimeListTablet", "Завантаження початкових даних");
        setIsCheckingInternet(true);
    }

    if (!Array.isArray(dataToFetch) || dataToFetch.length === 0) {
      Logger.debug("AnimeListTablet", "Немає даних для завантаження");
      setIsLoading(false);
      return;
    }

    const tasks = dataToFetch.map((item) => {
      if (typeof item === "object" && item?.slug) {
        return async () => await fetchAnimeDetails(item.slug);
      } else if (typeof item === "string") {
        return async () => await fetchAnimeDetails(item);
      }
      Logger.warn("AnimeListTablet", "Невалідний елемент в dataToFetch", {
        item,
      });
      return async () => null;
    });

    await fetchWithConcurrencyLimit(tasks);

    setIsLoading(false);
    Logger.debug("AnimeListTablet", "Завантаження аніме завершено");
  }, [type, initialData, fetchAnimeDetails, fetchWithConcurrencyLimit]);

  useFocusEffect(
    useCallback(() => {
      const loadDataSequentially = async () => {
        await getInfos();
        await fetchMoreAnime();
      };

      loadDataSequentially();
    }, [getInfos, fetchMoreAnime]),
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!item?.slug) {
        Logger.warn(
          "AnimeListTablet",
          "RenderItem отримав невалідний елемент",
          {
            item,
          },
        );
        return null;
      }

      const currentItemInfo = info?.[item.slug] || {};

      return (
        <View style={{ maxWidth: cardWidth, width: "100%" }}>
          <AnimePreviewWidget
            anime={item}
            key={`${item.slug}-${index}`}
            info={currentItemInfo}
            updateInfo={updateInfos}
            type={type}
            gridMode={false}
            maxWidth={cardWidth}
          />
        </View>
      );
    },
    [info, updateInfos, type, cardWidth],
  );

  const keyExtractor = useCallback(
    (item, index) => `${item.slug}-${index}`,
    [],
  );

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Text selectable={true} style={[styles.emptyMessage, H2]}>
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
        data={animeList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`grid-${numColumns}`} // Force re-render when columns change
        showsVerticalScrollIndicator={false}
        initialNumToRender={numColumns * 3}
        maxToRenderPerBatch={numColumns * 4}
        windowSize={10}
        removeClippedSubviews={true}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={[
          styles.listContentContainer,
          styles.gridContainer,
        ]}
        columnWrapperStyle={styles.gridColumnWrapper}
      />
    </DefaultScreenWidget>
  );
}
