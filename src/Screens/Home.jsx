import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  BackHandler,
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
import {
  useIsTablet,
  useIsLandscape,
  useIsTabletPortrait,
  useIsTV,
} from "../Styles/Responsive";
import DoramaScreen from "./DoramaScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContentTypeTab } from "./ScreenController/Navigators";
import { useHikkaUser } from "../Hooks/useHikkaUser";
import { useHomeStyles } from "../Styles/components/HomeStyles";
import MangaScreen from "./MangaScreen";

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
    [navigation],
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
  const s = useHomeStyles();
  const hikkaUser = useHikkaUser();
  const isTabletDevice = useIsTablet();
  const isLandscape = useIsLandscape();
  const isTV = useIsTV();
  const showSidebar = isTabletDevice && isLandscape;
  const navigatorRef = useRef(null);
  const [bannerAnimes, setBannerAnimes] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState("anime");
  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations"),
  );

  // Завантаження даних для банера на рівні HomeScreen (для планшетів та TV)
  useEffect(() => {
    if (isTabletDevice || isTV) {
      HikkaSets.getMostPopularAnimeOfTheYear(1, 6)
        .then(setBannerAnimes)
        .catch((err) =>
          Logger.error("Home", "Помилка завантаження банера", err),
        );
    }
  }, [isTabletDevice, isTV]);

  useEffect(() => {
    const unsubscribe = EventBus.on("recommendations", (newRecommendations) => {
      setRecommendations(newRecommendations);
    });
    return unsubscribe;
  }, []);

  // Обробник зміни вкладок для планшета
  const handleTabChange = useCallback((tabKey) => {
    setActiveTabKey(tabKey);
  }, []);

  // Навігація при зміні активної вкладки через sidebar TopNavigationComponent.
  // showSidebar НЕ в залежностях — інакше при повороті (коли Home змонтований
  // але не активний) navigate() пробивається до Tab.Navigator і перекидає на Home.
  useEffect(() => {
    if (showSidebar && navigatorRef.current) {
      const routeMap = {
        dorama: "DoramaTab",
        anime: "AnimeTab",
        manga: "MangaTab",
      };
      navigatorRef.current.navigate(routeMap[activeTabKey]);
    }
  }, [activeTabKey]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      hikkaUser?.refetch?.();
    }, [hikkaUser?.refetch]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  // TV - full-width layout, no tab navigator needed (single tab)
  if (isTV) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={s.contentNavigator} focusable={false}>
          <AnimeTabContent
            historyData={hikkaUser?.history}
            refetchUserData={hikkaUser?.refetch}
            isTabletMode={true}
          />
        </View>
      </DefaultScreenWidget>
    );
  }

  // Планшет та телефон — єдиний навігатор, щоб не перемонтовувався при повороті
  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View
        style={[
          s.mainLayout,
          showSidebar && { flexDirection: "row", marginTop: insets.top },
        ]}
      >
        {/* Sidebar — завжди в дереві (width 0 у portrait) щоб навігатор
            залишався на тій самій позиції і не перемонтовувався */}
        <View style={showSidebar ? s.sidebarVisible : s.sidebarHidden}>
          {showSidebar && (
            <>
              <View style={s.sidebarNav}>
                <TopNavigationComponent
                  activeTab={activeTabKey}
                  onTabChange={handleTabChange}
                />
              </View>
              {recommendations?.isDefaultBigBanner !== false && (
                <View style={s.contentNavigator}>
                  <BigBannerWidget.Tablet content={bannerAnimes} />
                </View>
              )}
            </>
          )}
        </View>
        {/* Навігатор контенту — єдиний екземпляр, ніколи не перемонтовується */}
        <View
          style={showSidebar ? s.contentNavigatorSidebar : s.contentNavigator}
        >
          <ContentTypeTab.Navigator
            initialRouteName="AnimeTab"
            tabBar={(props) => {
              if (!navigatorRef.current) {
                navigatorRef.current = props.navigation;
              }
              if (showSidebar) return null;
              return (
                <View style={s.tabBar}>
                  <ContentTypeTabBar {...props} />
                </View>
              );
            }}
            screenOptions={{
              swipeEnabled: false,
              animationEnabled: true,
              lazy: true,
            }}
            sceneContainerStyle={s.transparent}
            style={s.transparent}
          >
            <ContentTypeTab.Screen name="DoramaTab" component={DoramaScreen} />
            <ContentTypeTab.Screen name="AnimeTab">
              {() => (
                <AnimeTabContent
                  historyData={hikkaUser?.history}
                  refetchUserData={hikkaUser?.refetch}
                  isTabletMode={showSidebar}
                />
              )}
            </ContentTypeTab.Screen>
            <ContentTypeTab.Screen name="MangaTab" component={MangaScreen} />
          </ContentTypeTab.Navigator>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}

