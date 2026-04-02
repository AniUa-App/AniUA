import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Markdown from "react-native-markdown-display";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { Image } from "../../Widgets/LoadersWidgets";
import { TouchableOpacity } from "../../Widgets/Button";
import BloomImage from "../../Widgets/BloomImage";
import Icon from "../../Styles/Icons";
import { H3, H4, H5 } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import { HikkaAuthService } from "../../Services/HikkaAuthService";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import AniuaApi from "../../Api/AniuaApi";
import CharacterCard from "../../Components/CharacterCard";
import MangaCard from "../../Components/MangaCard";
import CommentsSection from "../../Components/CommentsSection";
import { useAnimePreviewPhoneStyles } from "../../Styles/components/Screens/AnimePreviewPhoneStyles";
import { ErrorScreen } from "../ErrorScreen";
import Logger from "../../Logger/Logger";
import MangaMoreBottomSheet from "../../Widgets/MangaMoreBottomSheetWidget";
import WatchButton, { WatchButtonState } from "../../Components/WatchButton";

// ==================== Sub-components ====================

const InfoRow = ({ icon, label, value, themeColors }) => {
  const s = useAnimePreviewPhoneStyles();
  return (
    <View style={s.infoRow}>
      <View
        style={[
          s.infoIcon,
          {
            padding: 4,
            backgroundColor: themeColors.primary,
            borderRadius: 16,
          },
        ]}
      >
        {icon}
      </View>
      <Text
        selectable={true}
        style={[H5, s.infoLabel, { color: themeColors.text }]}
      >
        {label}:
      </Text>
      <Text
        selectable={true}
        style={[H5, s.infoValue, { color: themeColors.primary }]}
      >
        {value}
      </Text>
    </View>
  );
};

