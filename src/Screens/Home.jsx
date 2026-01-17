import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Logger from "../Logger/Logger";
import BigBannerWidget from "../Widgets/BigBannerWidget";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import TopNavigationComponent from "../Components/TopNavigationComponent";
import { useThemeColors } from "../Global/useTheme";
import { useFocusEffect } from "@react-navigation/native";
import { HikkaSets } from "../Sources/HikkaSets";
import { AnimeListHorizontal } from "./../Widgets/AnimeListHorizontalWidget";
import { useNavigation } from "@react-navigation/native";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { sendRequest } from "../Sources/CustomSet";
import { useIsTabletLandscape } from "../Styles/Responsive";
import DoramaScreen from "./DoramaScreen";
import MangaScreen from "./MangaScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContentTypeTab } from "./ScreenController/Navigators";
import { useHikkaUser } from "../Hooks/useHikkaUser";

/**
 * Кастомний TabBar для ContentTypeTab навігатора
 */
function ContentTypeTabBar({ state, navigation }) {
  const currentRoute = state.routes[state.index].name;

  const handleTabChange = useCallback(
    (tabKey) => {
      const routeMap = {
        dorama: "DoramaTab",
        anime: "AnimeTab",
        manga: "MangaTab",
      };
      navigation.navigate(routeMap[tabKey]);
    },
    [navigation]
  );

  const activeTab =
    currentRoute === "DoramaTab"
      ? "dorama"
      : currentRoute === "MangaTab"
        ? "manga"
        : "anime";

  return (
    <TopNavigationComponent
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const hikkaUser = useHikkaUser();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      hikkaUser?.refetch?.();
    }, [hikkaUser?.refetch])
  );

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View style={{ flex: 1 }}>
        <ContentTypeTab.Navigator
          initialRouteName="AnimeTab"
          tabBar={(props) => (
            <View
              style={{
                marginTop: 8,
                backgroundColor: "transparent",
                zIndex: 2,
                position: "absolute",
                width: "100%",
              }}
            >
              <ContentTypeTabBar {...props} />
            </View>
          )}
          screenOptions={{
            swipeEnabled: false,
            animationEnabled: true,
            lazy: true,
          }}
          sceneContainerStyle={{ backgroundColor: "transparent" }}
          style={{ backgroundColor: "transparent" }}
        >
          <ContentTypeTab.Screen name="DoramaTab" component={DoramaScreen} />
          <ContentTypeTab.Screen name="AnimeTab">
            {() => (
              <AnimeTabContent
                historyData={hikkaUser?.history}
                refetchUserData={hikkaUser?.refetch}
              />
            )}
          </ContentTypeTab.Screen>
          <ContentTypeTab.Screen name="MangaTab" component={MangaScreen} />
        </ContentTypeTab.Navigator>
      </View>
    </DefaultScreenWidget>
  );
}

/**
 * Компонент для вкладки Аніме
 */
