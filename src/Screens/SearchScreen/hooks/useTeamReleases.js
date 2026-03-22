import { useState, useCallback } from "react";
import { HikkaApiComplete } from "../../../Sources/HikkaApiComplete";
import Logger from "../../../Logger/Logger";

export function useTeamReleases(sheetRef) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamReleases, setTeamReleases] = useState([]);
  const [isLoading_releases, setIsLoading_releases] = useState(false);

  const handleTeamPress = useCallback(
    async (team) => {
      if (!team?.releases || team.releases.length === 0) {
        Logger.debug("useTeamReleases", "Команда не має релізів", {
          team: team?.name,
        });
        return;
      }

      setSelectedTeam(team);
      setTeamReleases([]);
      setIsLoading_releases(true);
      sheetRef.current?.present();

      try {
        const slugsToLoad = team.releases.slice(0, 20);
        const animeDetails = await Promise.all(
          slugsToLoad.map(async (slug) => {
            try {
              const details = await HikkaApiComplete.getAnimeDetails(slug);
              return details;
            } catch (error) {
              Logger.warn(
                "useTeamReleases",
                `Не вдалося завантажити аніме ${slug}`,
                error,
              );
              return null;
            }
          }),
        );

        const validAnime = animeDetails.filter((anime) => anime !== null);
        setTeamReleases(validAnime);

        Logger.debug("useTeamReleases", "Завантажено релізи команди", {
          team: team.name,
          count: validAnime.length,
        });
      } catch (error) {
        Logger.error("useTeamReleases", "Помилка завантаження релізів", error);
      } finally {
        setIsLoading_releases(false);
      }
    },
    [sheetRef],
  );

  return {
    selectedTeam,
    teamReleases,
    isLoading_releases,
    handleTeamPress,
  };
}
