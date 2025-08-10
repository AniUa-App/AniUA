import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { GetScreenWidth, GetScreenHeight } from "../Global/Functions";
import {
  appColor,
  black,
  white,
  Black,
  White,
  Black_1,
  yellow,
} from "../Styles/Colors";
import { H3, H4, H5 } from "../Styles/Fonts";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import { Image } from "../Widgets/LoadersWidgets";
import AnimeStorage from "../Storage/AnimeStorage";
import { Api } from "../Sources/hikka";
import SettingsStorage from "../Storage/SettingsStorage";
import DubbingBottomSheet from "../Widgets/DubbingBottomSheetWidget";
import MoreBottomSheet from "../Widgets/MoreBottomSheetWidget";
import { $ } from "../Global/Functions";
import { TouchableOpacity } from "../Widgets/Button";
import { CommonActions } from "@react-navigation/native";
import EpisodesBottomSheet, {
  ViewEpisode,
} from "../Widgets/EpisodesBottomSheetWidget";
import { ForwardButton } from "../Widgets/ForwardButtonWidget";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from "react-native-popup-menu";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DownloadVideo } from "../Notifications/VideoDownloader";
import { DEBUGCONFIG } from "../cfgs/DebugConfig";
import SystemNavigationBar from "react-native-system-navigation-bar";
import FileOpener from "../Global/FileOpener";
import AnimeHashStorage from "../Storage/AnimeHashStorage";
import { HikkaApi } from "../Sources/hikka";
import RNFS from "react-native-fs";
import Icon from "../Styles/Icons";
import {
  getFullDubbersListOfQueues,
  playersIcons,
} from "../Widgets/DubbingBottomSheetWidget";
import Toast from "react-native-root-toast";
import ExpandableNotification from "../Widgets/ExpandableNotification";
import Clipboard from "@react-native-clipboard/clipboard";

