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
import AnimeListHorizontal from "./../Widgets/AnimeListHorizontalWidget";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  // Стан для аніме, відсортованих за популярністю за поточний рік
  const [animeList_popularity_this_year, setAnimeList_popularity_this_year] =
    useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInternetError, setHasInternetError] = useState(false);

  // Отримання найпопулярніших аніме за поточний рік при першому завантаженні
  useEffect(() => {
    // navigation.navigate('HiddenStack', {
    //   screen: 'LocalVideoPlayer',
    //   params: {
    //     __episodes: [
    //       {
    //         episode: 1,
    //         video_url: 'https://moonanime.art/iframe/ykzssipnnuwyabqbamlrzijgq',
    //       },
    //       {
    //         episode: 2,
    //         video_url: 'https://moonanime.art/iframe/exktqhextqphwxw',
    //       },
    //       {
    //         episode: 3,
    //         video_url: 'https://moonanime.art/iframe/lirnylpqswq',
    //       },
    //       {
    //         episode: 4,
    //         video_url: 'https://moonanime.art/iframe/cuhpqqqczvpt',
    //       },
    //       {
    //         episode: 5,
    //         video_url: 'https://moonanime.art/iframe/fcmwnyjopopkqzbvqxrdqvyz',
    //       },
    //       {
    //         episode: 6,
    //         video_url: 'https://moonanime.art/iframe/pvohcmwlkle',
    //       },
    //       {
    //         episode: 7,
    //         video_url:
    //           'https://moonanime.art/iframe/ctpfxzoooropjrfnqfscmkmqnm',
    //       },
    //       {
    //         episode: 8,
    //         video_url: 'https://moonanime.art/iframe/xwlqyhvqpiimty',
    //       },
    //       {
    //         episode: 9,
    //         video_url: 'https://moonanime.art/iframe/kqtsnfvpjoljevlfr',
    //       },
    //       {
    //         episode: 10,
    //         video_url:
    //           'https://moonanime.art/iframe/lnoauvjidltzumjergumqmqbwmorsg',
    //       },
    //       {
    //         episode: 11,
    //         video_url:
    //           'https://moonanime.art/iframe/hzmyrpowbjxztfndewxyostbnpflr',
    //       },
    //       {
    //         episode: 12,
    //         video_url: 'https://moonanime.art/iframe/xcbpqbntpzbaglnkyolgdo',
    //       },
    //     ],
    //     __currentEpisode: {
    //       episode: 1,
    //       video_url: 'https://api.hikka-features.pp.ua/watch/ashdi-vod/172991',
    //     },
    //     __anime: {
    //       "data_type": "anime",
    //       "companies": [
    //         {
    //           "company": {
    //             "image": null,
    //             "slug": "cyberagent-4efc9f",
    //             "name": "CyberAgent"
    //           },
    //           "type": "producer"
    //         },
    //         {
    //           "company": {
    //             "image": "https://cdn.hikka.io/content/companies/sammy-a7bc97/yaso9Rp5IEizUpLrvGYGZA.png",
    //             "slug": "sammy-a7bc97",
    //             "name": "Sammy"
    //           },
    //           "type": "producer"
    //         },
    //         {
    //           "company": {
    //             "image": "https://cdn.hikka.io/content/companies/cygamespictures-54a5c5/uMOicS4wOyZOk1Yl6mcg1w.png",
    //             "slug": "cygamespictures-54a5c5",
    //             "name": "CygamesPictures"
    //           },
    //           "type": "studio"
    //         },
    //         {
    //           "company": {
    //             "image": "https://cdn.hikka.io/content/companies/arma-bianca-8e6eb2/q-pAnkRGBrSLgK-uehrAVQ.png",
    //             "slug": "arma-bianca-8e6eb2",
    //             "name": "arma bianca"
    //           },
    //           "type": "producer"
    //         },
    //         {
    //           "company": {
    //             "image": null,
    //             "slug": "nippon-television-network-8365bc",
    //             "name": "Nippon Television Network"
    //           },
    //           "type": "producer"
    //         },
    //         {
    //           "company": {
    //             "image": "https://cdn.hikka.io/content/companies/dugout-e07a7a/HYLg7yzdUlM2UPZlpGdDFQ.png",
    //             "slug": "dugout-e07a7a",
    //             "name": "dugout"
    //           },
    //           "type": "producer"
    //         },
    //         {
    //           "company": {
    //             "image": null,
    //             "slug": "takeshobo-95f6ac",
    //             "name": "Takeshobo"
    //           },
    //           "type": "producer"
    //         }
    //       ],
    //       "genres": [
    //         {
    //           "name_ua": "Фантастика",
    //           "name_en": "Sci-Fi",
    //           "slug": "sci-fi",
    //           "type": "genre"
    //         }
    //       ],
    //       "start_date": 1744156800,
    //       "end_date": 1750809600,
    //       "updated": 1751061860,
    //       "comments_count": 0,
    //       "episodes_released": 12,
    //       "episodes_total": 12,
    //       "synopsis_en": "The earth where mankind has disappeared and civilization has collapsed, one historical hotel remained.\n\n(Source: Official site, translated)",
    //       "synopsis_ua": "На Землі, де зникло людство і загинула цивілізація, залишився один історичний готель.\n\nДжерело [Офіційний сайт](https://apocalypse-hotel.jp/)",
    //       "media_type": "tv",
    //       "title_ua": "Готель після апокаліпсису",
    //       "title_en": "Apocalypse Hotel",
    //       "title_ja": "Apocalypse Hotel",
    //       "duration": 23,
    //       "image": "https://cdn.hikka.io/content/anime/apocalypse-hotel-ee499e/4zkfQBOpHd1wTY-aKUuwQQ.jpg",
    //       "status": "finished",
    //       "source": "original",
    //       "rating": "pg_13",
    //       "has_franchise": false,
    //       "scored_by": 9421,
    //       "score": 8.01,
    //       "nsfw": false,
    //       "slug": "apocalypse-hotel-ee499e",
    //       "season": "spring",
    //       "year": 2025,
    //       "synonyms": [],
    //       "external": [
    //         {
    //           "url": "https://apocalypse-hotel.jp/",
    //           "text": "Official Site",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://twitter.com/Apo_Hotel",
    //           "text": "@Apo_Hotel",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://anidb.net/perl-bin/animedb.pl?show=anime&aid=18838",
    //           "text": "AniDB",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://www.animenewsnetwork.com/encyclopedia/anime.php?id=33406",
    //           "text": "ANN",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://en.wikipedia.org/wiki/Apocalypse_Hotel",
    //           "text": "Wikipedia",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%9D%E3%82%AB%E3%83%AA%E3%83%97%E3%82%B9%E3%83%9B%E3%83%86%E3%83%AB",
    //           "text": "Wikipedia",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://cal.syoboi.jp/tid/7382",
    //           "text": "Syoboi",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://www.crunchyroll.com/series/GXJHM3G58",
    //           "text": "Crunchyroll",
    //           "type": "general"
    //         },
    //         {
    //           "url": "https://anitube.in.ua/5298-gotel-apokalpsis.html",
    //           "text": "Anitube",
    //           "type": "watch"
    //         },
    //         {
    //           "url": "https://toloka.to/t686702",
    //           "text": "Toloka",
    //           "type": "watch"
    //         }
    //       ],
    //       "videos": [
    //         {
    //           "url": "https://youtu.be/IYtWf-Q5umQ",
    //           "title": "PV 2",
    //           "description": null,
    //           "video_type": "video_promo"
    //         },
    //         {
    //           "url": "https://youtu.be/EBsYqr9jLXc",
    //           "title": "PV 1",
    //           "description": null,
    //           "video_type": "video_promo"
    //         },
    //         {
    //           "url": "https://youtu.be/dldg_R1ggh0",
    //           "title": "PV (Teaser 1)",
    //           "description": null,
    //           "video_type": "video_promo"
    //         }
    //       ],
    //       "ost": [
    //         {
    //           "index": 1,
    //           "title": "skirt",
    //           "author": "aiko",
    //           "spotify": null,
    //           "ost_type": "opening"
    //         },
    //         {
    //           "index": 1,
    //           "title": "Capsule (カプセル)",
    //           "author": "aiko",
    //           "spotify": null,
    //           "ost_type": "ending"
    //         },
    //         {
    //           "index": 2,
    //           "title": "Apocalypse (アポカリプス)",
    //           "author": "Romi",
    //           "spotify": null,
    //           "ost_type": "ending"
    //         }
    //       ],
    //       "stats": {
    //         "completed": 7135,
    //         "watching": 13027,
    //         "planned": 16419,
    //         "dropped": 1344,
    //         "on_hold": 588,
    //         "score_1": 30,
    //         "score_2": 18,
    //         "score_3": 41,
    //         "score_4": 115,
    //         "score_5": 323,
    //         "score_6": 695,
    //         "score_7": 1949,
    //         "score_8": 2868,
    //         "score_9": 2112,
    //         "score_10": 1265
    //       },
    //       "schedule": [
    //         {
    //           "episode": 1,
    //           "airing_at": 1744043640
    //         },
    //         {
    //           "episode": 2,
    //           "airing_at": 1744734840
    //         },
    //         {
    //           "episode": 3,
    //           "airing_at": 1745339640
    //         },
    //         {
    //           "episode": 4,
    //           "airing_at": 1745944440
    //         },
    //         {
    //           "episode": 5,
    //           "airing_at": 1746549240
    //         },
    //         {
    //           "episode": 6,
    //           "airing_at": 1747154040
    //         },
    //         {
    //           "episode": 7,
    //           "airing_at": 1747758840
    //         },
    //         {
    //           "episode": 8,
    //           "airing_at": 1748363640
    //         },
    //         {
    //           "episode": 9,
    //           "airing_at": 1748968440
    //         },
    //         {
    //           "episode": 10,
    //           "airing_at": 1749573240
    //         },
    //         {
    //           "episode": 11,
    //           "airing_at": 1750178040
    //         },
    //         {
    //           "episode": 12,
    //           "airing_at": 1750782840
    //         }
    //       ],
    //       "translated_ua": true,
    //       "mal_id": 59675
    //     },
    //   }
    // });

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
        <BigBannerWidget animes={animeList_popularity_this_year} />
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
            <OngoingAnimeList />
            <PopularAnimeList />
            <RomanceAnimeList />
            <ActionAnimeList />
            <SciFiAnimeList />
          </View>
        )}
      </ScrollView>
    </DefaultScreenWidget>
  );
}

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
