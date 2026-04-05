import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  findNodeHandle,
  BackHandler,
  StyleSheet,
  TVFocusGuideView as RNTVFocusGuideView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const TVFocusGuideView = RNTVFocusGuideView || View;
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";

import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import WatchButton, { WatchButtonState } from "../../Components/WatchButton";
import AnimeStatusFAB from "../../Widgets/AnimeStatusFAB";
import BloomImage from "../../Widgets/BloomImage";
import { Image } from "../../Widgets/LoadersWidgets";
import { AnimeListHorizontal } from "../../Widgets/AnimeListHorizontalWidget";
import Icon from "../../Styles/Icons";
import { H3, H4, H5 } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import TVButton from "../../Components/TV/TVButton";
import CharacterCard from "../../Components/CharacterCard";
import YouTubeVideos from "../../Components/YouTubeVideos";
import MusicOST from "../../Components/MusicOST";
import BottomSheetDownload from "../../Components/BottomSheetDownload";
import CommentsSection from "../../Components/CommentsSection";

import {
  useAnimePreview,
  DubbingBottomSheet,
  EpisodesBottomSheet,
  MoreBottomSheet,
  NewEpisodesBottomSheet,
} from "./shared";
import { useAnimePreviewTVStyles } from "../../Styles/components/Screens/AnimePreviewTVStyles";
import { ErrorScreen } from "../ErrorScreen";
import { center } from "@shopify/react-native-skia";

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);
const NewEpisodesBottomSheetMemo = React.memo(NewEpisodesBottomSheet);

// Info row component
const InfoRow = ({ icon, label, value, themeColors }) => {
  const s = useAnimePreviewTVStyles();
  return (
    <View style={s.infoRow} focusable={false}>
      <View style={[s.infoIconContainer, { backgroundColor: themeColors.primary }]}>
        {icon}
      </View>
      <Text style={[H5, { color: themeColors.text, marginRight: 6 }]}>
        {label}:
      </Text>
      <Text style={[H5, { color: themeColors.primary, flex: 1 }]}>{value}</Text>
    </View>
  );
};

// Star rating component for TV
const StarRating = ({ rating = 0, onRate, themeColors }) => {
  const s = useAnimePreviewTVStyles();
  const stars = [...Array(10).keys()].map((i) => i + 1);

  return (
    <View style={[s.starsContainer, { backgroundColor: themeColors.subtle }]}>
      {stars.map((star) => (
        <TVButton key={star} onPress={() => onRate && onRate(star)}>
          <Icon.Star
            size={24}
            color={
              star <= rating ? themeColors.activeIcon : themeColors.inActiveText
            }
            weight={star <= rating ? "fill" : "regular"}
          />
        </TVButton>
      ))}
    </View>
  );
};

// Section tabs component for TV
const SectionTabs = ({ tabs, defaultTab, onTabChange, themeColors }) => {
  const s = useAnimePreviewTVStyles();
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

  if (filteredTabs.length === 0) return null;

  return (
    <View style={s.sectionTabsWrapper}>
      <View style={s.sectionTabsRow}>
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TVButton
              key={tab.key}
              style={[
                s.sectionTab,
                { backgroundColor: isActive ? themeColors.activeIcon : themeColors.subtle },
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text style={[H5, { color: themeColors.text }]}>
                {tab.label}
              </Text>
            </TVButton>
          );
        })}
      </View>
      {activeContent && <View>{activeContent}</View>}
    </View>
  );
};