const StarRating = ({ rating = 0, onRate, themeColors }) => {
  const s = useAnimePreviewPhoneStyles();
  const stars = [2, 4, 6, 8, 10];
  return (
    <View style={[s.starsContainer, { backgroundColor: themeColors.subtle }]}>
      {stars.map((star) => (
        <TouchableOpacity
          key={star}
          style={s.starButton}
          onPress={() => onRate?.(star)}
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

const SectionTabs = ({ tabs, defaultTab, themeColors }) => {
  const s = useAnimePreviewPhoneStyles();
  const filteredTabs = tabs.filter(Boolean);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const tabExists = filteredTabs.some((tab) => tab.key === activeTab);
    if (filteredTabs.length > 0 && !tabExists) {
      setActiveTab(defaultTab || filteredTabs[0]?.key);
    }
  }, [filteredTabs, defaultTab, activeTab]);

  const activeContent = filteredTabs.find(
    (tab) => tab.key === activeTab,
  )?.content;

  if (filteredTabs.length === 0) return null;

  return (
    <View style={s.sectionTabsWrapper}>
      <View style={s.sectionTabsContainer}>
        {filteredTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                s.sectionTab,
                {
                  backgroundColor: isActive
                    ? themeColors.activeIcon
                    : themeColors.subtle,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text selectable={true} style={[H5, { color: themeColors.text }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeContent && (
        <View style={s.sectionTabContent}>{activeContent}</View>
      )}
    </View>
  );
};

// ==================== Hook ====================

function useMangaPreview({ route }) {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const initialManga = route.params?.manga;
  const slug = route.params?.slug || initialManga?.slug;

  const [manga, setManga] = useState(initialManga || null);
  const [isLoading, setIsLoading] = useState(!initialManga?.genres);
  const [errorCode, setErrorCode] = useState(null);
  const [charactersList, setCharactersList] = useState([]);
  const [similarList, setSimilarList] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isChaptersLoading, setIsChaptersLoading] = useState(false);
  const [readStatus, setReadStatus] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userScore, setUserScore] = useState(0);

  // Завантаження деталей манґи
  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await HikkaApiComplete.getMangaDetails(slug);
        if (data?.code === 404) {
          setErrorCode(404);
        } else {
          setManga(data);
        }
      } catch (err) {
        Logger.error("MangaPreview", "Помилка завантаження манґи", err);
        setErrorCode(err?.response?.status || 500);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [slug]);

  // Завантаження розділів для читання
  useEffect(() => {
    if (!slug) return;
    setIsChaptersLoading(true);
    AniuaApi.getMangaChapters(slug)
      .then((data) => setChapters(data || []))
      .catch((err) =>
        Logger.error("MangaPreview", "Помилка завантаження розділів", err),
      )
      .finally(() => setIsChaptersLoading(false));
  }, [slug]);

  // Завантаження персонажів
  useEffect(() => {
    if (!manga?.slug) return;
    HikkaApiComplete.getMangaCharacters(manga.slug)
      .then((list) =>
        setCharactersList(Array.isArray(list) ? list.slice(0, 20) : []),
      )
      .catch(() => setCharactersList([]));
  }, [manga?.slug]);

  // Завантаження схожої манґи (за жанром)
  useEffect(() => {
    if (!manga?.genres?.length) return;
    const genreSlugs = manga.genres.slice(0, 2).map((g) => g.slug);
    HikkaApiComplete.searchManga({
      genres: genreSlugs,
      sort: ["score:desc"],
      status: [],
      size: 10,
      page: 1,
    })
      .then((res) => {
        const list = (res?.list || []).filter((m) => m.slug !== manga.slug);
        setSimilarList(list.slice(0, 8));
      })
      .catch(() => setSimilarList([]));
  }, [manga?.slug, manga?.genres]);

  // Статус читання Hikka
  useEffect(() => {
    if (!manga?.slug || !HikkaAuthService.isAuthenticated()) return;
    HikkaApiComplete.getReadEntry("manga", manga.slug)
      .then((entry) => {
        if (entry?.status) setReadStatus(entry.status);
        if (entry?.score) setUserScore(entry.score);
      })
      .catch(() => {});
  }, [manga?.slug]);

  // Улюблене
  useEffect(() => {
    if (!manga?.slug || !HikkaAuthService.isAuthenticated()) return;
    const user = HikkaAuthService.getCurrentUser();
    if (!user?.username) return;
    HikkaApiComplete.getUserFavorites("manga", user.username, { size: 100 })
      .then((res) => {
        const slugs = (res?.list || []).map(
          (item) => (item.manga || item)?.slug,
        );
        setIsFavorite(slugs.includes(manga.slug));
      })
      .catch(() => {});
  }, [manga?.slug]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!HikkaAuthService.isAuthenticated()) return;
    try {
      if (isFavorite) {
        await HikkaApiComplete.removeFromFavorites("manga", manga.slug);
        setIsFavorite(false);
      } else {
        await HikkaApiComplete.addToFavorites("manga", manga.slug);
        setIsFavorite(true);
      }
    } catch (err) {
      Logger.error("MangaPreview", "Помилка зміни улюбленого", err);
    }
  }, [isFavorite, manga?.slug]);

  const handleRateManga = useCallback(
    async (score) => {
      if (!HikkaAuthService.isAuthenticated() || !manga?.slug) return;
      try {
        await HikkaApiComplete.addToReadList("manga", manga.slug, {
          status: readStatus || "completed",
          score,
        });
        setUserScore(score);
      } catch (err) {
        Logger.error("MangaPreview", "Помилка оцінювання", err);
      }
    },
    [manga?.slug, readStatus],
  );

  return {
    manga,
    isLoading,
    errorCode,
    charactersList,
    similarList,
    readStatus,
    isFavorite,
    userScore,
    winWidth,
    winHeight,
    initialManga,
    slug,
    handleFavoriteToggle,
    handleRateManga,
    chapters,
    isChaptersLoading,
  };
}

// ==================== Main screen ====================

export default function MangaPreviewPhone({ route }) {
  const s = useAnimePreviewPhoneStyles();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [titleContainerWidth, setTitleContainerWidth] = useState(null);
  const moreSheetRef = useRef(null);

  const {
    manga,
    isLoading,
    errorCode,
    charactersList,
    similarList,
    isFavorite,
    userScore,
    winWidth,
    winHeight,
    initialManga,
    slug,
    handleFavoriteToggle,
    handleRateManga,
    chapters,
    isChaptersLoading,
  } = useMangaPreview({ route });

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
    setTitleContainerWidth(null);
  }, [manga?.slug]);

  const hasChapters = chapters?.length > 0;
  const isReadActive = hasChapters && !isChaptersLoading;

  const getReadButtonLabel = useCallback(() => {
    if (isChaptersLoading) return WatchButtonState.LOADING;
    if (!hasChapters) return WatchButtonState.NO_TRANSLATION;
    return "Читати";
  }, [hasChapters, isChaptersLoading]);

  const handleReadPress = useCallback(() => {
    if (!hasChapters) return;
    navigation.navigate("HiddenStack", {
      screen: "MangaReader",
      params: {
        slug: manga?.slug || slug,
        title: manga?.title_ua || manga?.title_en || manga?.title_original,
        chapters,
      },
    });
  }, [chapters, hasChapters, manga?.slug, manga?.title_en, manga?.title_original, manga?.title_ua, navigation, slug]);

  const handleTitleLayout = useCallback((e) => {
    const lines = e.nativeEvent.lines;
    if (lines?.length > 0) {
      const maxLineWidth = Math.max(...lines.map((line) => line.width));
      setTitleContainerWidth(Math.ceil(maxLineWidth) + 4);
    }
  }, []);

  const renderCharacter = useCallback(
    ({ item }) => (
      <CharacterCard
        item={item}
        width={winWidth * 0.35}
        height={winHeight * 0.22}
      />
    ),
    [winWidth, winHeight],
  );

  const keyExtractorCharacter = useCallback(
    (item) => item?.character?.slug || "",
    [],
  );

  const renderSimilarManga = useCallback(
    ({ item }) => (
      <MangaCard
        manga={item}
        width={winWidth * 0.35}
        showDetails={true}
        onPress={() => navigation.replace("MangaPreview", { manga: item })}
      />
    ),
    [navigation, winWidth],
  );

  // --- Error states ---
  if (!route?.params) {
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

  if (!initialManga && !slug) {
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

  if (!manga) {
    return (
      <DefaultScreenWidget>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text selectable={true} style={[H3, { color: themeColors.text }]}>
            Манґу не знайдено
          </Text>
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget>
      <ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Top section: poster + title */}
        <View style={{ overflow: "hidden" }}>
          <Image
            uri={manga.image}
            style={[StyleSheet.absoluteFill, { opacity: 0.45 }]}
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

          <View style={s.posterContainer}>
            <BloomImage
              uri={manga.image}
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
                s.topButton,
                { backgroundColor: themeColors.subtle, left: 16 },
              ]}
              onPress={() => {
                if (navigation.canGoBack()) navigation.goBack();
                else navigation.navigate("MainTabs", { screen: "Home" });
              }}
            >
              <Icon.ArrowLeft size={32} color={themeColors.primary} />
            </TouchableOpacity>

            {/* More button */}
            <TouchableOpacity
              style={[
                s.topButton,
                { backgroundColor: themeColors.subtle, right: 16 },
              ]}
              onPress={() => moreSheetRef.current?.present()}
            >
              <Icon.DotsThreeVertical size={32} color={themeColors.primary} />
            </TouchableOpacity>
          </View>

          {/* Title + actions */}
          <View style={s.contentContainer}>
            <View style={s.titleWrapper}>
              <View
                style={[
                  s.titleSection,
                  titleContainerWidth && { width: titleContainerWidth },
                ]}
              >
                <Text
                  selectable={true}
                  style={[H3, { color: themeColors.text }]}
                  numberOfLines={2}
                  onTextLayout={handleTitleLayout}
                >
                  {manga.title_ua || manga.title_en || manga.title_original}
                  {manga.year ? ` (${manga.year})` : ""}
                </Text>
                <View style={s.subtitleRow}>
                  <Text
                    selectable={true}
                    style={[
                      H5,
                      { color: themeColors.Text?.(0.6) || themeColors.text },
                    ]}
                  >
                    {manga.title_en || manga.title_original || ""}
                  </Text>
                </View>
              </View>
            </View>

            {/* Favorite button */}
            <View style={s.primaryActionsRow}>
              <WatchButton
                label={getReadButtonLabel()}
                style={{ width: "70%" }}
                onWatchPress={handleReadPress}
                isDownloadable={false}
                isActive={isReadActive}
              />
              <TouchableOpacity
                style={[s.iconButton, { backgroundColor: themeColors.subtle }]}
                onPress={handleFavoriteToggle}
              >
                {(HikkaAuthService.isAuthenticated() ? isFavorite : false) ? (
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
          </View>
        </View>

        {/* Info + content */}
        <View style={[s.contentContainer, { top: 0 }]}>
          {/* Info section */}
          <View
            style={[s.infoSection, { backgroundColor: themeColors.subtle }]}
          >
            {manga?.genres?.length > 0 && (
              <View style={s.iconContainer}>
                <View
                  style={[
                    s.icon,
                    { backgroundColor: themeColors.primary, marginRight: 8 },
                  ]}
                >
                  <Icon.Hash size={24} color={themeColors.inActiveIcon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text selectable style={[H5, { color: themeColors.primary }]}>
                    {manga.genres
                      .slice(0, 3)
                      .map((g) => g.name_ua)
                      .join(", ")}
                  </Text>
                </View>
              </View>
            )}

            <InfoRow
              icon={
                <Icon.CircleDashed size={24} color={themeColors.inActiveIcon} />
              }
              label="Статус"
              value={getStatusText(manga.status)}
              themeColors={themeColors}
            />

            {manga.chapters && (
              <InfoRow
                icon={
                  <Icon.BookOpen size={24} color={themeColors.inActiveIcon} />
                }
                label="Розділів"
                value={String(manga.chapters)}
                themeColors={themeColors}
              />
            )}

            {manga.volumes && (
              <InfoRow
                icon={
                  <Icon.Notebook size={24} color={themeColors.inActiveIcon} />
                }
                label="Томів"
                value={String(manga.volumes)}
                themeColors={themeColors}
              />
            )}

            {manga.rating && (
              <InfoRow
                icon={
                  <Icon.SealWarning
                    size={24}
                    color={themeColors.inActiveIcon}
                  />
                }
                label="Віковий рейтинг"
                value={getAgeRating(manga.rating)}
                themeColors={themeColors}
              />
            )}

            {manga.score > 0 && (
              <InfoRow
                icon={<Icon.Star size={24} color={themeColors.inActiveIcon} />}
                label="Рейтинг Hikka"
                value={manga.score?.toFixed(1) || "N/A"}
                themeColors={themeColors}
              />
            )}
          </View>

          {/* Description */}
          <View style={s.descriptionSection}>
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
                manga?.synopsis_ua ||
                manga?.synopsis_en ||
                "Опис відсутній"
              )?.replaceAll("hikka.io", "aniua.app")}
            </Markdown>
          </View>

          {/* Rating */}
          <View style={s.ratingSection}>
            <Text
              selectable={true}
              style={[H4, s.ratingSectionTitle, { color: themeColors.primary }]}
            >
              Оцінити манґу
            </Text>
            <StarRating
              rating={userScore}
              onRate={handleRateManga}
              themeColors={themeColors}
            />
          </View>

          {/* Characters + Similar + Comments */}
          {(charactersList.length > 0 ||
            similarList.length > 0 ||
            manga?.slug) && (
            <SectionTabs
              tabs={[
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
                similarList.length > 0 && {
                  key: "similar",
                  label: "Схожі",
                  content: (
                    <FlatList
                      horizontal
                      data={similarList}
                      renderItem={renderSimilarManga}
                      keyExtractor={(item) => item.slug}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingRight: 16 }}
                      initialNumToRender={4}
                      windowSize={5}
                    />
                  ),
                },
                manga?.slug && {
                  key: "comments",
                  label: "Коментарі",
                  content: <CommentsSection slug={manga.slug} contentType="manga" />,
                },
              ]}
              defaultTab={
                charactersList.length > 0
                  ? "characters"
                  : similarList.length > 0
                    ? "similar"
                    : "comments"
              }
              themeColors={themeColors}
            />
          )}
        </View>
      </ScrollView>

      {manga && <MangaMoreBottomSheet sheetRef={moreSheetRef} manga={manga} />}
    </DefaultScreenWidget>
  );
}
