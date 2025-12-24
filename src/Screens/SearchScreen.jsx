import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { AniuaApi } from "../Sources/AniuaApi";
import AnimePreviewWidget from "../Widgets/AnimePreviewWidget";
import Logger from "../Logger/Logger";
import DubComponent from "../Components/DubComponent";
import CharacterComponent from "../Components/CharacterComponen";
import { Statuses, Seasons, Genres, getGenres } from "../Sources/CustomSet";
import SearchHeaderComponent from "../Components/SearchHeaderComponent";
import SearchCategoryTabsComponent from "../Components/SearchCategoryTabsComponent";
import SearchEmptyStateComponent from "../Components/SearchEmptyStateComponent";
import SearchFilterBottomSheet from "../Components/SearchFilterBottomSheet";
import TeamReleasesBottomSheet from "../Components/TeamReleasesBottomSheet";
import CharacterDetailBottomSheet from "../Components/CharacterDetailBottomSheet";

const SEARCH_CATEGORIES = [
  { id: "anime", label: "Аніме", icon: "MonitorPlay" },
  //  { id: "manga", label: "Манга", icon: "BookOpen" },
  { id: "character", label: "Персонаж", icon: "User" },
  { id: "team", label: "Команда", icon: "Microphone" },
  //  { id: "user", label: "Люди", icon: "UserCircle" },
];

const INITIAL_RESULTS = {
  anime: [],
  manga: [],
  character: [],
  team: [],
};

const INITIAL_SEARCHED = {
  anime: false,
  manga: false,
  character: false,
  team: false,
};

// Початкові значення фільтрів
const INITIAL_FILTERS = {
  status: "Байдуже",
  seasons: "Байдуже",
  years: [2000, new Date().getFullYear()],
  score: 0,
  genres: [],
};

