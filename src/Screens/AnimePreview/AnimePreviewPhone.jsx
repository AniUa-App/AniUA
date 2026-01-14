import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
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

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);
const NewEpisodesBottomSheetMemo = React.memo(NewEpisodesBottomSheet);

// Info row component
const InfoRow = ({ icon, label, value, themeColors }) => (
  <View style={[styles.infoRow]}>
    <View
      style={[
        styles.infoIcon,
        { padding: 4, backgroundColor: themeColors.primary, borderRadius: 16 },
      ]}
    >
      {icon}
    </View>
    <Text style={[H5, styles.infoLabel, { color: themeColors.text }]}>
      {label}:
    </Text>
    <Text style={[H5, styles.infoValue, { color: themeColors.primary }]}>
      {value}
    </Text>
  </View>
);

// Genre tag component
const GenreTag = ({ name, themeColors }) => (
  <View style={[{ borderColor: themeColors.primary, padding: 4 }]}>
    <Text style={[H5, { color: themeColors.primary }]}>{name}</Text>
  </View>
);

// Star rating component
const StarRating = ({ rating = 0, onRate, themeColors }) => {
  const stars = [2, 4, 6, 8, 10];
  return (
    <View
      style={[styles.starsContainer, { backgroundColor: themeColors.subtle }]}
    >
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          style={styles.starButton}
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
    [onTabChange]
  );

  const activeContent = filteredTabs.find(
    (tab) => tab.key === activeTab
  )?.content;

  if (filteredTabs.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionTabsWrapper}>
      {/* Tab buttons */}
      <View style={[styles.sectionTabsContainer]}>
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.sectionTab,
                {
                  backgroundColor: isActive
                    ? themeColors.activeIcon
                    : themeColors.subtle,
                },
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
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
      {activeContent && (
        <View style={styles.sectionTabContent}>{activeContent}</View>
      )}
    </View>
  );
};

