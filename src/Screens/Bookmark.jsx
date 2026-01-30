import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import AnimeStatusFAB from "../Widgets/AnimeStatusFAB";
import AnimePreviewWidget from "../Widgets/AnimePreviewWidget";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import Logger from "../Logger/Logger";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import LoginScreen from "./LoginScreen";
import { useThemeColors } from "../Global/useTheme";
import { H2 } from "../Styles/Fonts";

// Мапінг статусів FAB до назв для заголовка
const STATUS_TITLES = {
  favourite: "Улюблене",
  watching: "Дивлюсь",
  completed: "Переглянуто",
  planned: "Заплановано",
  dropped: "Закинуто",
};

export default function BookmarkScreen({ ...props }) {
  const colors = useThemeColors();
  const [currentStatus, setCurrentStatus] = useState("favourite");
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { height } = useWindowDimensions();

  Logger.debug("BookmarkScreen", "props", { ...props });

  // Функція для завантаження аніме з API
  const fetchAnimeList = useCallback(
    async (statusToFetch, pageToFetch = 1, append = false) => {
      const user = HikkaAuthStorage.getUser();
      if (!user?.username) {
        Logger.error("BookmarkScreen", "Користувач не знайдений");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        let response;

        if (statusToFetch === "favourite") {
          // Завантаження улюблених
          response = await HikkaApiComplete.getUserFavorites(
            "anime",
            user.username,
            { page: pageToFetch, size: 15 }
          );
          Logger.debug("BookmarkScreen", "Отримано улюблені", response);
        } else {
          // Завантаження watch list з фільтром по статусу
          response = await HikkaApiComplete.getUserWatchList(user.username, {
            watch_status: statusToFetch,
            page: pageToFetch,
            size: 15,
          });
          Logger.debug("BookmarkScreen", "Отримано watch list", response);
        }

        if (response?.list) {
          // Для favourite list - дані аніме в полі anime
          // Для watch list - дані аніме також в полі anime
          const animeData = response.list.map((item) => item.anime || item);

          if (append) {
            setAnimeList((prev) => [...prev, ...animeData]);
          } else {
            setAnimeList(animeData);
          }

          // Оновлення пагінації
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
        Logger.error("BookmarkScreen", "Помилка завантаження", error);
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

  // Завантаження при зміні статусу
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAnimeList(currentStatus, 1, false);
  }, [currentStatus, fetchAnimeList]);

  // Оновлення при фокусі екрану
  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      setPage(1);
      fetchAnimeList(currentStatus, 1, false);
    });

    return unsubscribe;
  }, [props.navigation, currentStatus, fetchAnimeList]);

  // Завантаження наступної сторінки
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAnimeList(currentStatus, nextPage, true);
    }
  }, [isLoading, hasMore, page, currentStatus, fetchAnimeList]);

  // Рендер елемента списку
  const renderItem = useCallback(
    ({ item }) => {
      if (!item?.slug) {
        Logger.warn("BookmarkScreen", "Невалідний елемент", { item });
        return null;
      }

      return <AnimePreviewWidget anime={item} info={{}} type={currentStatus} />;
    },
    [currentStatus]
  );

  // Ключ для елемента
  const keyExtractor = useCallback(
    (item, index) => item?.slug || `${index}`,
    []
  );

  // Компонент порожнього списку
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

  // Індикатор завантаження
  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null,
    [isLoading]
  );

  if (HikkaAuthStorage.isAuthenticated()) {
    return (
      <DefaultScreenWidget isCheckInternet={true} hasManualHeader={true}>
        <FlatList
          data={animeList}
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
        <View style={{ paddingBottom: 60 }} />

        <AnimeStatusFAB
          bottomOffset={80}
          onStatusChange={(item) => {
            Logger.debug("BookmarkScreen", "FAB", { item });
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

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyMessage: {
    textAlign: "center",
    padding: "5%",
    color: "grey",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
