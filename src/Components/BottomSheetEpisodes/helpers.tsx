import React from "react";
import Icon from "../../Styles/Icons";
import { MoonIcon, AshdiIcon } from "../../Styles/Icons";
import { EpisodesByPlayerAndTeam } from "../../Sources/AniuaApi";
import { Player } from "./types";

export const getPlayerInfo = (playerName: string, themeColors: any): Player => {
  switch (playerName) {
    case "moon":
      return {
        name: playerName,
        icon: <MoonIcon styles={{ width: 24, height: 24 }} />,
      };
    case "ashdi":
      return {
        name: playerName,
        icon: <AshdiIcon styles={{ width: 24, height: 24 }} />,
      };
    default:
      return {
        name: playerName,
        icon: <Icon.MonitorPlay size={24} color={themeColors.text} />,
      };
  }
};

export const convertHikkaEpisodes = (
  hikkaData: Record<string, Record<string, any[]>>,
  slug: string
): EpisodesByPlayerAndTeam => {
  const result: EpisodesByPlayerAndTeam = {};

  // Плеєри які потрібно ігнорувати
  const ignoredPlayers = ["vidking"];

  Object.entries(hikkaData).forEach(([player, teams]) => {
    // Пропускаємо ігноровані плеєри
    if (ignoredPlayers.includes(player.toLowerCase())) {
      return;
    }

    if (typeof teams === "object" && teams !== null) {
      result[player] = {};
      Object.entries(teams).forEach(([teamName, episodes]) => {
        if (Array.isArray(episodes)) {
          result[player][teamName] = episodes.map((ep, index) => ({
            id: ep.id || index,
            created_at: ep.created_at || "",
            slug: slug,
            imdb_id: ep.imdb_id || null,
            mal_id: ep.mal_id || null,
            player: player,
            player_id: ep.player_id || "",
            team: teamName,
            episode: ep.episode || index + 1,
            poster: ep.poster || null,
            video_url: ep.video || ep.video_url || "",
            name_ua: ep.name_ua || null,
            name_en: ep.name_en || null,
            name_jp: ep.name_jp || null,
          }));
        }
      });
    }
  });

  return result;
};
