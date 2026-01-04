import React, { useState, useEffect, useCallback } from "react";
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

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }, [])
  );

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View style={{ flex: 1 }}>
        <ContentTypeTab.Navigator
          initialRouteName="AnimeTab"
          tabBar={(props) => (
            <View
              style={{
                marginTop: insets.top,
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
            swipeEnabled: true,
            animationEnabled: true,
            lazy: true,
          }}
          sceneContainerStyle={{}}
          style={{}}
        >
          <ContentTypeTab.Screen name="DoramaTab" component={DoramaScreen} />
          <ContentTypeTab.Screen name="AnimeTab" component={AnimeTabContent} />
          <ContentTypeTab.Screen name="MangaTab" component={MangaScreen} />
        </ContentTypeTab.Navigator>
      </View>
    </DefaultScreenWidget>
  );
}

/**
 * Компонент для вкладки Аніме
 */
function AnimeTabContent() {
  const colors = useThemeColors();
  const isTL = useIsTabletLandscape();
  const insets = useSafeAreaInsets();
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations")
  );

  useEffect(() => {
    const unsubscribe = EventBus.on("recommendations", (newRecommendations) => {
      setRecommendations(newRecommendations);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const yearData = await HikkaSets.getMostPopularAnime(1, 6, 2025);
        setAnimeList_popularity_this_year(yearData);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні даних", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isTL) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          backgroundColor: colors.background,
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
          <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            showsVerticalScrollIndicator={false}
          >
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
                {recommendations?.isCustomedPersonalRecommendations && (
                  <CustomPersonalRecList />
                )}
                {recommendations?.isEnabled && (
                  <>
                    <OngoingAnimeList />
                    <PopularAnimeList />
                    <RomanceAnimeList />
                    <ActionAnimeList />
                    <SciFiAnimeList />
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {recommendations?.isDefaultBigBanner === true && (
        <View style={{ marginTop: insets.top + 44 }}>
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
            paddingBottom: 50,
            width: "95%",
            alignSelf: "center",
            marginTop: recommendations?.isDefaultBigBanner ? -20 : 0,
            zIndex: 10,
          }}
        >
          {recommendations?.isCustomedPersonalRecommendations && (
            <CustomPersonalRecList />
          )}
          {recommendations?.isEnabled && (
            <>
              <OngoingAnimeList />
              <PopularAnimeList />
              <RomanceAnimeList />
              <ActionAnimeList />
              <SciFiAnimeList />
            </>
          )}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
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

const PopularAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getMostPopularAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        Logger.error(
          "Home",
          "Помилка при завантаженні популярних аніме",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopularAnime();
  }, []);

  const handleShowMore = useCallback(async () => {
    try {
      const data = await HikkaSets.getMostPopularAnime(1, 50, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: { title: "Найпопулярніші аніме", initialData: data },
      });
    } catch (error) {
      Logger.error("Home", "Помилка при завантаженні аніме", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AnimeListHorizontal
      title="Найпопулярніші аніме"
      animeList={animeList}
      onClickMore={handleShowMore}
    />
  );
});

const OngoingAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOngoingAnime = async () => {
      try {
        const data = await HikkaSets.getOngoingAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні онгоїнгів", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOngoingAnime();
  }, []);

  const handleShowMore = useCallback(async () => {
    try {
      const data = await HikkaSets.getOngoingAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: { title: "Онґоінги", initialData: data },
      });
    } catch (error) {
      Logger.error("Home", "Помилка при завантаженні аніме", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AnimeListHorizontal
      title="Онґоінги"
      animeList={animeList}
      onClickMore={handleShowMore}
    />
  );
});

const ActionAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActionAnime = async () => {
      try {
        const data = await HikkaSets.getActionAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні бойовиків", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActionAnime();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AnimeListHorizontal
      title="Бойовики"
      animeList={animeList}
      onClickMore={null}
    />
  );
});

const SciFiAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSciFiAnime = async () => {
      try {
        const data = await HikkaSets.getSciFiAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні фантастики", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSciFiAnime();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AnimeListHorizontal
      title="Фантастика"
      animeList={animeList}
      onClickMore={null}
    />
  );
});

const RomanceAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRomanceAnime = async () => {
      try {
        const data = await HikkaSets.getRomanceAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні романтики", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRomanceAnime();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <AnimeListHorizontal
      title="Романтика"
      animeList={animeList}
      onClickMore={null}
    />
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
