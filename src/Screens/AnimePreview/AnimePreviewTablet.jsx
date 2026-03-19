import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import Clipboard from "@react-native-clipboard/clipboard";
import { useWindowDimensions } from "react-native";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import { ViewEpisode } from "../../Widgets/ForwardButtonWidget";
import AnimeStatusFAB from "../../Widgets/AnimeStatusFAB";
import BloomImage from "../../Widgets/BloomImage";
import { AnimeListHorizontal } from "../../Widgets/AnimeListHorizontalWidget";
import Icon from "../../Styles/Icons";
import { H2, H3, H4, H5 } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import { playersIcons } from "../../Widgets/DubbingBottomSheetWidget";
import WatchButton, { WatchButtonState } from "../../Components/WatchButton";
import YouTubeVideos from "../../Components/YouTubeVideos";
import MusicOST from "../../Components/MusicOST";
import CharacterCard from "../../Components/CharacterCard";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";
import {
  useAnimePreview,
  DubbingBottomSheet,
  EpisodesBottomSheet,
  MoreBottomSheet,
  NewEpisodesBottomSheet,
} from "./shared";
import AnimeCard from "../../Components/AnimeCard";
import BottomSheetDownload from "../../Components/BottomSheetDownload";
import CommentsSection from "../../Components/CommentsSection";
import { tabletStyles as styles } from "../../Styles/components/Screens/AnimePreviewBaseStyles";
import { useIsTabletLandscape } from "../../Styles/Responsive";
import { ErrorScreen } from "../ErrorScreen";

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);
const NewEpisodesBottomSheetMemo = React.memo(NewEpisodesBottomSheet);

// --- COPIED COMPONENTS FROM PHONE ---

// Info row component
const InfoRow = ({ icon, label, value, themeColors }) => (
  <View
    style={[
      { flexDirection: "row", alignItems: "center", marginBottom: 8 },
      // Mimicking styles.infoRow from Phone, but inline or via styles
    ]}
  >
    <View
      style={[
        {
          padding: 4,
          backgroundColor: themeColors.primary,
          borderRadius: 16,
          marginRight: 8,
        },
      ]}
    >
      {icon}
    </View>
    <Text
      selectable={true}
      style={[H5, { color: themeColors.text, marginRight: 6 }]}
    >
      {label}:
    </Text>
    <Text
      selectable={true}
      style={[H5, { color: themeColors.primary, flex: 1 }]}
    >
      {value}
    </Text>
  </View>
);

// Genre tag component
const GenreTag = ({ name, themeColors }) => (
  <View style={[{ borderColor: themeColors.primary, padding: 4 }]}>
    <Text selectable={true} style={[H5, { color: themeColors.primary }]}>
      {name}
    </Text>
  </View>
);

