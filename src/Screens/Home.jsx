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
import BigBannerWidget from "../Widgets/BigBannerWidget";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SearchLine from "../Widgets/SearchLineWidget";
import AnimeListVertical from "../Widgets/AnimeListVerticalWidget";
import { appColor } from "../Styles/Colors";
import { useFocusEffect } from "@react-navigation/native";
import { InternetError } from "../Widgets/ErrorsWidgets";
import { HikkaSets } from "../Sources/HikkaSets";
import { AnimeListHorizontal } from "./../Widgets/AnimeListHorizontalWidget";
import { useNavigation } from "@react-navigation/native";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { sendRequest } from "../Sources/CustomSet";

export default function HomeScreen() {
  // Стан для аніме, відсортованих за популярністю за поточний рік
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInternetError, setHasInternetError] = useState(false);

  const [recommendations, setRecommendations] = useState(
    SettingsStorage.getParameter("userConfig.recommendations")
  );

  useEffect(() => {
    EventBus.on("recommendations", (newRecommendations) => {
      setRecommendations(newRecommendations);
    });
  }, []);

  // Отримання найпопулярніших аніме за поточний рік при першому завантаженні
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setHasInternetError(false);
      try {
        const yearData = await HikkaSets.getMostPopularAnimeOfTheYear(1, 5);
        setAnimeList_popularity_this_year(yearData);
      } catch (error) {
        console.error("Помилка при завантаженні даних:", error);
        setHasInternetError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Додаємо useFocusEffect для оновлення статус бару при фокусі
  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      return () => {
        // Очищення при втраті фокусу не потрібно, оскільки інші екрани встановлюють свої налаштування
      };
    }, [])
  );

  const handleRetry = useCallback(() => {
    if (hasInternetError) {
      const fetchData = async () => {
        setIsLoading(true);
        setHasInternetError(false);
        try {
          const yearData = await HikkaSets.getMostPopularAnimeOfTheYear(1, 5);
          setAnimeList_popularity_this_year(yearData);
        } catch (error) {
          console.error("Помилка при повторному завантаженні:", error);
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
    // Основний компонент екрану
    <DefaultScreenWidget>
      {/* Компонент для пошуку */}
      <SearchLine />
      {/* Прокручуваний контейнер для контенту */}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Великий банер для відображення популярних аніме року */}
        {recommendations?.isDefaultBigBanner === true && (
          <BigBannerWidget animes={animeList_popularity_this_year} />
        )}
        {/* Вертикальний список аніме */}
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={appColor} />
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
    </DefaultScreenWidget>
  );
}

const CustomPersonalRecList = React.memo(() => {
  const [personalRecList, setPersonalRecList] = useState([]);
  const [loadedAnimeLists, setLoadedAnimeLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  // Load list from storage once (or on mount)
  useEffect(() => {
    try {
      setIsLoading(true);
      const data = PersonalRecListStorage.getSettingsList();
      setPersonalRecList(data);
    } catch (error) {
      console.error("Помилка при завантаженні популярних аніме:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh list when Home gains focus
  useFocusEffect(
    useCallback(() => {
      EventBus.on(
        "personalRecListUpdated",
        () => {
          try {
            const data = PersonalRecListStorage.getSettingsList();
            setPersonalRecList(data);
          } catch (e) {
            console.error("Помилка при оновленні персональних списків:", e);
          }
        },
        []
      );
    }, [])
  );

  // When list changes, fetch previews
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
        console.log(results, "results");
      })
      .finally(() => setIsLoading(false));
  }, [personalRecList]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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

// Компонент для відображення популярних аніме
const PopularAnimeList = React.memo(() => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getMostPopularAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
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
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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

// Компонент для відображення популярних аніме
const OngoingAnimeList = React.memo(() => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getOngoingAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
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
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getActionAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
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
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getSciFiAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
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
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getRomanceAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
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
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
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
    height: 200, // Фіксована висота для індикатора завантаження
  },
});