function getEpisodeDateOrType(anime) {
  if (
    anime.schedule?.length > 0 &&
    anime.episodes_released > 0 &&
    anime.schedule[anime.episodes_released]?.airing_at
  ) {
    const timestamp = anime.schedule[anime.episodes_released].airing_at;
    const date = new Date(timestamp * 1000);
    // Перевіряємо, чи є дата валідною
    return format(date, "d MMMM HH:mm", { locale: uk });
  } else if (anime.status === "finished") {
    return "Завершено";
  } else if (anime.status === "ongoing") {
    return "Онґоінг";
  } else {
    return anime.status;
  }
}
export default function AnimePreviewScreen({ route }) {
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[H3, { color: white }]}>
            Помилка: неправильні параметри навігації
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  // Отримуємо дані з параметрів маршруту
  const { anime: initialAnime, downloadEpisode, slug } = route.params;

  // Перевіряємо, чи є хоча б один з необхідних параметрів
  if (!initialAnime && !slug) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[H3, { color: white }]}>
            Помилка: відсутні необхідні параметри
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  // Стан для зберігання даних аніме
  const [anime, setAnime] = useState(initialAnime || null);
  const [isLoading, setIsLoading] = useState(!initialAnime);

  // Референції для нижніх панелей
  const dubbingSheetRef = useRef(null);
  const episodesSheetRef = useRef(null);
  const downloadEpisodeRef = useRef(null);
  const moreSheetRef = useRef(null);

  // Хук для навігації
  const navigation = useNavigation();

  // Стани
  const [animeList, setAnimeList] = useState([]);
  const [errorCode, setErrorCode] = useState(null);
  const [episodesList, setEpisodesList] = useState([]);
  const [isConnection, setIsConnection] = useState(true);
  const [isVisibleNotification, setIsVisibleNotification] = useState(false);
  // Отримуємо інформацію про аніме з локального сховища
  const [info, setInfo_] = useState(() => {
    if (initialAnime?.slug) {
      return AnimeStorage.getInfoBySlug(initialAnime.slug);
    }
    if (slug) {
      return (
        AnimeStorage.getInfoBySlug(slug) || {
          watched: {
            player: "",
            dubbing: "",
            episodes: [],
          },
          isFavorite: false,
        }
      );
    }
    return null;
  });

  // Ефект для завантаження даних аніме за slug (для deep linking)
  useEffect(() => {
    const fetchAnimeBySlug = async () => {
      if (slug && !initialAnime) {
        console.log(slug, "slug");
        setIsLoading(true);
        try {
          const animeData = await HikkaApi.getAnimeDetails(slug);
          if (animeData) {
            setAnime(animeData);
            const animeInfo = AnimeStorage.getInfoBySlug(slug) || {
              watched: {
                player: "",
                dubbing: "",
                episodes: [],
              },
              isFavorite: false,
            };
            setInfo_(animeInfo);
          }
        } catch (error) {
          console.error("Error fetching anime by slug:", error);
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnimeBySlug();
  }, [slug, initialAnime, navigation]);

  const setInfo = useCallback(
    (newInfo) => {
      if (!anime?.slug) return;
      setInfo_(newInfo);
      AnimeStorage.setInfoBySlug(anime.slug, newInfo);
      console.log("newInfo", newInfo);
    },
    [anime?.slug]
  );

  useEffect(() => {
    if (downloadEpisode) {
      const timer = setTimeout(() => {
        if (downloadEpisodeRef.current) {
          downloadEpisodeRef.current.present();
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [downloadEpisode]);

  useFocusEffect(
    useCallback(() => {
      if (!anime?.slug) return;
      const updatedInfo = AnimeStorage.getInfoBySlug(anime.slug);
      setInfo_((prevInfo) => {
        if (JSON.stringify(prevInfo) !== JSON.stringify(updatedInfo)) {
          return updatedInfo;
        }
        return prevInfo;
      });
    }, [anime?.slug])
  );

  useLayoutEffect(() => {
    if (!anime?.slug) return;
    let isMounted = true;

    const fetchData = async () => {
      try {
        const fetchDetailsIfNeeded = async () => {
          if (AnimeHashStorage.isHash(anime.slug) && isConnection) {
            setAnime(AnimeHashStorage.getHashBySlug(anime.slug));
            return;
          }
          if (!anime.synopsis_ua) {
            try {
              const details = await HikkaApi.getAnimeDetails(anime.slug);
              if (isMounted) {
                setAnime((prevAnime) => ({ ...prevAnime, ...details }));
                AnimeHashStorage.addHash(anime.slug, {
                  ...anime,
                  ...details,
                });
              }
            } catch (error) {
              console.error("Error fetching anime details:", error);
            }
          }
          return null;
        };

        const fetchFranchise = async () => {
          try {
            const data = await HikkaApi.getAnimeFranchiseByFilter(anime.slug);
            if (isMounted) {
              setAnimeList(Array.isArray(data) ? data : []);
            }
          } catch (error) {
            console.log(
              `Помилка при завантаженні франшизи для ${anime.slug}:`,
              error?.message || String(error)
            );
            if (isMounted) setAnimeList([]);
          }
        };

        const fetchEpisodesAndDubbings = async () => {
          if (
            (anime.episodes_total !== null && anime.episodes_total !== 0) ||
            (anime.episodes_released !== null && anime.episodes_released !== 0)
          ) {
            try {
              let currentInfo = info;
              const result = await HikkaApi.getEpisodes(anime.slug);

              if (!isMounted) return;

              // Перевіряємо наявність помилки
              if (result.error) {
                console.log("API Error:", result.error);
                setErrorCode(result.code || 500);
                setEpisodesList({});
                return;
              }

              const { data, code } = result;

              if (code >= 400) {
                console.log("API Error Code:", code);
                setErrorCode(code);
                setEpisodesList({});
                return;
              }
              if (data["vidsrc"]) {
                delete data["vidsrc"];
              }
              data["Вбудований плеєр"] = getFullDubbersListOfQueues(data);

              let infoNeedsUpdate = false;
              let newInfo = { ...currentInfo };

              if (!newInfo.watched?.player || !newInfo.watched?.dubbing) {
                for (const [key, value] of Object.entries(data)) {
                  if (
                    key !== "type" &&
                    key !== "0" &&
                    Object.keys(value).length > 0
                  ) {
                    newInfo.watched = {
                      ...newInfo.watched,
                      player: data[
                        SettingsStorage.getParameter("defaultPlayer")
                      ]
                        ? SettingsStorage.getParameter("defaultPlayer")
                        : key,
                      dubbing: Object.keys(value)[0],
                      episodes: newInfo.watched?.episodes || [],
                    };
                    infoNeedsUpdate = true;
                    break;
                  }
                }
              }

              setEpisodesList(data);

              if (infoNeedsUpdate) {
                setInfo(newInfo);
              }
            } catch (error) {
              console.error("Помилка завантаження епізодів:", error);
              if (isMounted) {
                setEpisodesList({});
                setErrorCode(500);
              }
            }
          } else {
            if (isMounted) setEpisodesList({});
          }
        };

        console.log(route.params, "params");

        await Promise.all([
          fetchDetailsIfNeeded(),
          fetchFranchise(),
          fetchEpisodesAndDubbings(),
        ]);
      } catch (error) {
        console.error("Error fetching data in parallel:", error);
      } finally {
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    anime?.slug,
    anime?.synopsis_ua,
    anime?.episodes_total,
    anime?.episodes_released,
    info,
    setInfo,
    isConnection,
  ]);

  const renderSimilarAnime = useCallback(
    ({ item }) => {
      if (
        !item?.slug ||
        !initialAnime?.slug ||
        item.slug === initialAnime.slug
      ) {
        return null;
      }
      return (
        <TouchableOpacity
          key={item.slug}
          style={styles.similarCard}
          onPress={() =>
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: "MainTabs" },
                  {
                    name: "HiddenStack",
                    params: {
                      screen: "AnimePreview",
                      params: { anime: item },
                    },
                  },
                ],
              })
            )
          }
        >
          <Image style={styles.similarImage} uri={item.image} />
        </TouchableOpacity>
      );
    },
    [navigation, initialAnime?.slug]
  );

  const keyExtractorSimilar = useCallback((item) => item?.slug || "", []);

  if (isLoading) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={appColor} />
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!anime) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[H3, { color: white }]}>Аніме не знайдено</Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isConnection={setIsConnection}>
      <ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <ExpandableNotification
          visible={isVisibleNotification}
          message={"Посилання скопійовано"}
          onHide={() => {
            setIsVisibleNotification(false);
          }}
        />
        {/* Верхній блок з "постером" */}
        <View style={styles.posterContainer}>
          <Image style={styles.posterImage} uri={anime?.image} />
          {/* Напівпрозорий затемнений блок зверху */}
          <View style={styles.overlay} />

          {/* Кнопка "Назад" або іконка (за потреби) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon.ArrowLeft size={35} color={appColor} />
          </TouchableOpacity>

          {/* Оцінка та зірочка у верхньому правому куті */}
          <View style={styles.ratingContainer}>
            <Text style={[H3, { color: appColor, marginRight: 10 }]}>
              {anime?.score || 0}
            </Text>
            <Icon.Star size={30} color={yellow} />
          </View>

          {/* Кнопка "Дивитися трейлер" посередині */}
          {anime?.videos?.find((v) => v.video_type === "video_promo")?.url && (
            <TouchableOpacity
              style={styles.playTrailerBtn}
              onPress={() =>
                Linking.openURL(
                  anime.videos.find((v) => v.video_type === "video_promo")?.url
                )
              }
            >
              {/* <PlayIcon fill={appColor} /> */}
              <Icon.PlayCircle size={34} color={appColor} />
              <Text style={[H4, { marginLeft: 10 }]}>Дивитися трейлер</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Тіло з назвою, жанрами та описом */}
        <View style={styles.contentContainer}>
          <ForwardButton
            navigation={navigation}
            anime={anime}
            errorCode={errorCode}
            episodesList={episodesList}
            style={[styles.continueWatchingBtn, { marginBottom: 18 }]}
            data={info}
            onDataChange={(newData) => setInfo(newData)}
          />

          {/* Вибір дубляжу */}
          <View
            style={{
              flexDirection: "row",
              marginBottom: 6,
              marginLeft: "2%",
            }}
          >
            {info?.watched && (
              <>
                <Text style={[H3, { color: white }]}>Дубляж:</Text>
                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    if (dubbingSheetRef.current) {
                      dubbingSheetRef.current?.present();
                    }
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      H3,
                      {
                        color: appColor,
                        paddingRight: 3,
                      },
                    ]}
                  >
                    {(info?.watched?.dubbing || "Вибрати дубляж").slice(0, 15)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: info?.watched?.player ? 30 : 0,
                      height: info?.watched?.player ? 30 : 0,
                    }}
                  >
                    {playersIcons[info?.watched?.player]}
                  </View>
                  <Icon.CaretDown
                    size={30}
                    color={white}
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Рядок з кнопками дій (епізоди, вподобати, завантажити, більше) */}
          <View style={styles.actionsRow}>
            {episodesList.length === 0 ? (
              <>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.actionButton]}
                >
                  {/* <EpisodesIcon style={{ marginLeft: 2, position: 'relative' }} /> */}
                  <Icon.Queue size={34} color={white} />
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: Black(0.7),
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton]}
                  onPress={() => {
                    if (episodesSheetRef.current) {
                      episodesSheetRef.current?.present();
                    }
                  }}
                >
                  {/* <EpisodesIcon style={{marginLeft: 2}} /> */}
                  <Icon.Queue size={34} color={white} />
                </TouchableOpacity>
              </>
            )}

            {/* Кнопка додавання/видалення з улюблених */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                AnimeStorage.setInfoBySlug(anime.slug, {
                  isFavorite: !(info?.isFavorite || false),
                  watched: info?.watched || { player: "", dubbing: "" },
                });
                setInfo(AnimeStorage.getInfoBySlug(anime.slug));
              }}
            >
              {/* <LikeIcon fill={info.isFavorite ? appColor : white} /> */}
              <Icon.Heart
                size={34}
                color={info.isFavorite ? appColor : white}
              />
            </TouchableOpacity>

            {episodesList.length === 0 ? (
              <>
                {/* Неактивна кнопка завантаження, якщо немає епізодів */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.actionButton]}
                >
                  {/* <DownloadIcon_
                    style={{marginLeft: 2, position: 'relative'}}
                  /> */}
                  <Icon.DownloadSimple size={34} color={white} />
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: Black(0.7),
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Активна кнопка завантаження */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (downloadEpisodeRef.current) {
                      downloadEpisodeRef.current?.present();
                    }
                  }}
                >
                  {/* <DownloadIcon_ style={{marginLeft: 2}} /> */}
                  <Icon.DownloadSimple size={34} color={white} />
                </TouchableOpacity>
              </>
            )}
            {/* Кнопка "Більше" */}
            {/* <Menu>
              <MenuTrigger> */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (moreSheetRef.current) {
                  moreSheetRef.current?.present();
                }
              }}
            >
              {/* <MoreIcon /> */}
              <Icon.DotsThreeVertical size={34} color={white} />
            </TouchableOpacity>
            {/* </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() => alert('Редактировать')}
                  text="Редактировать"
                />
                <MenuOption onSelect={() => alert('Удалить')} text="Удалить" />
              </MenuOptions>
            </Menu> */}
          </View>
          {/* Рік, кількість епізодів, назва та обмеження за віком */}
          <View style={styles.headerRow}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: "10%",
                width: "80%",
              }}
            >
              {(() => {
                if (
                  anime.episodes_total !== null &&
                  anime.episodes_released !== null &&
                  anime.episodes_total === anime.episodes_released
                ) {
                  // Якщо всі епізоди вийшли
                  return (
                    <Text style={[H5, styles.yearEpisodes]}>
                      {anime.year} | {anime.episodes_released}
                    </Text>
                  );
                } else if (
                  anime.episodes_total !== null &&
                  anime.episodes_released !== null &&
                  anime.episodes_total !== anime.episodes_released
                ) {
                  // Якщо вийшли не всі епізоди
                  return (
                    <Text style={[H5, styles.yearEpisodes]}>
                      {anime.year} |{" "}
                      {anime.episodes_released + " з " + anime.episodes_total}
                    </Text>
                  );
                }
              })()}
              <Text style={[H5, styles.yearEpisodes, { color: appColor }]}>
                {getEpisodeDateOrType(anime)}
              </Text>
            </View>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  H3,
                  { fontWeight: "bold", width: "90%", flexWrap: "wrap" },
                ]}
              >
                {anime.title_ua}
              </Text>
              {/* Відображення вікового обмеження */}
              <Text style={[H3, { color: appColor }]}>
                {anime.rating === "g"
                  ? "0+"
                  : anime.rating === "pg"
                    ? "6+"
                    : anime.rating === "pg_13"
                      ? "13+"
                      : anime.rating === "r"
                        ? "16+"
                        : "18+"}
              </Text>
            </View>
          </View>

          {/* Жанри/мітки */}
          <View style={styles.tagsRow}>
            <Text style={[H4, styles.tagItem]}>
              {anime.genres && anime.genres.length > 0
                ? anime.genres.map((genre) => genre.name_ua).join(", ")
                : ""}
            </Text>
          </View>

          {/* Опис аніме */}
          <Text style={[H4, { marginBottom: anime?.synopsis_ua ? 25 : 0 }]}>
            {anime?.synopsis_ua ? (
              <Markdown
                style={{
                  body: [
                    H4,
                    {
                      marginBottom: anime?.synopsis_ua ? 25 : 0,
                    },
                  ],
                  link: [
                    H4,
                    {
                      marginBottom: anime?.synopsis_ua ? 25 : 0,
                      color: appColor,
                      textDecorationLine: "underline",
                    },
                  ],
                }}
              >
                {anime?.synopsis_ua}
              </Markdown>
            ) : null}
          </Text>

          {/* Секція схожих аніме */}
          {animeList.length > 0 ? (
            <>
              <Text style={[H4, { color: appColor, marginBottom: 10 }]}>
                Схожі Відтворення
              </Text>
              <FlatList
                horizontal={true}
                data={animeList}
                renderItem={renderSimilarAnime}
                keyExtractor={keyExtractorSimilar}
                showsHorizontalScrollIndicator={false}
                style={styles.similarContainer}
                contentContainerStyle={{ paddingRight: 16 }}
                initialNumToRender={3}
                windowSize={5}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
      {/* Нижня панель для вибору дубляжу */}
      {info?.watched?.dubbing &&
      info?.watched?.player &&
      episodesList &&
      Object.keys(episodesList).length > 0 ? (
        <>
          <DubbingBottomSheetMemo
            sheetRef={dubbingSheetRef}
            episodesList={episodesList}
            storage_data={info}
            isChanges={setInfo}
          />

          <EpisodesBottomSheetMemo
            sheetRef={episodesSheetRef}
            episodesList={episodesList}
            storage_data={info}
            type="list"
            isChanges={setInfo}
            onSelectEpisode={(item) => {
              const watched_episodes = !info.watched.episodes.includes(
                item.episode
              )
                ? [...info.watched.episodes, item.episode]
                : info.watched.episodes;
              setInfo({
                ...info,
                watched: { ...info.watched, episodes: watched_episodes },
              });
              // SystemNavigationBar.navigationHide();
              SystemNavigationBar.navigationHide();
              episodesSheetRef.current?.close();

              console.log(info.watched.player, "player");

              if (info.watched.player === "Вбудований плеєр") {
                navigation.navigate("HiddenStack", {
                  screen: "LocalVideoPlayer",
                  params: {
                    _episodes:
                      episodesList[info.watched.player][info.watched.dubbing],
                    _currentEpisode: item,
                    _anime: anime,
                  },
                });
              } else {
                navigation.navigate("HiddenStack", {
                  screen: "WebVideoPlayer",
                  params: {
                    videoUrl: item?.video_url,
                    title: `${anime?.title_ua} - ${item?.episode} серія`,
                  },
                });
              }
            }}
            onLongSelectEpisode={(item) => {
              const episodes = info.watched.episodes.includes(item.episode)
                ? info.watched.episodes.filter((ep) => ep !== item.episode)
                : [...info.watched.episodes, item.episode];
              const newInfo = {
                ...info,
                watched: { ...info.watched, episodes },
              };
              setInfo(newInfo);
            }}
            onSwipeEpisode={(item) => {
              episodesSheetRef.current?.close();
              Clipboard.setString(item?.video_url);
              setIsVisibleNotification(true);
            }}
            checkForStyle={(item) =>
              info.watched.episodes.includes(item.episode)
            }
          />

          <EpisodesBottomSheetMemo
            sheetRef={downloadEpisodeRef}
            episodesList={episodesList}
            storage_data={info}
            type="download"
            isChanges={null}
            checkForStyle={(item) => {
              if (!info.downloaded?.episodes) return false;

              const episode = info.downloaded.episodes.find(
                (ep) => ep.episode === item.episode
              );

              return (
                episode &&
                episode.video_path &&
                typeof episode.video_path === "string"
              );
            }}
            onSelectEpisode={async function (item) {
              // Асинхронна функція для обробки вибору епізоду
              try {
                // Знаходимо епізод у списку завантажених
                const episode = info.downloaded?.episodes?.find(
                  (ep) => ep.episode === item.episode
                );

                // Перевіряємо чи існує episode і чи є валідний video_path

                if (
                  episode &&
                  episode.video_path &&
                  (await RNFS.exists(episode.video_path))
                ) {
                  console.log(episode.video_path, "episode.video_path");
                  try {
                    await FileOpener.openFile(episode.video_path, "video/*");
                    console.log("Діалог вибору відкрито");
                  } catch (error) {
                    console.error("Помилка при відкритті файлу:", error);
                  }
                } else {
                  // Видаляємо запис, якщо файл не існує
                  if (episode) {
                    setInfo({
                      ...info,
                      downloaded: {
                        ...info.downloaded,
                        episodes: info.downloaded.episodes.filter(
                          (ep) => ep.episode !== item.episode
                        ),
                      },
                    });
                  }

                  // Завантажуємо відео
                  await DownloadVideo(
                    item,
                    anime,
                    info,
                    (progressCallback) =>
                      DEBUGCONFIG.isdebug &&
                      console.log("progressCallback", progressCallback),
                    (completionCallback) => {
                      console.log("completionCallback", completionCallback);
                      setInfo(completionCallback);
                    }
                  );
                }
              } catch (err) {
                console.error("Помилка при обробці епізоду:", err);
                // Додаткова інформація для дебагу
                console.log("Item object:", item);
                console.log("Episode info:", info.downloaded?.episodes);
              }
            }}
          />
        </>
      ) : null}

      <MoreBottomSheetMemo sheetRef={moreSheetRef} anime={anime} />
    </DefaultScreenWidget>
  );
}

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: black,
  },
  continueWatchingBtn: {
    backgroundColor: appColor,
    borderRadius: 8,
    padding: 10,
    margin: "15px",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  posterContainer: {
    position: "relative",
    width: "100%",
    height: GetScreenHeight() * 0.7, // пропорція висоти для постера
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    position: "absolute",
    top: 40, // орієнтовно під статус-бар
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  ratingContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#fff",
    fontSize: 18,
    marginRight: 4,
  },
  playTrailerBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 40,
    left: 20,
    backgroundColor: Black(0.5),
    padding: 10,
    borderRadius: 8,
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 8,
  },
  yearEpisodes: {
    color: "#888",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  ageLimitContainer: {
    backgroundColor: "#333",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ageLimitText: {
    color: "#fff",
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagItem: {
    color: appColor,
    marginRight: 8,
    marginBottom: 4,
  },
  descriptionText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  actionsRow: {
    marginTop: 9,
    gap: "14%",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionButton: {
    width: 44,
    height: 44,
    backgroundColor: Black_1(),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 4,
  },
  similarTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  similarContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  similarCard: {
    marginRight: 16,
  },
  similarImage: {
    width: GetScreenWidth() * 0.5,
    height: GetScreenHeight() * 0.38, // пропорція висоти для постера
    borderRadius: 4,
    marginBottom: 4,
  },
  similarText: {
    color: "#ccc",
    fontSize: 12,
  },
});
