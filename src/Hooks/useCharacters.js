import { useState, useEffect, useCallback } from "react";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import Logger from "../Logger/Logger";

/**
 * Хук для завантаження персонажів аніме
 * @param {string} slug - Slug аніме
 * @returns {Object} - { characters, isLoading, error, refetch }
 */
export function useCharacters(slug) {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCharacters = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await HikkaApiComplete.getAnimeCharacters(slug);
      setCharacters(Array.isArray(data) ? data : []);
    } catch (err) {
      Logger.error("useCharacters", `Помилка завантаження персонажів для ${slug}:`, err);
      setError(err);
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    isLoading,
    error,
    refetch: fetchCharacters,
  };
}

export default useCharacters;