// Star rating component
const StarRating = ({ rating = 0, onRate, themeColors }) => {
  const isTabletLandscape = useIsTabletLandscape();
  const stars = !isTabletLandscape
    ? [2, 4, 6, 8, 10]
    : [...Array(10).keys()].map((i) => i + 1);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          backgroundColor: themeColors.subtle,
          padding: 16,
          borderRadius: 16,
          flex: 1,
          gap: 10,
          justifyContent: "space-between",
          width: "100%",
        },
      ]}
    >
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          style={{}}
          onPress={() => onRate && onRate(star)}
        >
          <Icon.Star
            size={32}
            color={
              star <= rating ? themeColors.activeIcon : themeColors.inActiveText
            }
            weight={star <= rating ? "fill" : "regular"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Section tabs component
const SectionTabs = ({ tabs, defaultTab, onTabChange, themeColors }) => {
  const filteredTabs = tabs.filter(Boolean);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const tabExists = filteredTabs.some((tab) => tab.key === activeTab);
    if (filteredTabs.length > 0 && !tabExists) {
      setActiveTab(defaultTab || filteredTabs[0]?.key);
    }
  }, [filteredTabs, defaultTab, activeTab]);

  const handleTabChange = useCallback(
    (key) => {
      setActiveTab(key);
      onTabChange?.(key);
    },
    [onTabChange],
  );

  const activeContent = filteredTabs.find(
    (tab) => tab.key === activeTab,
  )?.content;

  if (filteredTabs.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 16 }}>
      {/* Tab buttons */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                {
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: isActive
                    ? themeColors.activeIcon
                    : themeColors.subtle,
                },
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
                selectable={true}
                style={[
                  H5,
                  {
                    color: themeColors.text,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      {activeContent && <View style={{}}>{activeContent}</View>}
    </View>
  );
};

export default function AnimePreviewTablet({ route }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [firstTabs, setFirstTabs] = useState([]);
  const [titleContainerWidth, setTitleContainerWidth] = useState(null);
  const insets = useContext(SafeAreaInsetsContext);

  const {
    anime,
    isLoading,
    existingFiles,
    animeList,
    charactersList,
    errorCode,
    episodesList,
    setIsConnection,
    watchStatus,
    isFavoriteHikka,
    userScore,
    info,
    setInfo,
    winWidth,
    winHeight,
    initialAnime,
    slug,
    snackbar,
    showSnackbar,
    dubbingSheetRef,
    episodesSheetRef,
    downloadEpisodeRef,
    moreSheetRef,
    newEpisodesSheetRef,
    handleStatusChange,
    handleFavoriteToggle,
    handleRateAnime,
    handleEpisodeSelect,
    handleEpisodeLongSelect,
    handleEpisodeSwipe,
    handleDownloadEpisode,
    handleNewEpisodeSelect,
    handleNewTeamChange,
    handleBuiltInPlayerToggle,
    keyExtractorSimilar,
  } = useAnimePreview({ route, navigation });

  // Ref for new download bottom sheet
  const newDownloadSheetRef = useRef(null);

  // Get age rating text
  const getAgeRating = (rating) => {
    switch (rating) {
      case "g":
        return "0+";
      case "pg":
        return "6+";
      case "pg_13":
        return "13+";
      case "r":
        return "16+";
      default:
        return "18+";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case "finished":
        return "Завершено";
      case "ongoing":
        return "Онґоінг";
      case "announced":
        return "Анонс";
      default:
        return status || "Невідомо";
    }
  };

  // Reset title width when anime changes (Logic from Phone, kept for safety)
  useEffect(() => {
    const getTabs = () => {
      const _tabs = [];
      if (
        anime?.videos?.length > 0 &&
        anime?.videos.every((video) => video.url != null)
      ) {
        _tabs.push({
          key: "videos",
          label: "Відео",
          content: <YouTubeVideos videos={anime?.videos} />,
        });
      }
      if (
        anime?.ost?.length > 0 &&
        anime?.ost.every((ost) => ost.url != null)
      ) {
        _tabs.push({
          key: "music",
          label: "Музика",
          content: <MusicOST ost={anime?.ost} />,
        });
      }
      setFirstTabs(_tabs);
    };
    getTabs();
  }, [anime?.slug, anime?.videos, anime?.ost]);

  // Reset title width when anime changes (Logic from Phone)
  useEffect(() => {
    setTitleContainerWidth(null);
  }, [anime?.slug]);

  // Handle title text layout to dynamically center (Logic from Phone)
  const handleTitleLayout = useCallback((e) => {
    const lines = e.nativeEvent.lines;
    if (lines && lines.length > 0) {
      const maxLineWidth = Math.max(...lines.map((line) => line.width));
      setTitleContainerWidth(Math.ceil(maxLineWidth) + 4); // +4 for safety margin
    }
  }, []);

  const handleWatchPress = useCallback(() => {
    newEpisodesSheetRef.current?.open();
  }, [newEpisodesSheetRef]);

  const handleDownloadPress = useCallback(() => {
    if (anime?.slug) {
      newDownloadSheetRef.current?.open();
    }
  }, [anime?.slug]);

  // These callbacks must be defined before any early returns to avoid hooks order violation
  const renderCharacter = useCallback(
    ({ item }) => (
      <CharacterCard
        item={item}
        width={winWidth * 0.1} // Adjusted for tablet
        height={winHeight * 0.26}
      />
    ),
    [winWidth, winHeight],
  );

  const keyExtractorCharacter = useCallback(
    (item) => item?.character?.slug || "",
    [],
  );
  // Get watch button text
  const getWatchButtonText = () => {
    if ((errorCode && errorCode !== 404) || isLoading || !episodesList) {
      return WatchButtonState.LOADING;
    } else if (info?.watched_episodes > 0) {
      return WatchButtonState.CONTINUE_WATCHING;
    } else if (errorCode === 404) {
      return WatchButtonState.NO_TRANSLATION;
    } else {
      return WatchButtonState.START_WATCHING;
    }
  };

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
        <AnimeCard
          key={item.slug}
          anime={item}
          width={winWidth * 0.18} // Adjusted for tablet
          showDetails={true}
          onPress={() => navigation.replace("AnimePreview", { anime: item })}
        />
      );
    },
    [initialAnime?.slug, navigation, winWidth, winHeight],
  );

  const landscapePosterHeight = Math.max(300, winHeight * 0.7); // Slightly bigger for tablet

  // Error states
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text selectable={true} style={[H3, { color: themeColors.text }]}>
            Помилка: неправильні параметри навігації
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!initialAnime && !slug) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text selectable={true} style={[H3, { color: themeColors.text }]}>
            Помилка: відсутні необхідні параметри
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  if (isLoading) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </DefaultScreenWidget>
    );
  }

  if (errorCode && errorCode !== 404) {
    return (
      <ErrorScreen
        title="Помилка"
        message={`Не вдалося завантажити дані. Код помилки: ${errorCode}`}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  if (!anime) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text selectable={true} style={[H3, { color: themeColors.text }]}>
            Аніме не знайдено
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isConnection={setIsConnection}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* --- LEFT PANEL --- */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top section: poster + title + watch button — with background image */}
          <View style={{ overflow: "hidden" }}>
            {/* Background image with gradient fade */}
            <Image uri={anime.image} style={[StyleSheet.absoluteFill, { opacity: 0.45 }]} />
            <LinearGradient
              colors={["transparent", themeColors.Background?.(1) ?? themeColors.background]}
              locations={[0, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

          {/* Poster with bloom effect */}
          <View
            style={{
              position: "relative",
              width: "100%",
              alignItems: "center",
              marginTop: insets.top,
            }}
          >
            <BloomImage
              uri={anime.image}
              width={winWidth * 0.28}
              height={landscapePosterHeight}
              borderRadius={16}
              blurRadius={10}
              glowScale={1}
              fadePercent={0.15}
            />

            {/* Back button */}
            <TouchableOpacity
              style={[
                {
                  position: "absolute",
                  top: 16,
                  left: 16,
                  padding: 4,
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: themeColors.subtle,
                },
              ]}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate("MainTabs", { screen: "Home" });
                }
              }}
            >
              <Icon.ArrowLeft size={32} color={themeColors.primary} />
            </TouchableOpacity>

            {/* More button */}
            <TouchableOpacity
              style={[
                {
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: 4,
                  borderRadius: 16,
                  backgroundColor: themeColors.subtle,
                },
              ]}
              onPress={() => moreSheetRef.current?.present()}
            >
              <Icon.DotsThreeVertical size={32} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
          {/* Title section - Logic transferred from Phone */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: "100%",
              top: -16, // Proximity to poster
            }}
          >
            <View
              style={[
                {
                  flexDirection: "column",
                  alignItems: "flex-start",
                  maxWidth: "95%",
                },
                titleContainerWidth && { width: titleContainerWidth },
              ]}
            >
              <Text
                selectable={true}
                style={[H3, { color: themeColors.text }]}
                numberOfLines={2}
                onTextLayout={handleTitleLayout}
                onLongPress={() =>
                  anime.title_ua && Clipboard.setString(anime.title_ua)
                }
              >
                {anime.title_ua || anime.title_en || anime.title_ja}
                {anime.year ? ` (${anime.year})` : ""}
              </Text>
              <View style={{ marginTop: 2 }}>
                <Text
                  selectable={true}
                  style={[
                    H5,
                    {
                      color: themeColors.Text(0.6),
                    },
                  ]}
                >
                  {anime.title_en || anime.title_ja || ""}
                </Text>
              </View>
            </View>
          </View>
          {/* Primary action buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginHorizontal: 16,
              flex: 1,
            }}
          >
            <WatchButton
              label={getWatchButtonText()}
              style={{ width: "80%" }}
              onWatchPress={handleWatchPress}
              onDownloadPress={handleDownloadPress}
              isDownloadable={Object.keys(episodesList || {}).length > 0}
              isActive={Object.keys(episodesList || {}).length > 0}
            />

            {/* Favorite button */}
            <TouchableOpacity
              style={[
                {
                  width: 44,
                  height: 44,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: themeColors.subtle,
                },
              ]}
              onPress={handleFavoriteToggle}
            >
              {(
                HikkaAuthService.isAuthenticated()
                  ? isFavoriteHikka
                  : info?.isFavorite
              ) ? (
                <Icon.Heart
                  size={24}
                  color={themeColors.primary}
                  weight="fill"
                />
              ) : (
                <Icon.Heart size={24} color={themeColors.text} />
              )}
            </TouchableOpacity>
          </View>
          </View>{/* end top background wrapper */}

          {/* Info section */}
          <View
            style={[
              {
                backgroundColor: themeColors.subtle,
                padding: 16,
                margin: 16,
                borderRadius: 16,
              },
            ]}
          >
            {/* Genre tags */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={[
                  {
                    padding: 4,
                    backgroundColor: themeColors.primary,
                    borderRadius: 16,
                    marginRight: 8,
                  },
                ]}
              >
                <Icon.Hash size={24} color={themeColors.inActiveIcon} />
              </View>
              {anime.genres?.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {anime.genres.slice(0, 3).map((genre, index) => (
                    <React.Fragment key={genre.name_ua}>
                      <Text
                        selectable={true}
                        style={[H5, { color: themeColors.primary }]}
                      >
                        {genre.name_ua}
                      </Text>
                      {index < anime.genres.slice(0, 3).length - 1 && (
                        <Text
                          selectable={true}
                          style={[H5, { color: themeColors.primary }]}
                        >
                          ,{"\t"}
                        </Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>

            <InfoRow
              icon={
                <Icon.CircleDashed size={24} color={themeColors.inActiveIcon} />
              }
              label="Статус"
              value={getStatusText(anime.status)}
              themeColors={themeColors}
            />

            {(anime.episodes_released !== null ||
              anime.episodes_total !== null) && (
              <InfoRow
                icon={
                  <Icon.MonitorPlay
                    size={24}
                    color={themeColors.inActiveIcon}
                  />
                }
                label="Вийшло"
                value={
                  anime.episodes_total === anime.episodes_released
                    ? `${anime.episodes_released || 0} серій${anime.duration ? `, трив. ~${anime.duration} хв` : ""}`
                    : `${anime.episodes_released || 0} з ${anime.episodes_total || "?"}, трив. ~${anime.duration || 24} хв`
                }
                themeColors={themeColors}
              />
            )}

            <InfoRow
              icon={
                <Icon.SealWarning size={24} color={themeColors.inActiveIcon} />
              }
              label="Віковий рейтинг"
              value={getAgeRating(anime.rating)}
              themeColors={themeColors}
            />

            {anime.score > 0 && (
              <InfoRow
                icon={<Icon.Star size={24} color={themeColors.inActiveIcon} />}
                label="Рейтинг Hikka"
                value={anime.score?.toFixed(1) || "N/A"}
                themeColors={themeColors}
              />
            )}
          </View>
        </ScrollView>

        {/* --- RIGHT PANEL --- */}
        <View style={{ width: "60%", padding: 16 }}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {/* Section Tabs (Videos, Music) */}
            <SectionTabs
              tabs={firstTabs}
              defaultTab={firstTabs[0]?.key}
              themeColors={themeColors}
            />

            {/* Description */}
            <View style={{ marginVertical: 16 }}>
              <Markdown
                style={{
                  body: [H5, { color: themeColors.text, lineHeight: 22 }],
                  link: [
                    H5,
                    {
                      color: themeColors.primary,
                      textDecorationLine: "underline",
                    },
                  ],
                }}
              >
                {(
                  anime?.synopsis_ua ||
                  anime?.synopsis_en ||
                  "Опис відсутній"
                ).replaceAll("hikka.io", "aniua.yuzka.site")}
              </Markdown>
            </View>
            {/* Rating section */}
            <View
              style={{
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                selectable={true}
                style={[
                  H4,
                  ,
                  {
                    color: themeColors.primary,
                    marginBottom: 14,
                    width: "100%",
                    textAlign: "left",
                  },
                ]}
              >
                Оцінити аніме
              </Text>
              <StarRating
                rating={userScore}
                onRate={handleRateAnime}
                themeColors={themeColors}
              />
            </View>

            {/* Similar anime and Characters tabs */}
            {(animeList.length > 0 || charactersList.length > 0) && (
              <SectionTabs
                tabs={[
                  animeList.length > 0 && {
                    key: "similar",
                    label: "Пов'язані",
                    content: (
                      <AnimeListHorizontal
                        animeList={animeList}
                        title=""
                        onClickMore={null}
                        navigation={navigation}
                      />
                    ),
                  },
                  charactersList.length > 0 && {
                    key: "characters",
                    label: "Герої",
                    content: (
                      <FlatList
                        horizontal
                        data={charactersList}
                        renderItem={renderCharacter}
                        keyExtractor={keyExtractorCharacter}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 16 }}
                        initialNumToRender={5}
                        windowSize={7}
                      />
                    ),
                  },
                ]}
                defaultTab={
                  animeList.length > 0
                    ? "similar"
                    : charactersList.length > 0
                      ? "characters"
                      : null
                }
                themeColors={themeColors}
              />
            )}

            {/* Comments Section Standalone in SectionTabs style */}
            {anime?.slug && (
              <SectionTabs
                tabs={[
                  {
                    key: "comments",
                    label: "Коментарі",
                    content: <CommentsSection slug={anime.slug} />,
                  },
                ]}
                defaultTab="comments"
                themeColors={themeColors}
              />
            )}
          </ScrollView>
        </View>
      </View>

      {/* Bottom sheets */}
      {info?.watched?.dubbing &&
        info?.watched?.player &&
        episodesList &&
        Object.keys(episodesList).length > 0 && (
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
              storage_data={{ ...info, slug: anime?.slug }}
              type="list"
              isChanges={setInfo}
              customIcon={null}
              onSelectEpisode={handleEpisodeSelect}
              onLongSelectEpisode={handleEpisodeLongSelect}
              onSwipeEpisode={handleEpisodeSwipe}
              checkForStyle={(item) =>
                (info.watched_episodes || []).includes(item.episode)
              }
            />
          </>
        )}

      {anime?.slug && (
        <NewEpisodesBottomSheetMemo
          ref={newEpisodesSheetRef}
          anime={anime}
          currentEpisode={
            info?.watched_episodes?.[info?.watched_episodes?.length - 1]
          }
          currentTeam={info?.dub_team}
          useBuiltInPlayer={info?.useBuiltIn ?? false}
          watchedEpisodes={info?.watched_episodes || []}
          onSelectEpisode={handleNewEpisodeSelect}
          onTeamChange={handleNewTeamChange}
          onBuiltInPlayerToggle={handleBuiltInPlayerToggle}
        />
      )}

      {/* New Download Bottom Sheet */}
      {anime?.slug && (
        <BottomSheetDownload
          ref={newDownloadSheetRef}
          slug={anime.slug}
          anime={anime}
          info={info}
          onInfoChange={setInfo}
          onDownloadComplete={(episode) => {
            showSnackbar(`Завантаження епізоду ${episode.episode} завершено`, {
              duration: 3000,
            });
          }}
          onDownloadError={(error, episode) => {
            showSnackbar(`Помилка завантаження епізоду ${episode.episode}`, {
              duration: 5000,
            });
          }}
        />
      )}

      {snackbar}
      <MoreBottomSheetMemo sheetRef={moreSheetRef} anime={anime} />

      <AnimeStatusFAB
        currentStatus={watchStatus}
        onStatusChange={handleStatusChange}
      />
    </DefaultScreenWidget>
  );
}
