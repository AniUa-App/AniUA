import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
// import {TouchableOpacity} from '../Widgets/Button'; // Видалено невикористаний імпорт
import React, { useState, useEffect, useCallback } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import AnimePreviewWidget from "../Widgets/AnimePreviewWidget";
import { HikkaApi } from "../Sources/hikka";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AnimeStorage from "../Storage/AnimeStorage";
import { H2 } from "../Styles/Fonts";
import Logger from "../Logger/Logger";

const MAX_CONCURRENT_REQUESTS = 10;

// Видалено невикористану константу WidgetsForAnimeList
// const WidgetsForAnimeList = {
//   Liked: {
//     widget: <LikeIcon fill={primary} />,
//   },
//   Downloaded: {
//     widget: <DownloadIcon fill={primary} />,
//   },
// };

// Основний компонент екрану списку аніме
export default function AnimeListScreen({ route, isNavBarPadding }) {
  const { type, initialData, title } = route.params;
  const { height } = useWindowDimensions();
  const themeColors = useThemeColors();

  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState({});
  const [isCheckingInternet, setIsCheckingInternet] = useState(null);

  const getInfos = useCallback(() => {
    try {
      const storedInfos = AnimeStorage.getInfos();
      setInfo(storedInfos || {});
      Logger.debug("AnimeList", "Інформація завантажена", { storedInfos });
    } catch (error) {
      Logger.error("AnimeList", "Помилка при завантаженні інформації", error);
      setInfo({}); // Встановлюємо пустий об'єкт у випадку помилки
    }
  }, []);

  const updateInfos = useCallback(
    (slug, newInfoData) => {
      setInfo((prevInfo) => {
        const updatedInfo = {
          ...prevInfo,
          [slug]: { ...(prevInfo[slug] || {}), ...newInfoData },
        };
        Logger.debug("AnimeList", "Оновлення інформації", {
          slug,
          newInfoData,
        });
        AnimeStorage.setInfoBySlug(slug, newInfoData); // Зберігаємо оновлення
        return updatedInfo;
      });
      // Якщо тип 'liked' і ми щойно видалили з улюблених, можна одразу оновити список візуально
      // (хоча useFocusEffect все одно оновить при поверненні)
      if (type === "Liked" && newInfoData.isFavorite === false) {
        setAnimeList((prevList) =>
          prevList.filter((anime) => anime.slug !== slug)
        );
      }
    },
    [type]
  ); // Додаємо type до залежностей, якщо він використовується

  // Оптимізована функція для паралельного завантаження аніме
  const fetchAnimeDetails = useCallback(async (animeSlug) => {
    try {
      return await HikkaApi.getAnimeDetails(animeSlug);
    } catch (error) {
      Logger.error("AnimeList", "Помилка при отриманні деталей аніме", {
        animeSlug,
        error,
      });
      return null;
    }
  }, []);

  // Функція для обмеження кількості одночасних запитів
  const fetchWithConcurrencyLimit = useCallback(async (tasks) => {
    const results = [];

    // Створюємо чергу завдань
    for (let i = 0; i < tasks.length; i += MAX_CONCURRENT_REQUESTS) {
      const batch = tasks.slice(i, i + MAX_CONCURRENT_REQUESTS);
      const batchResults = await Promise.all(batch.map((task) => task()));

      // Накопичуємо аніме в пакеті
      const validResults = batchResults.filter(Boolean);
      if (validResults.length > 0) {
        // Оновлюємо список аніме пакетами
        setAnimeList((prev) => [...prev, ...validResults]);
      }

      results.push(...batchResults);
    }

    return results;
  }, []);

  // Головна функція завантаження аніме
  const fetchMoreAnime = useCallback(async () => {
    setIsLoading(true);
    setAnimeList([]); // Очищаємо список перед завантаженням

    // Завжди перезавантажуємо інфо безпосередньо перед використанням
    const currentInfo = AnimeStorage.getInfos() || {};

    let dataToFetch; // Визначаємо dataToFetch всередині функції

    // Визначаємо, які дані потрібно завантажити залежно від типу списку
    switch (type) {
      case "Liked":
        dataToFetch = Object.keys(currentInfo).filter(
          (slug) => currentInfo[slug]?.isFavorite
        );
        Logger.debug("AnimeList", "Завантаження улюбленого", {
          slugs: dataToFetch,
        });
        setIsCheckingInternet(false);
        break;
      case "Downloaded":
        dataToFetch = Object.keys(currentInfo).filter(
          (slug) => (currentInfo[slug]?.downloaded?.episodes?.length || 0) > 0 // Трохи спрощено
        );
        Logger.debug("AnimeList", "Завантаження завантаженого", {
          slugs: dataToFetch,
        });
        setIsCheckingInternet(false);
        break;
      default:
        dataToFetch = initialData; // Використовуємо initialData для інших типів
        Logger.debug("AnimeList", "Завантаження початкових даних", {
          data: dataToFetch,
        });
        setIsCheckingInternet(true);
    }

    // Перевіряємо дані, використовуючи dataToFetch
    if (!Array.isArray(dataToFetch) || dataToFetch.length === 0) {
      Logger.debug("AnimeList", "Немає даних для завантаження", {
        dataToFetch,
      });
      setIsLoading(false);
      return;
    }

    // Підготовка завдань для паралельного виконання, використовуючи dataToFetch
    const tasks = dataToFetch.map((item) => {
      // Якщо це об'єкт з деталями (з initialData)
      if (typeof item === "object" && item?.slug) {
        // Можна додати перевірку, чи потрібне оновлення, якщо дані вже є
        // if (item.synopsis_ua) return async () => item; // Якщо дані повні, не перезавантажувати
        return async () => await fetchAnimeDetails(item.slug); // Або завжди оновлювати
      }
      // Якщо це просто slug (з 'liked' або 'downloaded')
      else if (typeof item === "string") {
        return async () => await fetchAnimeDetails(item);
      }
      // Логуємо невалідний елемент і повертаємо функцію, що повертає null
      Logger.warn("AnimeList", "Невалідний елемент в dataToFetch", { item });
      return async () => null;
    });

    // Запускаємо паралельне завантаження з обмеженою кількістю одночасних запитів
    await fetchWithConcurrencyLimit(tasks);

    setIsLoading(false);
    Logger.debug("AnimeList", "Завантаження аніме завершено");
  }, [type, initialData, fetchAnimeDetails, fetchWithConcurrencyLimit]); // Видалено info з залежностей

  // Використовуємо useFocusEffect для завантаження/оновлення даних при фокусі екрану
  useFocusEffect(
    useCallback(() => {
      const loadDataSequentially = async () => {
        await getInfos(); // Спочатку оновлюємо інформацію про вподобання/статус
        await fetchMoreAnime(); // Потім завантажуємо список аніме
      };

      loadDataSequentially();
    }, [getInfos, fetchMoreAnime]) // Передаємо функції як залежності
  );

  // Оптимізований рендеринг списку
  const renderItem = useCallback(
    ({ item }) => {
      // Перевіряємо чи є взагалі item та item.slug
      if (!item?.slug) {
        // Трохи спрощена перевірка
        Logger.warn("AnimeList", "RenderItem отримав невалідний елемент", {
          item,
        });
        return null;
      }

      const currentItemInfo = info?.[item.slug] || {}; // Більш короткий запис

      // Якщо тип списку 'liked', показуємо елемент тільки якщо він є улюбленим
      // Використовуємо currentItemInfo, яке оновлюється через useFocusEffect -> getInfos
      if (type === "Liked" && !currentItemInfo.isFavorite) {
        // Якщо тип 'liked', але елемент не улюблений (згідно з актуальним info), не відображаємо його
        return null;
      }

      // Для всіх інших типів або якщо це 'Liked' і isFavorite true
      return (
        <AnimePreviewWidget
          anime={item}
          info={currentItemInfo}
          updateInfo={updateInfos}
          type={type} // Передаємо тип для логіки іконки/дії в AnimePreviewWidget
        />
      );
    },
    [info, updateInfos, type] // Залежність від info потрібна для currentItemInfo
  );

  // Унікальний ключ для елементів списку
  const keyExtractor = useCallback((item, index) => item.slug || index, []);

  // Компонент для відображення коли список порожній
  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          {/* Додано контейнер для кращого центрування */}
          <Text style={[styles.emptyMessage, H2, {}]}>
            {type === "Liked"
              ? "Список улюбленого порожній"
              : type === "Downloaded"
                ? "Список завантаженого порожній"
                : "Список порожній"}
          </Text>
        </View>
      ) : null,
    // Додаємо type до залежностей, оскільки текст повідомлення залежить від нього
    [isLoading, type, height]
  );

  // Індикатор завантаження в кінці списку
  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : null,
    [isLoading]
  );

  return (
    <DefaultScreenWidget
      isCheckInternet={isCheckingInternet}
      isNavBarPadding={isNavBarPadding}
    >
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
      />
    </DefaultScreenWidget>
  );
}

// Стилі для компонентів
const styles = StyleSheet.create({
  // Стиль для заголовка
  title: {
    padding: 16,
  },
  // Стиль для контейнера індикатора завантаження
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  // Стиль для повідомлення про кінець списку (перейменовано для ясності)
  emptyMessage: {
    textAlign: "center",
    padding: "5%",
    // marginTop: '55%', // Видалено, щоб центрування працювало краще
  },
  // Додано стиль для контейнера порожнього списку
  emptyContainer: {
    flex: 1, // Займає весь доступний простір
    justifyContent: "center", // Центрує по вертикалі
    alignItems: "center", // Центрує по горизонталі
    // marginTop переміщено в inline стиль для динамічності
  },
  listContentContainer: {
    flexGrow: 1, // Дозволяє контейнеру рости, важливо для ListEmptyComponent
    paddingBottom: 20,
  },
});
