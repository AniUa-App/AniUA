import { useState, useCallback, useEffect } from "react";
import { HikkaApiComplete } from "../../../Sources/HikkaApiComplete";
import { AniuaApi } from "../../../Api/AniuaApi";
import {
  Statuses,
  Seasons,
  Genres,
  getGenres,
} from "../../../Sources/CustomSet";
import Logger from "../../../Logger/Logger";
import {
  INITIAL_RESULTS,
  INITIAL_SEARCHED,
  INITIAL_FILTERS,
} from "../constants";

export function useSearch() {
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("anime");
  const [resultsByCategory, setResultsByCategory] = useState(INITIAL_RESULTS);
  const [hasSearchedByCategory, setHasSearchedByCategory] =
    useState(INITIAL_SEARCHED);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loadedGenres, setLoadedGenres] = useState([]);
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    getGenres().then((genres) => setLoadedGenres(genres));
  }, []);

  // Автоматично завантажуємо команди при переході на категорію "team" або зміні isVerified
  useEffect(() => {
    if (activeCategory === "team") {
      const loadTeams = async () => {
        setIsLoading(true);
        setHasSearchedByCategory((prev) => ({ ...prev, team: true }));
        try {
          const teamParams = { query: searchText.trim() };
          if (isVerified) {
            teamParams.is_verified = true;
          }
          const teamResponse = await AniuaApi.getTeams(teamParams);
          setResultsByCategory((prev) => ({
            ...prev,
            team: teamResponse?.list || [],
          }));
        } catch (error) {
          Logger.error("useSearch", "Auto-load teams error", error);
          setResultsByCategory((prev) => ({ ...prev, team: [] }));
        } finally {
          setIsLoading(false);
        }
      };
      loadTeams();
    }
  }, [activeCategory, isVerified]);

  const results = resultsByCategory[activeCategory];
  const hasSearched = hasSearchedByCategory[activeCategory];

  const handleSearch = useCallback(async () => {
    const query = searchText.trim();

    setIsLoading(true);
    setHasSearchedByCategory((prev) => ({ ...prev, [activeCategory]: true }));

    try {
      let searchResults = [];

      switch (activeCategory) {
        case "anime":
          const searchParams = {
            query,
            genres: filters.genres.map((g) => Genres[g]).filter(Boolean),
            page: 1,
            size: 30,
          };

          if (filters.status && filters.status !== "Байдуже") {
            searchParams.status = [Statuses[filters.status]];
          }

          if (filters.seasons && filters.seasons !== "Байдуже") {
            searchParams.season = [Seasons[filters.seasons]];
          }

          if (filters.years) {
            searchParams.years = filters.years;
          }

          if (filters.score > 0) {
            searchParams.score = [filters.score, 10];
          }

          const animeResponse =
            await HikkaApiComplete.searchAnime(searchParams);
          const animeList = animeResponse?.list || [];

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
                  "useSearch",
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
          const teamParams = { query };
          if (isVerified) {
            teamParams.is_verified = true;
          }
          const teamResponse = await AniuaApi.getTeams(teamParams);
          searchResults = teamResponse?.list || [];
          break;
      }

      Logger.debug("useSearch", "Search results", {
        category: activeCategory,
        count: searchResults.length,
      });

      setResultsByCategory((prev) => ({
        ...prev,
        [activeCategory]: searchResults,
      }));
    } catch (error) {
      Logger.error("useSearch", "Search error", error);
      setResultsByCategory((prev) => ({ ...prev, [activeCategory]: [] }));
    } finally {
      setIsLoading(false);
    }
  }, [searchText, activeCategory, filters, isVerified]);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    searchText,
    setSearchText,
    activeCategory,
    handleCategoryChange,
    results,
    hasSearched,
    isLoading,
    filters,
    setFilters,
    loadedGenres,
    handleSearch,
    resetFilters,
    isVerified,
    setIsVerified,
  };
}