export default function SearchScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const filterSheetRef = useRef(null);
  const teamReleasesSheetRef = useRef(null);
  const characterSheetRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("anime");
  const [resultsByCategory, setResultsByCategory] = useState(INITIAL_RESULTS);
  const [hasSearchedByCategory, setHasSearchedByCategory] =
    useState(INITIAL_SEARCHED);
  const [isLoading, setIsLoading] = useState(false);

  // Стейт фільтрів
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loadedGenres, setLoadedGenres] = useState([]);

  // Стейт для релізів команди
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamReleases, setTeamReleases] = useState([]);
  const [isLoadingReleases, setIsLoadingReleases] = useState(false);

  // Стейт для деталей персонажа
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterAnimeList, setCharacterAnimeList] = useState([]);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(false);

  // Завантаження жанрів при монтуванні
  useEffect(() => {
    getGenres().then((genres) => setLoadedGenres(genres));
  }, []);

  const results = resultsByCategory[activeCategory];
  const hasSearched = hasSearchedByCategory[activeCategory];

  const headerPaddingTop = useMemo(
    () => Math.max(insets.top, StatusBar.currentHeight || 0) + 10,
    [insets.top]
  );

  const handleSearch = useCallback(async () => {
    const query = searchText.trim();
    if (!query) return;

    setIsLoading(true);
    setHasSearchedByCategory((prev) => ({ ...prev, [activeCategory]: true }));

    try {
      let searchResults = [];

      switch (activeCategory) {
        case "anime":
          // Формуємо параметри пошуку з фільтрами
          const searchParams = {
            query,
            genres: filters.genres.map((g) => Genres[g]).filter(Boolean),
            page: 1,
            size: 30,
          };

          // Додаємо статус якщо обрано
          if (filters.status && filters.status !== "Байдуже") {
            searchParams.status = [Statuses[filters.status]];
          }

          // Додаємо сезон якщо обрано
          if (filters.seasons && filters.seasons !== "Байдуже") {
            searchParams.season = [Seasons[filters.seasons]];
          }

          // Додаємо роки
          if (filters.years) {
            searchParams.years = filters.years;
          }

          // Додаємо мінімальну оцінку
          if (filters.score > 0) {
            searchParams.score = [filters.score, 10];
          }

          const animeResponse =
            await HikkaApiComplete.searchAnime(searchParams);
          const animeList = animeResponse?.list || [];
          // Завантажуємо повні деталі для кожного аніме (включаючи жанри)
          const detailedAnime = await Promise.all(
            animeList.map(async (anime) => {
              const details = await HikkaApiComplete.getAnimeDetails(
                anime.slug
              );
              return details || anime;
            })
          );
          searchResults = detailedAnime;
          break;

        case "manga":
          const mangaResponse = await HikkaApiComplete.searchManga({
            query,
            page: 1,
            size: 30,
          });
          searchResults = mangaResponse?.list || [];
          break;

        case "character":
          const charResponse = await HikkaApiComplete.searchCharacters({
            query,
            page: 1,
            size: 30,
          });
          const characterList = charResponse?.list || [];

          const detailedCharacters = await Promise.all(
            characterList.map(async (character) => {
              if (!character?.slug) return character;
              try {
                const details = await HikkaApiComplete.getCharacterDetails(
                  character.slug
                );
                return details ? { ...character, ...details } : character;
              } catch (error) {
                Logger.warn(
                  "SearchScreen",
                  `Не вдалося завантажити персонажа ${character.slug}`,
                  error
                );
                return character;
              }
            })
          );

          searchResults = detailedCharacters.filter((character) => {
            const description =
              character?.description_ua || character?.description || "";
            return description.trim().length > 0;
          });
          break;

        case "team":
          const teamResponse = await AniuaApi.getTeams({
            query,
          });
          searchResults = teamResponse?.list || [];
          break;
      }

      Logger.debug("SearchScreen", "Search results", {
        category: activeCategory,
        count: searchResults.length,
      });

      setResultsByCategory((prev) => ({
        ...prev,
        [activeCategory]: searchResults,
      }));
    } catch (error) {
      Logger.error("SearchScreen", "Search error", error);
      setResultsByCategory((prev) => ({ ...prev, [activeCategory]: [] }));
    } finally {
      setIsLoading(false);
    }
  }, [searchText, activeCategory, filters]);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const handleItemPress = useCallback(
    (item) => {
      if (activeCategory === "anime") {
        navigation.navigate("HiddenStack", {
          screen: "AnimePreview",
          params: { anime: item },
        });
      } else if (activeCategory === "team") {
        Linking.openURL(item?.telegram || item?.tg);
      }
    },
    [activeCategory, navigation]
  );

  // Обробка натискання на команду - показати релізи
  const handleTeamPress = useCallback(async (team) => {
    if (!team?.releases || team.releases.length === 0) {
      Logger.debug("SearchScreen", "Команда не має релізів", {
        team: team?.name,
      });
      return;
    }

    setSelectedTeam(team);
    setTeamReleases([]);
    setIsLoadingReleases(true);
    teamReleasesSheetRef.current?.present();

    try {
      // Завантажуємо деталі аніме для кожного slug (максимум 20)
      const slugsToLoad = team.releases.slice(0, 20);
      const animeDetails = await Promise.all(
        slugsToLoad.map(async (slug) => {
          try {
            const details = await HikkaApiComplete.getAnimeDetails(slug);
            return details;
          } catch (error) {
            Logger.warn(
              "SearchScreen",
              `Не вдалося завантажити аніме ${slug}`,
              error
            );
            return null;
          }
        })
      );

      // Фільтруємо null значення
      const validAnime = animeDetails.filter((anime) => anime !== null);
      setTeamReleases(validAnime);

      Logger.debug("SearchScreen", "Завантажено релізи команди", {
        team: team.name,
        count: validAnime.length,
      });
    } catch (error) {
      Logger.error("SearchScreen", "Помилка завантаження релізів", error);
    } finally {
      setIsLoadingReleases(false);
    }
  }, []);

  // Обробка натискання на персонажа - показати деталі
  const handleCharacterPress = useCallback(async (character) => {
    if (!character?.slug) {
      Logger.debug("SearchScreen", "Персонаж без slug", { character });
      return;
    }

    setSelectedCharacter(character);
    setCharacterAnimeList([]);
    setIsLoadingCharacter(true);
    characterSheetRef.current?.present();

    try {
      // Завантажуємо аніме персонажа
      const animeList = await HikkaApiComplete.getCharacterAnime(
        character.slug
      ) || [];

      // Завантажуємо деталі для кожного аніме
      const detailedAnime = await Promise.all(
        animeList.map(async (item) => {
          try {
            const anime = item.anime || item;
            if (!anime?.slug) return null;
            const details = await HikkaApiComplete.getAnimeDetails(anime.slug);
            return details || anime;
          } catch (error) {
            Logger.warn(
              "SearchScreen",
              `Не вдалося завантажити аніме для персонажа`,
              error
            );
            return item.anime || item;
          }
        })
      );

      const validAnime = detailedAnime.filter((anime) => anime !== null);
      setCharacterAnimeList(validAnime);

      Logger.debug("SearchScreen", "Завантажено аніме персонажа", {
        character: character.name_ua || character.name_en,
        count: validAnime.length,
      });
    } catch (error) {
      Logger.error(
        "SearchScreen",
        "Помилка завантаження аніме персонажа",
        error
      );
    } finally {
      setIsLoadingCharacter(false);
    }
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderSearchResult = useCallback(
    ({ item }) => {
      switch (activeCategory) {
        case "anime":
          return (
            <AnimePreviewWidget
              anime={item}
              info={{}}
              updateInfo={() => {}}
              type="Search"
            />
          );
        case "character":
          return (
            <CharacterComponent item={item} onPress={handleCharacterPress} />
          );
        case "team":
          return (
            <DubComponent
              logo={item?.logo}
              name={item?.name}
              subtitle={`${item?.status} ${item?.is_verified ? "• " + (item?.releases?.length || 0) + " релізів" : ""}`}
              isPartner={item?.is_verified}
              onBodyClick={() => {
                if (item?.is_verified) {
                  handleTeamPress(item);
                }
              }}
              onButtonClick={() => handleItemPress(item)}
              icon={<Icons.TelegramLogo size={32} color={themeColors.text} />}
            />
          );
        default:
          return null;
      }
    },
    [
      activeCategory,
      searchText,
      handleItemPress,
      handleTeamPress,
      handleCharacterPress,
      themeColors.text,
    ]
  );

  const keyExtractor = useCallback(
    (item, index) => item.slug || item.reference || `${index}`,
    []
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <SearchHeaderComponent
        searchText={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        onGoBack={handleGoBack}
        onFilterPress={() => filterSheetRef.current?.present()}
        paddingTop={headerPaddingTop}
        placeholder="Пошук аніме..."
        autoFocus={true}
      />

      <SearchCategoryTabsComponent
        categories={SEARCH_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Results */}
      {isLoading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: themeColors.accent },
          ]}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderSearchResult}
          ListEmptyComponent={
            <SearchEmptyStateComponent
              hasSearched={hasSearched}
              isLoading={isLoading}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.resultsContainer,
            { backgroundColor: themeColors.accent },
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={8}
        />
      )}

      {/* Filter BottomSheet */}
      <SearchFilterBottomSheet
        sheetRef={filterSheetRef}
        filters={filters}
        loadedGenres={loadedGenres}
        onApply={(newFilters) => {
          setFilters(newFilters);
          filterSheetRef.current?.close();
        }}
        onReset={() => {
          setFilters(INITIAL_FILTERS);
        }}
      />

      {/* Team Releases BottomSheet */}
      <TeamReleasesBottomSheet
        sheetRef={teamReleasesSheetRef}
        selectedTeam={selectedTeam}
        teamReleases={teamReleases}
        isLoading={isLoadingReleases}
        navigation={navigation}
      />

      {/* Character Detail BottomSheet */}
      <CharacterDetailBottomSheet
        sheetRef={characterSheetRef}
        character={selectedCharacter}
        animeList={characterAnimeList}
        isLoading={isLoadingCharacter}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    flexGrow: 1,
  },
});
