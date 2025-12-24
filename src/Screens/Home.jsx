import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Logger from "../Logger/Logger";
import BigBannerWidget from "../Widgets/BigBannerWidget";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SearchLine from "../Widgets/SearchLineWidget";
import AnimeListVertical from "../Widgets/AnimeListVerticalWidget";
import { useThemeColors } from "../Global/useTheme";
import { useFocusEffect } from "@react-navigation/native";
import { InternetError } from "../Widgets/ErrorsWidgets";
import { HikkaSets } from "../Sources/HikkaSets";
import { AnimeListHorizontal } from "./../Widgets/AnimeListHorizontalWidget";
import { useNavigation } from "@react-navigation/native";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { sendRequest } from "../Sources/CustomSet";
import { useIsTabletLandscape } from "../Styles/Responsive";

export default function HomeScreen() {
  const colors = useThemeColors();
  const isTL = useIsTabletLandscape();
  const navigation = useNavigation();
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInternetError, setHasInternetError] = useState(false);

  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations")
  );

  /**
   * Підписка на зміни налаштувань рекомендацій через EventBus
   */
  useEffect(() => {
    EventBus.on("recommendations", (newRecommendations) => {
      setRecommendations(newRecommendations);
    });
  }, []);

  /**
   * Завантаження найпопулярніших аніме поточного року для BigBanner
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setHasInternetError(false);
      try {
        const yearData = await HikkaSets.getMostPopularAnimeOfTheYear(1, 15);
        setAnimeList_popularity_this_year(yearData);
      } catch (error) {
        Logger.error("Home", "Помилка при завантаженні даних", error);
        setHasInternetError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Налаштовує прозорий статус-бар при фокусі на екрані
   */
  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
    }, [])
  );

  const handleRetry = useCallback(() => {
    if (hasInternetError) {
      const fetchData = async () => {
        setIsLoading(true);
        setHasInternetError(false);
        try {
          const yearData = await HikkaSets.getMostPopularAnimeOfTheYear(1, 15);
          setAnimeList_popularity_this_year(yearData);
        } catch (error) {
          Logger.error("Home", "Помилка при повторному завантаженні", error);
          setHasInternetError(true);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [hasInternetError]);

  if (hasInternetError) {
    return <InternetError onPress={handleRetry} />;
  }

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View
        style={{
          flexDirection: isTL ? "row" : "column",
          flex: 1,
          alignItems: isTL ? "stretch" : "center",
          justifyContent: isTL ? "flex-start" : "center",
        }}
      >
        {isTL ? (
          <>
            {recommendations?.isDefaultBigBanner === true && (
              <View style={{ width: "40%", height: "100%" }}>
                <BigBannerWidget.Tablet
                  animes={animeList_popularity_this_year}
                />
              </View>
            )}

            <SearchLine />

            <View style={{ flex: 1, height: "100%" }}>
              <ScrollView
                style={{ flex: 1 }}
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
                    <View
                      style={{ height: 20, backgroundColor: "transparent" }}
                    />
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
          </>
        ) : (
          <>
            <SearchLine />
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {recommendations?.isDefaultBigBanner === true && (
                <BigBannerWidget.Mobile
                  animes={animeList_popularity_this_year}
                />
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
              <View style={{ height: 40, backgroundColor: "transparent" }} />
            </ScrollView>
          </>
        )}
      </View>
    </DefaultScreenWidget>
  );
}

/**
 * Компонент для відображення персоналізованих списків рекомендацій
 * Завантажує списки з PersonalRecListStorage та відображає їх горизонтально
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

  /**
   * Підписка на оновлення персональних списків через EventBus
   */
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

  /**
   * Завантажує превью аніме для кожного персонального списку
   */
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
        Logger.debug("Home", "Results", JSON.parse(results));
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
  if (loadedAnimeLists.length === 0) {
    return null;
  }
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

/**
 * Компонент для відображення найпопулярніших аніме з 2020 року
 */
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
        params: {
          title: "Найпопулярніші аніме",
          initialData: data,
        },
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

/**
 * Компонент для відображення аніме, що виходять зараз (онгоїнги)
 */
const OngoingAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getOngoingAnime(1, 16, 2020);
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
      const data = await HikkaSets.getOngoingAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Онґоінги",
          initialData: data,
        },
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

/**
 * Компонент для відображення аніме жанру "Бойовик"
 */
const ActionAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getActionAnime(1, 16, 2020);
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
      const data = await HikkaSets.getActionAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Бойовики",
          initialData: data,
        },
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
      title="Бойовики"
      animeList={animeList}
      onClickMore={null}
    />
  );
});

/**
 * Компонент для відображення аніме жанру "Фантастика"
 */
const SciFiAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getSciFiAnime(1, 16, 2020);
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
      const data = await HikkaSets.getSciFiAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Фантастика",
          initialData: data,
        },
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
      title="Фантастика"
      animeList={animeList}
      onClickMore={null}
    />
  );
});

/**
 * Компонент для відображення аніме жанру "Романтика"
 */
const RomanceAnimeList = React.memo(() => {
  const colors = useThemeColors();
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getRomanceAnime(1, 16, 2020);
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
      const data = await HikkaSets.getRomanceAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Романтика",
          initialData: data,
        },
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
