import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useState, useCallback, useEffect, useMemo } from "react";
import AnimePreviewWidget from "../../Widgets/AnimePreviewWidget";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import Logger from "../../Logger/Logger";
import HikkaAuthStorage from "../../Storage/HikkaAuthStorage";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import LoginScreen from "../LoginScreen";
import { useThemeColors } from "../../Global/useTheme";
import { H2 } from "../../Styles/Fonts";
// import { useGridColumns } from "../../Styles/Responsive";
import { styles, STATUS_TITLES, getGridItemWidth } from "./styles";
import { TVFocusableGrid, TVStatusSelector } from "../../Components/TV";

export default function BookmarkTV({ ...props }) {
  const colors = useThemeColors();
  const [currentStatus, setCurrentStatus] = useState("favourite");
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { width, height } = useWindowDimensions();
  const numColumns = 2;

  const cardWidth = useMemo(() => {
    return getGridItemWidth(width, numColumns, 8);
  }, [width, numColumns]);

  const fetchAnimeList = useCallback(
    async (statusToFetch, pageToFetch = 1, append = false) => {
      const user = HikkaAuthStorage.getUser();
      if (!user?.username) {
        Logger.error("BookmarkTV", "Користувач не знайдений");
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
            { page: pageToFetch, size: 28 },
          );
        } else {
          response = await HikkaApiComplete.getUserWatchList(user.username, {
            watch_status: statusToFetch,
            page: pageToFetch,
            size: 28,
          });
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
          if (!append) setAnimeList([]);
          setHasMore(false);
        }
      } catch (error) {
        Logger.error("BookmarkTV", "Помилка завантаження", error);
        if (!append) setAnimeList([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
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
      if (!item?.slug) return null;

      return (
        <View style={{ maxWidth: 400, width: "100%" }}>
          <AnimePreviewWidget
            anime={item}
            info={{}}
            type={currentStatus}
            gridMode={false}
            maxWidth={400}
          />
        </View>
      );
    },
    [currentStatus, cardWidth, height],
  );

  const keyExtractor = useCallback(
    (item, index) => item?.slug || `${index}`,
    [],
  );

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Text
            selectable={true}
            style={[styles.emptyMessage, H2, { fontSize: 24 }]}
          >
            {`Список порожній`}
          </Text>
        </View>
      ) : null,
    [isLoading, currentStatus, height],
  );

  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null,
    [isLoading, colors.primary],
  );

  if (HikkaAuthStorage.isAuthenticated()) {
    return (
      <DefaultScreenWidget isCheckInternet={true} hasManualHeader={false}>
        {/* TV Status Selector replaces the floating FAB */}
        <TVStatusSelector
          currentStatus={currentStatus}
          onStatusChange={(item) => {
            if (item !== currentStatus) {
              setCurrentStatus(item || "favourite");
            }
          }}
          isFavoritesTab={true}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TVFocusableGrid
            data={animeList}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            key={`list-${numColumns}`}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            contentContainerStyle={[
              styles.listContentContainer,
              styles.gridContainer,
              { width: 400 * numColumns + 8, minHeight: height },
              { backgroundColor: colors.accent },
            ]}
            columnWrapperStyle={styles.gridColumnWrapper}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        </ScrollView>
      </DefaultScreenWidget>
    );
  } else {
    return <LoginScreen isCanSkip={false} />;
  }
}