export default function AnimePreviewTV({ route }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const s = useAnimePreviewTVStyles();
  const [firstTabs, setFirstTabs] = useState([]);
  const [titleContainerWidth, setTitleContainerWidth] = useState(null);

  const {
    anime,
    isLoading,
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
    moreSheetRef,
    newEpisodesSheetRef,
    handleStatusChange,
    handleFavoriteToggle,
    handleRateAnime,
    handleEpisodeSelect,
    handleEpisodeLongSelect,
    handleEpisodeSwipe,
    handleNewEpisodeSelect,
    handleNewTeamChange,
    handleBuiltInPlayerToggle,
    effectiveUseBuiltIn,
  } = useAnimePreview({ route, navigation });

  const newDownloadSheetRef = useRef(null);

  // Back button handler for TV remote
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("MainTabs", { screen: "Home" });
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Circular focus refs for left panel
  const backButtonRef = useRef(null);
  const favoriteButtonRef = useRef(null);
  const [backBtnHandle, setBackBtnHandle] = useState(undefined);
  const [favBtnHandle, setFavBtnHandle] = useState(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      const bh = backButtonRef.current
        ? findNodeHandle(backButtonRef.current)
        : null;
      const fh = favoriteButtonRef.current
        ? findNodeHandle(favoriteButtonRef.current)
        : null;
      setBackBtnHandle(bh || undefined);
      setFavBtnHandle(fh || undefined);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
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
    if (anime?.ost?.length > 0 && anime?.ost.every((ost) => ost.url != null)) {
      _tabs.push({
        key: "music",
        label: "Музика",
        content: <MusicOST ost={anime?.ost} />,
      });
    }
    setFirstTabs(_tabs);
  }, [anime?.slug, anime?.videos, anime?.ost]);

  useEffect(() => {
    setTitleContainerWidth(null);
  }, [anime?.slug]);

  const handleTitleLayout = useCallback((e) => {
    const lines = e.nativeEvent.lines;
    if (lines && lines.length > 0) {
      const maxLineWidth = Math.max(...lines.map((line) => line.width));
      setTitleContainerWidth(Math.ceil(maxLineWidth) + 4);
    }
  }, []);

  const renderCharacter = useCallback(
    ({ item }) => (
      <CharacterCard
        item={item}
        width={winWidth * 0.1}
        height={winHeight * 0.26}
      />
    ),
    [winWidth, winHeight],
  );

  const keyExtractorCharacter = useCallback(
    (item) => item?.character?.slug || "",
    [],
  );

  const landscapePosterHeight = Math.max(300, winHeight * 0.3);

  // Error states
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View
          style={s.centered}
        >
          <Text style={[H3, { color: themeColors.text }]}>
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
          style={s.centered}
        >
          <Text style={[H3, { color: themeColors.text }]}>
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
          style={s.centered}
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
          style={s.centered}
        >
          <Text style={[H3, { color: themeColors.text }]}>
            Аніме не знайдено
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }
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

  return (
    <DefaultScreenWidget isConnection={setIsConnection} isNavBarPadding={false}>
      <TVFocusGuideView style={s.focusGuide} autoFocus>
        {/* --- LEFT PANEL --- */}
        <ScrollView
          style={s.leftPanel}
          contentContainerStyle={s.leftPanelContent}
          showsVerticalScrollIndicator={false}
          focusable={false}
        >
          {/* Top section: poster + title + watch button — with background image */}
          <View style={s.topSection} focusable={false}>
            {/* Background image with gradient fade */}
            <Image
              uri={anime.image}
              style={[StyleSheet.absoluteFill, s.backgroundImage]}
            />
            <LinearGradient
              colors={[
                "transparent",
                themeColors.Background?.(1) ?? themeColors.background,
              ]}
              locations={[0, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Poster with bloom effect */}
            <View style={s.posterWrapper} focusable={false}>
              <BloomImage
                uri={anime.image}
                width={winWidth * 0.2}
                height={landscapePosterHeight}
                borderRadius={16}
                blurRadius={10}
                glowScale={1}
                fadePercent={0.15}
              />

              {/* Back button */}
              <TVButton
                innerRef={backButtonRef}
                nextFocusUp={favBtnHandle}
                style={[s.backButton, { backgroundColor: themeColors.subtle }]}
                onPress={() => {
                  if (navigation.canGoBack()) {
                    navigation.goBack();
                  } else {
                    navigation.navigate("MainTabs", { screen: "Home" });
                  }
                }}
                hasTVPreferredFocus={true}
              >
                <Icon.ArrowLeft size={24} color={themeColors.primary} />
              </TVButton>
            </View>

            {/* Title section */}
            <View style={s.titleRow} focusable={false}>
              <View
                style={[s.titleSection, titleContainerWidth && { width: titleContainerWidth }]}
                focusable={false}
              >
                <Text
                  style={[H3, { color: themeColors.text }]}
                  numberOfLines={2}
                  onTextLayout={handleTitleLayout}
                  focusable={false}
                  selectable={false}
                >
                  {anime.title_ua || anime.title_en || anime.title_ja}
                  {anime.year ? ` (${anime.year})` : ""}
                </Text>
                <View style={s.subtitleWrapper} focusable={false}>
                  <Text
                    style={[
                      H5,
                      {
                        color: themeColors.Text?.(0.6) || themeColors.text,
                      },
                    ]}
                    focusable={false}
                    selectable={false}
                  >
                    {anime.title_en || anime.title_ja || ""}
                  </Text>
                </View>
              </View>
            </View>

            {/* Primary action buttons */}
            <View style={s.primaryActionsRow} focusable={false}>
              <WatchButton
                label={getWatchButtonText()}
                style={s.watchButton}
                onWatchPress={() => newEpisodesSheetRef.current?.open()}
                isDownloadable={false}
                isActive={Object.keys(episodesList || {}).length > 0}
              />

              {/* Favorite button */}
              <TVButton
                innerRef={favoriteButtonRef}
                nextFocusDown={backBtnHandle}
                style={[s.favoriteButton, { backgroundColor: themeColors.subtle }]}
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
              </TVButton>
            </View>
          </View>
          {/* end top background wrapper */}

          {/* Info section */}
          <View
            style={[s.infoSection, { backgroundColor: themeColors.subtle }]}
            focusable={false}
          >
            {/* Genre tags */}
            <View style={s.genreRow}>
              <View style={[s.genreIconContainer, { backgroundColor: themeColors.primary }]}>
                <Icon.Hash size={18} color={themeColors.inActiveIcon} />
              </View>
              <View style={s.genreTextContainer}>
                <View style={s.genresContainer}>
                  <Text
                    selectable
                    style={[
                      H5,
                      {
                        color: themeColors.primary,
                        includeFontPadding: false,
                      },
                    ]}
                  >
                    {anime?.genres
                      ?.slice(0, 3)
                      ?.map((g) => g.name_ua)
                      ?.join(", ")}
                  </Text>
                </View>
              </View>
            </View>

            <InfoRow
              icon={
                <Icon.CircleDashed size={18} color={themeColors.inActiveIcon} />
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
                    size={18}
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
                <Icon.SealWarning size={18} color={themeColors.inActiveIcon} />
              }
              label="Віковий рейтинг"
              value={getAgeRating(anime.rating)}
              themeColors={themeColors}
            />

            {anime.score > 0 && (
              <InfoRow
                icon={<Icon.Star size={18} color={themeColors.inActiveIcon} />}
                label="Рейтинг Hikka"
                value={anime.score?.toFixed(1) || "N/A"}
                themeColors={themeColors}
              />
            )}
          </View>
        </ScrollView>

        {/* --- RIGHT PANEL --- */}
        <View style={s.rightPanel} focusable={false}>
          <ScrollView
            style={s.leftPanel}
            showsVerticalScrollIndicator={false}
            focusable={false}
          >
            {/* Section Tabs (Videos, Music) */}
            <SectionTabs
              tabs={firstTabs}
              defaultTab={firstTabs[0]?.key}
              themeColors={themeColors}
            />

            {/* Description */}
            <View style={s.descriptionSection} focusable={false}>
              <Markdown
                style={{
                  body: [H5, { color: themeColors.text, lineHeight: 26 }],
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
                ).replaceAll("hikka.io", "aniua.app")}
              </Markdown>
            </View>

            {/* Rating section */}
            <View style={s.ratingSection} focusable={false}>
              <Text style={[H4, s.ratingSectionTitle, { color: themeColors.primary }]}>
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
                ]}
                defaultTab={animeList.length > 0 ? "similar" : null}
                themeColors={themeColors}
              />
            )}

            {/* Comments Section */}
            {anime?.slug && (
              <SectionTabs
                tabs={[
                  {
                    key: "comments",
                    label: "Коментарі",
                    content: (
                      <CommentsSection
                        slug={anime.slug}
                        isInputVisible={false}
                      />
                    ),
                  },
                ]}
                defaultTab="comments"
                themeColors={themeColors}
              />
            )}
          </ScrollView>
        </View>
      </TVFocusGuideView>

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
          useBuiltInPlayer={effectiveUseBuiltIn}
          watchedEpisodes={info?.watched_episodes || []}
          onSelectEpisode={handleNewEpisodeSelect}
          onTeamChange={handleNewTeamChange}
          onBuiltInPlayerToggle={handleBuiltInPlayerToggle}
        />
      )}

      {/* Download Bottom Sheet */}
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
          onDownloadError={(_error, episode) => {
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
        size={44}
      />
    </DefaultScreenWidget>
  );
}