export default function AnimePreviewPhone({ route }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [titleContainerWidth, setTitleContainerWidth] = useState(null);
  const [firstTabs, setFirstTabs] = useState([]);
  const insets = useContext(SafeAreaInsetsContext);

  const {
    anime,
    isLoading,
    existingFiles,
    animeList,
    charactersList,
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

  // Reset title width when anime changes
  useEffect(() => {
    setTitleContainerWidth(null);

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

  // Handle title text layout to dynamically center
  const handleTitleLayout = useCallback((e) => {
    const lines = e.nativeEvent.lines;
    if (lines && lines.length > 0) {
      const maxLineWidth = Math.max(...lines.map((line) => line.width));
      setTitleContainerWidth(Math.ceil(maxLineWidth) + 4); // +4 for safety margin
    }
  }, []);

  // Handle watch button press
  const handleWatchPress = useCallback(() => {
    newEpisodesSheetRef.current?.open();
  }, [newEpisodesSheetRef]);

  // Handle download button press
  const handleDownloadPress = useCallback(() => {
    if (Object.keys(episodesList).length > 0) {
      downloadEpisodeRef.current?.present();
    }
  }, [episodesList]);

  // Get watch button text
  const getWatchButtonText = () => {
    if (!info?.watched?.player || !info?.watched?.dubbing || !episodesList) {
      return "Завантаження...";
    }
  };

  // These callbacks must be defined before any early returns to avoid hooks order violation
  const renderCharacter = useCallback(
    ({ item }) => (
      <CharacterCard
        item={item}
        width={winWidth * 0.35}
        height={winHeight * 0.22}
      />
    ),
    [winWidth, winHeight]
  );

  const keyExtractorCharacter = useCallback(
    (item) => item?.character?.slug || "",
    []
  );

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
          width={winWidth * 0.35}
          showDetails={true}
          onPress={() => navigation.replace("AnimePreview", { anime: item })}
        />
      );
    },
    [initialAnime?.slug, navigation, winWidth, winHeight]
  );

  // Error states
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
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
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
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
          <Text style={[H3, { color: themeColors.text }]}>
            Аніме не знайдено
          </Text>
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
        {/* Poster with bloom effect */}
        <View style={[styles.posterContainer]}>
          {/* Bloom/Glow image using Skia shader */}
          <BloomImage
            uri={anime.image}
            width={winWidth / 1.5}
            height={winHeight / 2}
            borderRadius={16}
            blurRadius={8}
            glowScale={1}
            fadePercent={0.15}
          />

          {/* Back button */}
          <TouchableOpacity
            style={[
              styles.topButton,
              { backgroundColor: themeColors.subtle, left: 16 },
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
              styles.topButton,
              {
                backgroundColor: themeColors.subtle,
                right: 16,
              },
            ]}
            onPress={() => moreSheetRef.current?.present()}
          >
            <Icon.DotsThreeVertical size={32} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Title section */}
          <View style={styles.titleWrapper}>
            <View
              style={[
                styles.titleSection,
                titleContainerWidth && { width: titleContainerWidth },
              ]}
            >
              <Text
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
              <View style={styles.subtitleRow}>
                <Text
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
          <View style={styles.primaryActionsRow}>
            {/* Watch button */}
            <WatchButton
              label={
                isLoading
                  ? WatchButtonState.LOADING
                  : WatchButtonState.CONTINUE_WATCHING
              }
              style={{
                width: "70%",
              }}
              onWatchPress={handleWatchPress}
              onDownloadPress={handleDownloadPress}
              isDownloadable={Object.keys(episodesList).length > 0}
              isActive={Object.keys(episodesList).length > 0}
            />

            {/* Download button */}
            {/* <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: themeColors.subtle },
              ]}
              onPress={() =>
                Object.keys(episodesList).length > 0 &&
                downloadEpisodeRef.current?.present()
              }
            >
              <Icon.DownloadSimple size={24} color={themeColors.text} />
            </TouchableOpacity> */}

            {/* Favorite button */}
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: themeColors.subtle },
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

          {/* Info section */}
          <View
            style={[
              styles.infoSection,
              { backgroundColor: themeColors.subtle },
            ]}
          >
            {/* Genre tags */}
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.icon,
                  { backgroundColor: themeColors.primary, marginRight: 8 },
                ]}
              >
                <Icon.Hash size={24} color={themeColors.inActiveIcon} />
              </View>
              {anime.genres?.length > 0 && (
                <View style={styles.genresContainer}>
                  {anime.genres.slice(0, 3).map((genre, index) => (
                    <React.Fragment key={genre.name_ua}>
                      <Text style={[H5, { color: themeColors.primary }]}>
                        {genre.name_ua}
                      </Text>
                      {index < anime.genres.slice(0, 3).length - 1 && (
                        <Text style={[H5, { color: themeColors.primary }]}>
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

          {/* Description */}
          <View style={styles.descriptionSection}>
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
            {/* 
            {anime?.source && (
              <Text
                style={[H6, styles.sourceText, { color: themeColors.text }]}
              >
                Джерело:{" "}
                {anime.source === "manga"
                  ? "Манґа"
                  : anime.source === "light_novel"
                    ? "Ранобе"
                    : anime.source === "visual_novel"
                      ? "Візуальна новела"
                      : anime.source === "original"
                        ? "Оригінал"
                        : anime.source}
              </Text>
            )} */}
          </View>

          {/* Rating section */}
          <View style={styles.ratingSection}>
            <Text
              style={[
                H4,
                styles.ratingSectionTitle,
                { color: themeColors.primary },
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

          {/* Section Tabs */}
          <SectionTabs
            tabs={firstTabs}
            defaultTab={firstTabs[0]?.key}
            themeColors={themeColors}
          />

          {/* Similar anime and Characters tabs */}
          {(animeList.length > 0 || charactersList.length > 0) && (
            <SectionTabs
              tabs={[
                animeList.length > 0 && {
                  key: "similar",
                  label: "Схожі",
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
              defaultTab={animeList.length > 0 ? "similar" : "characters"}
              themeColors={themeColors}
            />
          )}
        </View>
      </ScrollView>

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

            <EpisodesBottomSheetMemo
              sheetRef={downloadEpisodeRef}
              episodesList={episodesList}
              storage_data={{ ...info, slug: anime?.slug }}
              type="download"
              isChanges={null}
              checkForStyle={(item) => existingFiles.has(item.episode)}
              onSelectEpisode={handleDownloadEpisode}
            />
          </>
        )}

      {/* New Episodes Bottom Sheet (AniuaApi) */}
      {anime?.slug && (
        <NewEpisodesBottomSheetMemo
          ref={newEpisodesSheetRef}
          slug={anime.slug}
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

      {snackbar}
      <MoreBottomSheetMemo sheetRef={moreSheetRef} anime={anime} />

      <AnimeStatusFAB
        currentStatus={watchStatus}
        onStatusChange={handleStatusChange}
      />
    </DefaultScreenWidget>
  );
}

// Phone-specific styles - New redesigned layout
export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  icon: {
    padding: 4,
    borderRadius: 16,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Poster section
  posterContainer: {
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 82,
  },
  poster: {
    alignItems: "center",
  },
  bottomImg: {
    width: 250,
    height: 375,
    position: "absolute",
    borderRadius: 16,
    top: -10,
    zIndex: 1,
  },
  blur: {
    width: 250,
    height: 375,
    position: "absolute",
    borderRadius: 16,
    zIndex: 1,
  },

  topImg: {
    width: 225,
    height: 350,
    borderRadius: 16,
    zIndex: 2,
  },
  posterGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Content container
  contentContainer: {
    alignItems: "center",
    width: "100%",
    top: -10,
  },

  // Title wrapper - row container for centering
  titleWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 16,
  },
  // Title section
  titleSection: {
    flexDirection: "column",
    alignItems: "flex-start",
    maxWidth: "95%",
  },
  subtitleRow: {
    gap: 8,
    marginTop: 2,
  },
  subtitle: {},

  // Primary actions row (Watch, Download, Favorite)
  primaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  watchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  watchButtonText: {
    fontWeight: "600",
  },
  topButton: {
    top: 50,
    borderRadius: 16,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    height: 48,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Genres tags
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genreTag: {},

  // Info section
  infoSection: {
    padding: 16,
    borderRadius: 16,
    width: "95%",
    alignItems: "flex-start",
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    alignItems: "center",
  },
  infoValue: {
    fontWeight: "500",
    flex: 1,
  },

  // Description
  descriptionSection: {
    marginVertical: 10,
    width: "88%",
  },
  descriptionText: {
    lineHeight: 22,
    opacity: 0.9,
  },
  sourceText: {
    marginTop: 12,
    opacity: 0.5,
    fontStyle: "italic",
  },

  // Rating section
  ratingSection: {
    width: "95%",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingSectionTitle: {
    marginBottom: 14,
    width: "100%",
    textAlign: "left",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    padding: 16,
    borderRadius: 16,
  },
  starButton: {
    padding: 4,
  },

  // Section Tabs
  sectionTabsWrapper: {
    alignItems: "left",
    width: "95%",
    marginBottom: 20,
  },
  sectionTabsContainer: {
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 6,
    gap: 12,
  },
  sectionTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  sectionTabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTabContent: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },

  // Legacy Tabs (deprecated)
  tabsContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
  },
  tabActive: {},
  tabInactive: {},

  // Section header
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },

  // Similar anime
  similarContainer: {
    marginBottom: 20,
  },
  similarCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  similarImage: {
    borderRadius: 12,
  },
  similarCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },

  // Characters
  charactersContainer: {
    marginBottom: 24,
  },
  characterCard: {
    marginRight: 12,
    alignItems: "center",
    width: 100,
  },
  characterImage: {
    borderRadius: 50,
    marginBottom: 8,
  },
  characterName: {
    textAlign: "center",
    fontSize: 12,
  },

  // Legacy styles for compatibility
  actionsRow: {
    marginTop: 9,
    gap: 14,
    justifyContent: "center",
    flexDirection: "row",
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  continueWatchingBtn: {
    borderRadius: 8,
    padding: 10,
    margin: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagItem: {
    marginRight: 8,
    marginBottom: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  ratingContainer: {
    position: "absolute",
    top: 50,
    right: 0,
    padding: 8,
    paddingRight: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  playTrailerBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 40,
    left: 20,
    padding: 10,
    borderRadius: 8,
  },
});