/**
 * Компонент для вкладки Аніме
 */
function AnimeTabContent({
  historyData,
  refetchUserData,
  isTabletMode = false,
}) {
  const colors = useThemeColors();
  const s = useHomeStyles();
  const isTV = useIsTV();
  const isTabletPort = useIsTabletPortrait();
  const insets = useSafeAreaInsets();
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations"),
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
      "personalRecListsVersion",
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
        newRecommendations,
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
    // На планшеті банер завантажується в HomeScreen, тут не потрібно
    if (isTabletMode) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const yearData = await HikkaSets.getMostPopularAnimeOfTheYear(1, 6);
      setAnimeList_popularity_this_year(yearData);
    } catch (error) {
      Logger.error("Home", "Помилка при завантаженні даних", error);
    } finally {
      setIsLoading(false);
    }
  }, [isTabletMode]);

  useFocusEffect(
    useCallback(() => {
      loadPopularAnime();
      refetchUserData?.();
    }, [loadPopularAnime, refetchUserData]),
  );

  // Планшет landscape / TV - тільки контент, банер рендериться в HomeScreen
  if (isTabletMode) {
    const content = (
      <ScrollView
        style={s.contentNavigator}
        showsVerticalScrollIndicator={false}
        focusable={false}
      >
        <View style={s.tabletContent} focusable={false}>
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

          {recommendations?.isCustomedPersonalRecommendations !== false && (
            <CustomPersonalRecList />
          )}
        </View>
      </ScrollView>
    );

    // TV: без обгортки (DefaultScreenWidget вже є в HomeScreen)
    if (isTV) return content;

    // Планшет: потрібна обгортка для фону
    return (
      <DefaultScreenWidget isNavBarPadding={false}>
        {content}
      </DefaultScreenWidget>
    );
  }

  // Телефон - повний layout з банером
  return (
    <DefaultScreenWidget isNavBarPadding={false}>
      <ScrollView
        style={s.contentNavigator}
        showsVerticalScrollIndicator={false}
      >
        {recommendations?.isDefaultBigBanner !== false && (
          <View style={{ marginTop: insets.top + 24 }}>
            <BigBannerWidget.Mobile content={animeList_popularity_this_year} />
          </View>
        )}
        {isLoading ? (
          <View style={s.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View
            style={isTabletPort ? s.contentContainerTablet : s.contentContainer}
          >
            {animeHistory?.length > 0 && (
              <AnimeListHorizontal
                title="Історія перегляду"
                animeList={animeHistory.slice(0, isTabletPort ? 20 : 15)}
                onClickMore={
                  animeHistory.length < (isTabletPort ? 20 : 15)
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
            {recommendations?.isCustomedPersonalRecommendations !== false && (
              <CustomPersonalRecList />
            )}
          </View>
        )}
        <View style={s.spacer} />
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
  const s = useHomeStyles();
  const [loadedAnimeLists, setLoadedAnimeLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    try {
      setIsLoading(true);
      // Ensure default lists are initialized before loading
      PersonalRecListStorage.initializeDefaultLists();
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
      }),
    )
      .then((results) => {
        setLoadedAnimeLists(results);
      })
      .finally(() => setIsLoading(false));
  }, [personalRecList]);

  if (isLoading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Filter out lists with empty animeList
  const nonEmptyLists = loadedAnimeLists.filter(
    (list) => list.animeList && list.animeList.length > 0,
  );

  if (nonEmptyLists.length === 0) return null;

  return (
    <>
      {nonEmptyLists.map((animeList) => {
        // Find the original index in personalRecList for onClickMore
        const originalIndex = personalRecList.findIndex(
          (item) => item.name === animeList.name,
        );
        return (
          <AnimeListHorizontal
            key={animeList.name}
            title={animeList.name}
            animeList={animeList.animeList}
            onClickMore={
              animeList.animeList.length < 10
                ? null
                : async () => {
                    const data = await sendRequest(
                      personalRecList[originalIndex],
                      "full",
                    );
                    navigation.navigate("HiddenStack", {
                      screen: "AnimeList",
                      params: {
                        title: personalRecList[originalIndex].name,
                        initialData: data,
                      },
                    });
                  }
            }
          />
        );
      })}
    </>
  );
});
