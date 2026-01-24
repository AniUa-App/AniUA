import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  ActivityIndicator,
  FlatList,
  TVFocusGuideView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import Clipboard from "@react-native-clipboard/clipboard";

import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import { ForwardButton } from "../../Widgets/ForwardButtonWidget";
import AnimeStatusFAB from "../../Widgets/AnimeStatusFAB";
import Icon from "../../Styles/Icons";
import { H3, H4, H5 } from "../../Styles/Fonts";
import CharacterCard from "../../Components/CharacterCard";
import { useThemeColors } from "../../Global/useTheme";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import { playersIcons } from "../../Widgets/DubbingBottomSheetWidget";

import {
  useAnimePreview,
  getEpisodeDateOrType,
  DubbingBottomSheet,
  EpisodesBottomSheet,
  MoreBottomSheet,
} from "./shared";
import { tvStyles as styles } from "./styles";
import BottomSheetDownload from "../../Components/BottomSheetDownload";

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);

// TV-optimized button with focus state
function TVButton({ style, focusedStyle, children, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TouchableOpacity
      {...props}
      style={[style, isFocused && (focusedStyle || styles.focusedButton)]}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      hasTVPreferredFocus={false}
    >
      {children}
    </TouchableOpacity>
  );
}

// Section tabs component for TV
const SectionTabs = ({ tabs, defaultTab, themeColors }) => {
  const filteredTabs = tabs.filter(Boolean);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const tabExists = filteredTabs.some((tab) => tab.key === activeTab);
    if (filteredTabs.length > 0 && !tabExists) {
      setActiveTab(defaultTab || filteredTabs[0]?.key);
    }
  }, [filteredTabs, defaultTab, activeTab]);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
  }, []);

  const activeContent = filteredTabs.find(
    (tab) => tab.key === activeTab
  )?.content;

  if (filteredTabs.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TVButton
              key={tab.key}
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: themeColors.subtle,
              }}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text
                style={[
                  H5,
                  {
                    color: isActive ? themeColors.activeIcon : themeColors.text,
                    fontSize: 18,
                  },
                ]}
              >
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
    info,
    setInfo,
    isFocused,
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
    handleStatusChange,
    handleFavoriteToggle,
    handleEpisodeSelect,
    handleEpisodeLongSelect,
    handleEpisodeSwipe,
    handleDownloadEpisode,
    keyExtractorSimilar,
  } = useAnimePreview({ route, navigation });

  // Ref for new download bottom sheet
  const newDownloadSheetRef = useRef(null);

  const tvPosterHeight = Math.max(400, winHeight * 0.85);

  // Error states
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={[H3, { color: themeColors.text, fontSize: 24 }]}>
            Помилка: неправильні параметри навігації
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!initialAnime && !slug) {
    return (
      <DefaultScreenWidget>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={[H3, { color: themeColors.text, fontSize: 24 }]}>
            Помилка: відсутні необхідні параметри
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  if (isLoading) {
    return (
      <DefaultScreenWidget>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!anime) {
    return (
      <DefaultScreenWidget>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={[H3, { color: themeColors.text, fontSize: 24 }]}>
            Аніме не знайдено
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  const renderSimilarAnime = ({ item }) => {
    if (!item?.slug || !initialAnime?.slug || item.slug === initialAnime.slug) {
      return null;
    }
    return (
      <TVButton
        key={item.slug}
        style={styles.similarCard}
        onPress={() => navigation.replace("AnimePreview", { anime: item })}
      >
        <Image
          style={[
            styles.similarImage,
            { width: winWidth * 0.1, height: winHeight * 0.35 },
          ]}
          uri={item.image}
        />
      </TVButton>
    );
  };

  const renderCharacter = useCallback(
    ({ item }) => <CharacterCard item={item} imageSize={100} />,
    []
  );

  const keyExtractorCharacter = useCallback(
    (item) => item?.character?.slug || "",
    []
  );

  return (
    <DefaultScreenWidget isConnection={setIsConnection}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Left panel - Poster and actions */}
        <View style={styles.sidePanel}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Poster */}
            <View style={[styles.posterContainer, { height: tvPosterHeight }]}>
              <Image style={styles.posterImage} uri={anime?.image} />
              {isFocused ? <View style={styles.overlay} /> : null}

              {/* Back button */}
              <TVButton
                style={[styles.backButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  try {
                    navigation.goBack();
                  } catch {
                    navigation.navigate("MainTabs", { screen: "Home", params: { anime } });
                  }
                }}
                hasTVPreferredFocus={true}
              >
                <Icon.ArrowLeft size={48} color={themeColors.text} />
              </TVButton>

              {/* Rating */}
              <View style={[styles.ratingContainer, { backgroundColor: themeColors.subtle }]}>
                <Icon.Star size={32} color={themeColors.yellow} />
                <Text style={[H3, { color: themeColors.text, paddingRight: 10, fontSize: 24 }]}>
                  {anime?.score || 0}
                </Text>
              </View>

              {/* Trailer button */}
              {anime?.videos?.find((v) => v.video_type === "video_promo")?.url && (
                <TVButton
                  style={[styles.playTrailerBtn, { backgroundColor: themeColors.Background(0.5) }]}
                  onPress={() =>
                    Linking.openURL(
                      anime.videos.find((v) => v.video_type === "video_promo")?.url
                    )
                  }
                >
                  <Icon.PlayCircle size={48} color={themeColors.primary} />
                  <Text style={[H4, { marginLeft: 16, fontSize: 20 }]}>Дивитися трейлер</Text>
                </TVButton>
              )}
            </View>

            <View style={styles.contentContainer}>
              <ForwardButton
                navigation={navigation}
                anime={anime}
                errorCode={errorCode}
                episodesList={episodesList}
                style={[styles.continueWatchingBtn, { marginBottom: 24, backgroundColor: themeColors.primary, padding: 16 }]}
                data={info}
                onDataChange={(newData) => setInfo(newData)}
              />

              {/* Dubbing selector */}
              <View style={{ flexDirection: "row", marginBottom: 12, marginLeft: "2%" }}>
                {info?.watched?.player && (
                  <>
                    <Text style={[H3, { color: themeColors.text, fontSize: 20 }]}>Озвучення:</Text>
                    <TVButton
                      style={{ marginLeft: 16, flexDirection: "row", alignItems: "center" }}
                      onPress={() => dubbingSheetRef.current?.present()}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[H3, { color: themeColors.primary, paddingRight: 6, fontSize: 20 }]}
                      >
                        {(info?.watched?.dubbing || "Вибрати дубляж").slice(0, 20)}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: info?.watched?.player ? 40 : 0,
                          height: info?.watched?.player ? 40 : 0,
                        }}
                      >
                        {playersIcons[info?.watched?.player]}
                      </View>
                      <Icon.CaretDown size={40} color={themeColors.text} style={{ marginLeft: 12 }} />
                    </TVButton>
                  </>
                )}
              </View>

              {/* Action buttons - larger for TV */}
              <View style={styles.actionsRow}>
                {/* Episodes */}
                <TVButton
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => Object.keys(episodesList).length > 0 && episodesSheetRef.current?.present()}
                  activeOpacity={Object.keys(episodesList).length === 0 ? 0.9 : 0.7}
                >
                  <Icon.Queue size={48} color={themeColors.text} />
                  {Object.keys(episodesList).length === 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: themeColors.Background(0.7),
                        borderRadius: 8,
                      }}
                    />
                  )}
                </TVButton>

                {/* Favorite */}
                <TVButton
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={handleFavoriteToggle}
                >
                  {(HikkaAuthService.isAuthenticated() ? isFavoriteHikka : info?.isFavorite) ? (
                    <Icon.Heart size={48} color={themeColors.primary} weight="fill" />
                  ) : (
                    <Icon.Heart size={48} color={themeColors.text} />
                  )}
                </TVButton>

                {/* Download */}
                <TVButton
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => anime?.slug && newDownloadSheetRef.current?.open()}
                  activeOpacity={Object.keys(episodesList).length === 0 ? 0.9 : 0.7}
                >
                  <Icon.DownloadSimple size={48} color={themeColors.text} />
                  {Object.keys(episodesList).length === 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: themeColors.Background(0.7),
                        borderRadius: 8,
                      }}
                    />
                  )}
                </TVButton>

                {/* More */}
                <TVButton
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => moreSheetRef.current?.present()}
                >
                  <Icon.DotsThreeVertical size={48} color={themeColors.text} />
                </TVButton>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Right panel - Info and description */}
        <View style={styles.mainPanel}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title and info */}
            <View style={styles.headerRow}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: "10%", width: "80%" }}>
                {anime.episodes_total !== null && anime.episodes_released !== null && (
                  <Text style={[H5, styles.yearEpisodes, { fontSize: 20 }]}>
                    {anime.year} |{" "}
                    {anime.episodes_total === anime.episodes_released
                      ? anime.episodes_released
                      : `${anime.episodes_released} з ${anime.episodes_total}`}
                  </Text>
                )}
                <Text style={[H5, styles.yearEpisodes, { color: themeColors.primary, fontSize: 20 }]}>
                  {getEpisodeDateOrType(anime)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.titleContainer}
                onLongPress={() => anime.title_ua && Clipboard.setString(anime.title_ua)}
                delayLongPress={400}
              >
                <Text style={[H3, { fontWeight: "bold", width: "90%", flexWrap: "wrap", fontSize: 28 }]}>
                  {anime.title_ua || anime.title_en || anime.title_ja}
                </Text>
                <Text style={[H3, { color: themeColors.primary, fontSize: 24 }]}>
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
              </TouchableOpacity>
            </View>

            {/* Genres */}
            <TouchableOpacity style={styles.tagsRow}>
              <Text style={[H4, styles.tagItem, { color: themeColors.primary, fontSize: 18 }]}>
                {anime.genres?.length > 0
                  ? anime.genres.map((genre) => genre.name_ua).join(", ")
                  : ""}
              </Text>
            </TouchableOpacity>

            {/* Description */}
            <Text style={[H4, { marginBottom: 32, fontSize: 18, lineHeight: 28 }]}>
              <Markdown
                style={{
                  body: [H4, { marginBottom: 32, fontSize: 18, lineHeight: 28 }],
                  link: [H4, { marginBottom: 32, color: themeColors.primary, textDecorationLine: "underline", fontSize: 18 }],
                }}
              >
                {anime?.synopsis_ua || anime?.synopsis_en}
              </Markdown>
            </Text>

            {/* Similar anime and Characters tabs */}
            {(animeList.length > 0 || charactersList.length > 0) && (
              <SectionTabs
                tabs={[
                  animeList.length > 0 && {
                    key: "similar",
                    label: "Схожі",
                    content: (
                      <FlatList
                        horizontal
                        data={animeList}
                        renderItem={renderSimilarAnime}
                        keyExtractor={keyExtractorSimilar}
                        showsHorizontalScrollIndicator={false}
                        style={styles.similarContainer}
                        contentContainerStyle={{ paddingRight: 24 }}
                        initialNumToRender={5}
                        windowSize={7}
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
                        contentContainerStyle={{ paddingRight: 24 }}
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
          </ScrollView>
        </View>
      </View>

      {/* Bottom sheets */}
      {info?.watched?.dubbing && info?.watched?.player && episodesList && Object.keys(episodesList).length > 0 && (
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
            checkForStyle={(item) => (info.watched_episodes || []).includes(item.episode)}
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
