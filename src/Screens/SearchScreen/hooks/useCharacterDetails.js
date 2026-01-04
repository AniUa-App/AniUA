import { useState, useCallback } from "react";
import { HikkaApiComplete } from "../../../Sources/HikkaApiComplete";
import Logger from "../../../Logger/Logger";

export function useCharacterDetails(sheetRef) {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterAnimeList, setCharacterAnimeList] = useState([]);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(false);

  const handleCharacterPress = useCallback(
    async (character) => {
      if (!character?.slug) {
        Logger.debug("useCharacterDetails", "Персонаж без slug", { character });
        return;
      }

      setSelectedCharacter(character);
      setCharacterAnimeList([]);
      setIsLoadingCharacter(true);
      sheetRef.current?.present();

      try {
        const animeList =
          (await HikkaApiComplete.getCharacterAnime(character.slug)) || [];

        const detailedAnime = await Promise.all(
          animeList.map(async (item) => {
            try {
              const anime = item.anime || item;
              if (!anime?.slug) return null;
              const details = await HikkaApiComplete.getAnimeDetails(anime.slug);
              return details || anime;
            } catch (error) {
              Logger.warn(
                "useCharacterDetails",
                `Не вдалося завантажити аніме для персонажа`,
                error
              );
              return item.anime || item;
            }
          })
        );

        const validAnime = detailedAnime.filter((anime) => anime !== null);
        setCharacterAnimeList(validAnime);

        Logger.debug("useCharacterDetails", "Завантажено аніме персонажа", {
          character: character.name_ua || character.name_en,
          count: validAnime.length,
        });
      } catch (error) {
        Logger.error(
          "useCharacterDetails",
          "Помилка завантаження аніме персонажа",
          error
        );
      } finally {
        setIsLoadingCharacter(false);
      }
    },
    [sheetRef]
  );

  return {
    selectedCharacter,
    characterAnimeList,
    isLoadingCharacter,
    handleCharacterPress,
  };
}