function AnimeTabContent({ historyData, refetchUserData }) {
  const colors = useThemeColors();
  const isTL = useIsTabletLandscape();
  const insets = useSafeAreaInsets();
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations")
  );
  const navigation = useNavigation();
  const historyList = useMemo(() => {
    if (Array.isArray(historyData)) {
      return historyData;
    }
    if (Array.isArray(historyData?.list)) {
      return historyData.list;
    }
    return [];
  }, [historyData]);

  const animeHistory = useMemo(() => {
    const filtered = historyList
      .filter((item) => item.content?.data_type === "anime")
      .map((item) => item.content);

    return filtered.filter((item, index) => {
      if (index === 0) return true;
      return item.slug !== filtered[index - 1].slug;
    });
  }, [historyList]);

  // Ініціалізація дефолтних списків при першому запуску
  useEffect(() => {
    const currentRecs =
      SettingsStorage.getParameter("userConfig.recommendations") || {};

    // Перевіряємо чи потрібно скинути до дефолтних (міграція старого формату)
    const listsVersion = SettingsStorage.getParameter(
      "personalRecListsVersion"
    );
    if (listsVersion !== 2) {
      PersonalRecListStorage.resetToDefaultLists();
      SettingsStorage.setParameter("personalRecListsVersion", 2);
    } else {
      PersonalRecListStorage.initializeDefaultLists();
    }

    // Ініціалізуємо тільки якщо значення ще не встановлені
    const needsInit =
      currentRecs.isCustomedPersonalRecommendations === undefined ||
      currentRecs.isDefaultBigBanner === undefined;

    if (needsInit) {
      const newRecommendations = {
        ...currentRecs,
        isCustomedPersonalRecommendations:
          currentRecs.isCustomedPersonalRecommendations ?? true,
        isDefaultBigBanner: currentRecs.isDefaultBigBanner ?? true,
      };

      SettingsStorage.setParameter(
        "userConfig.recommendations",
        newRecommendations
      );
      setRecommendations(newRecommendations);
      EventBus.emit("recommendations", newRecommendations);
    } else {
      setRecommendations(currentRecs);
    }

    EventBus.emit("personalRecListUpdated");
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.on("recommendations", (newRecommendations) => {
      setRecommendations(newRecommendations);
    });
    return unsubscribe;
  }, []);

  const loadPopularAnime = useCallback(async () => {
    setIsLoading(true);
    try {
      const yearData = await HikkaSets.getMostPopularAnime(1, 6, 2025);
      setAnimeList_popularity_this_year(yearData);
    } catch (error) {
      Logger.error("Home", "Помилка при завантаженні даних", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Оновлюємо дані при кожному поверненні на вкладку, щоб синхронізувати головний екран
      loadPopularAnime();
      refetchUserData?.();
    }, [loadPopularAnime, refetchUserData])
  );
  if (isTL) {
    return (
      <DefaultScreenWidget
        style={{
          flex: 1,
          flexDirection: "row",
        }}
      >
        {recommendations?.isDefaultBigBanner === true && (
          <View
            style={{
              width: "40%",
              height: "100%",
            }}
          >
            <BigBannerWidget.Tablet animes={animeList_popularity_this_year} />
          </View>
        )}
        <View style={{ flex: 1, height: "100%" }}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  paddingBottom: 50,
                  width: "95%",
                  alignSelf: "center",
                }}
              >
                <View style={{ height: 20 }} />
                {animeHistory?.length > 0 && (
                  <AnimeListHorizontal
                    title="Історія перегяду"
                    animeList={animeHistory.split(0, 15)}
                    onClickMore={
                      animeHistory.length < 15
                        ? null
                        : async () => {
                            navigation.navigate("HiddenStack", {
                              screen: "AnimeList",
                              params: {
                                title: "Історія перегляду",
                                initialData: animeHistory,
                              },
                            });
                          }
                    }
                  />
                )}

                {recommendations?.isCustomedPersonalRecommendations && (
                  <CustomPersonalRecList />
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {recommendations?.isDefaultBigBanner === true && (
          <View style={{ marginTop: insets.top + 24 }}>
            <BigBannerWidget.Mobile animes={animeList_popularity_this_year} />
          </View>
        )}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              width: "95%",
              alignSelf: "center",
            }}
          >
            {animeHistory?.length > 0 && (
              <AnimeListHorizontal
                title="Історія перегляду"
                animeList={animeHistory.slice(0, 15)}
                onClickMore={
                  animeHistory.length < 15
                    ? null
                    : async () => {
                        navigation.navigate("HiddenStack", {
                          screen: "AnimeList",
                          params: {
                            title: "Історія перегляду",
                            initialData: animeHistory,
                          },
                        });
                      }
                }
              />
            )}
            {recommendations?.isCustomedPersonalRecommendations && (
              <CustomPersonalRecList />
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </DefaultScreenWidget>
  );
}

/**
 * Компонент для відображення персоналізованих списків рекомендацій
 */
const CustomPersonalRecList = React.memo(() => {
  const [personalRecList, setPersonalRecList] = useState([]);
  const colors = useThemeColors();
  const [loadedAnimeLists, setLoadedAnimeLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    try {
      setIsLoading(true);
      const data = PersonalRecListStorage.getSettingsList();
      setPersonalRecList(data);
    } catch (error) {
      Logger.error("Home", "Помилка при завантаженні популярних аніме", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.on("personalRecListUpdated", () => {
      try {
        const data = PersonalRecListStorage.getSettingsList();
        setPersonalRecList(data);
      } catch (e) {
        Logger.error("Home", "Помилка при оновленні персональних списків", e);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!personalRecList || personalRecList.length === 0) {
      setLoadedAnimeLists([]);
      return;
    }
    setIsLoading(true);
    Promise.all(
      personalRecList.map(async (anime) => {
        try {
          const res = await sendRequest(anime, "preview");
          return { name: anime.name, animeList: res };
        } catch (e) {
          return { name: anime.name, animeList: [] };
        }
      })
    )
      .then((results) => {
        setLoadedAnimeLists(results);
      })
      .finally(() => setIsLoading(false));
  }, [personalRecList]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (loadedAnimeLists.length === 0) return null;

  return (
    <>
      {loadedAnimeLists.map((animeList, index) => (
        <AnimeListHorizontal
          key={index}
          title={animeList.name}
          animeList={animeList.animeList}
          onClickMore={
            loadedAnimeLists[index].animeList.length < 10
              ? null
              : async () => {
                  const data = await sendRequest(
                    personalRecList[index],
                    "full"
                  );
                  navigation.navigate("HiddenStack", {
                    screen: "AnimeList",
                    params: {
                      title: personalRecList[index].name,
                      initialData: data,
                    },
                  });
                }
          }
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    height: 200,
  },
});
