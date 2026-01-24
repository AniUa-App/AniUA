import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Linking,
  ActivityIndicator,
  FlatList,
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
import { tabletStyles as styles } from "./styles";
import BottomSheetDownload from "../../Components/BottomSheetDownload";

const DubbingBottomSheetMemo = React.memo(DubbingBottomSheet);
const EpisodesBottomSheetMemo = React.memo(EpisodesBottomSheet);
const MoreBottomSheetMemo = React.memo(MoreBottomSheet);

// Section tabs component
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
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={{
                padding: 12,
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
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeContent && <View>{activeContent}</View>}
    </View>
  );
};

export default function AnimePreviewTablet({ route }) {
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

  const landscapePosterHeight = Math.max(260, winHeight * 0.75);

  // Error states
  if (!route || !route.params) {
    return (
      <DefaultScreenWidget>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
          <Text style={[H3, { color: themeColors.text }]}>
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
      <TouchableOpacity
        key={item.slug}
        style={styles.similarCard}
        onPress={() => navigation.replace("AnimePreview", { anime: item })}
      >
        <Image
          style={[
            styles.similarImage,
            { width: winWidth * 0.12, height: winHeight * 0.3 },
          ]}
          uri={item.image}
        />
      </TouchableOpacity>
    );
  };

  const renderCharacter = useCallback(
    ({ item }) => <CharacterCard item={item} imageSize={80} />,
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
        <View style={{ width: "40%" }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Poster */}
            <View style={[styles.posterContainer, { height: landscapePosterHeight }]}>
              <Image style={styles.posterImage} uri={anime?.image} />
              {isFocused ? <View style={styles.overlay} /> : null}

              {/* Back button */}
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  try {
                    navigation.goBack();
                  } catch {
                    navigation.navigate("MainTabs", { screen: "Home", params: { anime } });
                  }
                }}
              >
                <Icon.ArrowLeft size={35} color={themeColors.text} />
              </TouchableOpacity>

              {/* Rating */}
              <View style={[styles.ratingContainer, { backgroundColor: themeColors.subtle }]}>
                <Icon.Star size={24} color={themeColors.yellow} />
                <Text style={[H3, { color: themeColors.text, paddingRight: 10 }]}>
                  {anime?.score || 0}
                </Text>
              </View>

              {/* Trailer button */}
              {anime?.videos?.find((v) => v.video_type === "video_promo")?.url && (
                <TouchableOpacity
                  style={[styles.playTrailerBtn, { backgroundColor: themeColors.Background(0.5) }]}
                  onPress={() =>
                    Linking.openURL(
                      anime.videos.find((v) => v.video_type === "video_promo")?.url
                    )
                  }
                >
                  <Icon.PlayCircle size={34} color={themeColors.primary} />
                  <Text style={[H4, { marginLeft: 10 }]}>Дивитися трейлер</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.contentContainer}>
              <ForwardButton
                navigation={navigation}
                anime={anime}
                errorCode={errorCode}
                episodesList={episodesList}
                style={[styles.continueWatchingBtn, { marginBottom: 18, backgroundColor: themeColors.primary }]}
                data={info}
                onDataChange={(newData) => setInfo(newData)}
              />

              {/* Dubbing selector */}
              <View style={{ flexDirection: "row", marginBottom: 6, marginLeft: "2%" }}>
                {info?.watched?.player && (
                  <>
                    <Text style={[H3, { color: themeColors.text }]}>Озвучення:</Text>
                    <TouchableOpacity
                      style={{ marginLeft: 10, flexDirection: "row", alignItems: "center" }}
                      onPress={() => dubbingSheetRef.current?.present()}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[H3, { color: themeColors.primary, paddingRight: 3 }]}
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
                      <Icon.CaretDown size={30} color={themeColors.text} style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Action buttons */}
              <View style={styles.actionsRow}>
                {/* Episodes */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => Object.keys(episodesList).length > 0 && episodesSheetRef.current?.present()}
                  activeOpacity={Object.keys(episodesList).length === 0 ? 0.9 : 0.7}
                >
                  <Icon.Queue size={34} color={themeColors.text} />
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
                </TouchableOpacity>

                {/* Favorite */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={handleFavoriteToggle}
                >
                  {(HikkaAuthService.isAuthenticated() ? isFavoriteHikka : info?.isFavorite) ? (
                    <Icon.Heart size={34} color={themeColors.primary} weight="fill" />
                  ) : (
                    <Icon.Heart size={34} color={themeColors.text} />
                  )}
                </TouchableOpacity>

                {/* Download */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => anime?.slug && newDownloadSheetRef.current?.open()}
                  activeOpacity={Object.keys(episodesList).length === 0 ? 0.9 : 0.7}
                >
                  <Icon.DownloadSimple size={34} color={themeColors.text} />
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
                </TouchableOpacity>

                {/* More */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.subtle }]}
                  onPress={() => moreSheetRef.current?.present()}
                >
                  <Icon.DotsThreeVertical size={34} color={themeColors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Right panel - Info and description */}
        <View style={{ width: "60%", padding: 20 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Title and info */}
            <View style={styles.headerRow}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: "10%", width: "80%" }}>
                {anime.episodes_total !== null && anime.episodes_released !== null && (
                  <Text style={[H5, styles.yearEpisodes]}>
                    {anime.year} |{" "}
                    {anime.episodes_total === anime.episodes_released
                      ? anime.episodes_released
                      : `${anime.episodes_released} з ${anime.episodes_total}`}
                  </Text>
                )}
                <Text style={[H5, styles.yearEpisodes, { color: themeColors.primary }]}>
                  {getEpisodeDateOrType(anime)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.titleContainer}
                onLongPress={() => anime.title_ua && Clipboard.setString(anime.title_ua)}
                delayLongPress={400}
              >
                <Text style={[H3, { fontWeight: "bold", width: "90%", flexWrap: "wrap" }]}>
                  {anime.title_ua || anime.title_en || anime.title_ja}
                </Text>
                <Text style={[H3, { color: themeColors.primary }]}>
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
              <Text style={[H4, styles.tagItem, { color: themeColors.primary }]}>
                {anime.genres?.length > 0
                  ? anime.genres.map((genre) => genre.name_ua).join(", ")
                  : ""}
              </Text>
            </TouchableOpacity>

            {/* Description */}
            <Text style={[H4, { marginBottom: 25 }]}>
              <Markdown
                style={{
                  body: [H4, { marginBottom: 25 }],
                  link: [H4, { marginBottom: 25, color: themeColors.primary, textDecorationLine: "underline" }],
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
                        contentContainerStyle={{ paddingRight: 16 }}
                        initialNumToRender={3}
                        windowSize={5}
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
