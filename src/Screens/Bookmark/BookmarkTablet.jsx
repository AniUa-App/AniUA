import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useState, useCallback, useEffect, useMemo } from "react";
import AnimeStatusFAB from "../../Widgets/AnimeStatusFAB";
import AnimePreviewWidget from "../../Widgets/AnimePreviewWidget";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import Logger from "../../Logger/Logger";
import HikkaAuthStorage from "../../Storage/HikkaAuthStorage";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import LoginScreen from "../LoginScreen";
import { useThemeColors } from "../../Global/useTheme";
import { H2 } from "../../Styles/Fonts";
import { useGridColumns } from "../../Styles/Responsive";
import { styles, STATUS_TITLES, getGridItemWidth } from "./styles";

// Tablet version of Bookmark screen (grid layout)
export default function BookmarkTablet({ ...props }) {
  const colors = useThemeColors();
  const [currentStatus, setCurrentStatus] = useState("favourite");
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { width, height } = useWindowDimensions();
  const numColumns = useGridColumns(180);

  // Calculate card width based on grid columns
  const cardWidth = useMemo(() => {
    return getGridItemWidth(width, numColumns, 16);
  }, [width, numColumns]);

  Logger.debug("BookmarkTablet", "props", { ...props });

  const fetchAnimeList = useCallback(
    async (statusToFetch, pageToFetch = 1, append = false) => {
      const user = HikkaAuthStorage.getUser();
      if (!user?.username) {
        Logger.error("BookmarkTablet", "Користувач не знайдений");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let response;

        if (statusToFetch === "favourite") {
          response = await HikkaApiComplete.getUserFavorites(
            "anime",
            user.username,
            { page: pageToFetch, size: 24 } // Larger page size for grid
          );
          Logger.debug("BookmarkTablet", "Отримано улюблені", response);
        } else {
          response = await HikkaApiComplete.getUserWatchList(user.username, {
            watch_status: statusToFetch,
            page: pageToFetch,
            size: 24, // Larger page size for grid
          });
          Logger.debug("BookmarkTablet", "Отримано watch list", response);
        }

        if (response?.list) {
          const animeData = response.list.map((item) => item.anime || item);

          if (append) {
            setAnimeList((prev) => [...prev, ...animeData]);
          } else {
            setAnimeList(animeData);
          }

          const pagination = response.pagination;
          if (pagination) {
            setHasMore(pageToFetch < (pagination.pages || 1));
          } else {
            setHasMore(false);
          }
        } else {
          if (!append) {
            setAnimeList([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        Logger.error("BookmarkTablet", "Помилка завантаження", error);
        if (!append) {
          setAnimeList([]);
        }
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAnimeList(currentStatus, 1, false);
  }, [currentStatus, fetchAnimeList]);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      setPage(1);
      fetchAnimeList(currentStatus, 1, false);
    });

    return unsubscribe;
  }, [props.navigation, currentStatus, fetchAnimeList]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAnimeList(currentStatus, nextPage, true);
    }
  }, [isLoading, hasMore, page, currentStatus, fetchAnimeList]);

  const renderItem = useCallback(
    ({ item }) => {
      if (!item?.slug) {
        Logger.warn("BookmarkTablet", "Невалідний елемент", { item });
        return null;
      }

      return (
        <AnimePreviewWidget
          anime={item}
          info={{}}
          type={currentStatus}
          gridMode={true}
          cardWidth={cardWidth}
        />
      );
    },
    [currentStatus, cardWidth]
  );

  const keyExtractor = useCallback(
    (item, index) => item?.slug || `${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Text selectable={true} style={[styles.emptyMessage, H2]}>
            {`Список "${STATUS_TITLES[currentStatus] || "аніме"}" порожній`}
          </Text>
        </View>
      ) : null,
    [isLoading, currentStatus, height]
  );

  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null,
    [isLoading, colors.primary]
  );

  if (HikkaAuthStorage.isAuthenticated()) {
    return (
      <DefaultScreenWidget isCheckInternet={true} hasManualHeader={true}>
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
          contentContainerStyle={[styles.listContentContainer, styles.gridContainer]}
          columnWrapperStyle={styles.gridColumnWrapper}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
        <View style={{ paddingBottom: 60 }} />

        <AnimeStatusFAB
          bottomOffset={80}
          onStatusChange={(item) => {
            Logger.debug("BookmarkTablet", "FAB", { item });
            if (item !== currentStatus) {
              setCurrentStatus(item || "favourite");
            }
          }}
          currentStatus={currentStatus}
          isFavoritesTab={true}
        />
      </DefaultScreenWidget>
    );
  } else {
    return <LoginScreen isCanSkip={false} />;
  }
}
