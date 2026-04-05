import React from "react";
import Icon from "../../Styles/Icons";
import { MoonIcon, AshdiIcon } from "../../Styles/Icons";
import { EpisodesByPlayerAndTeam, Episode, MangaChapter } from "../../Api/AniuaApi";
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
  hikkaData: Record<string, any>,
  slug: string
): EpisodesByPlayerAndTeam => {
  const result: EpisodesByPlayerAndTeam = {};
  const ignoredPlayers = ["vidking", "tortuga"];

  // Новий формат: { episodes: [...], team: "...", slug: "..." }
  if (hikkaData.episodes && Array.isArray(hikkaData.episodes)) {
    hikkaData.episodes.forEach((ep: any, index: number) => {
      const player = ep.player || "unknown";
      const teamName = ep.team || hikkaData.team || "Невідомо";

      if (ignoredPlayers.includes(player.toLowerCase())) return;

      if (!result[player]) {
        result[player] = {};
      }
      if (!result[player][teamName]) {
        result[player][teamName] = [];
      }

      result[player][teamName].push({
        id: ep.id || index,
        created_at: ep.created_at || "",
        slug: ep.slug || slug,
        imdb_id: ep.imdb_id || null,
        mal_id: ep.mal_id || null,
        player: player,
        player_id: ep.player_id || ep.episode_id || "",
        team: teamName,
        episode: ep.episode || index + 1,
        poster: ep.poster || null,
        video_url: ep.video_url || ep.video || "",
        m3u8: ep.m3u8 || null,
        real_url: ep.real_url || null,
        name_ua: ep.name_ua || null,
        name_en: ep.name_en || null,
        name_jp: ep.name_jp || null,
      });
    });

    // Сортуємо епізоди
    Object.values(result).forEach((teams) => {
      Object.values(teams).forEach((eps) => {
        eps.sort((a, b) => a.episode - b.episode);
      });
    });

    return result;
  }

  // Старий формат: { "ashdi": { "Team": [...] }, "moon": { ... } }
  Object.entries(hikkaData).forEach(([player, teams]) => {
    if (ignoredPlayers.includes(player.toLowerCase())) return;

    if (typeof teams === "object" && teams !== null && !Array.isArray(teams)) {
      result[player] = {};
      Object.entries(teams as Record<string, any[]>).forEach(([teamName, episodes]) => {
        if (Array.isArray(episodes)) {
          result[player][teamName] = episodes.map((ep, index) => ({
            id: ep.id || index,
            created_at: ep.created_at || "",
            slug: slug,
            imdb_id: ep.imdb_id || null,
            mal_id: ep.mal_id || null,
            player: player,
            player_id: ep.player_id || ep.episode_id || "",
            team: teamName,
            episode: ep.episode || index + 1,
            poster: ep.poster || null,
            video_url: ep.video || ep.video_url || "",
            m3u8: ep.m3u8 || null,
            real_url: ep.real_url || null,
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

export const convertMangaChaptersToEpisodes = (
  chapters: MangaChapter[],
  slug: string,
): EpisodesByPlayerAndTeam => {
  const result: EpisodesByPlayerAndTeam = {};

  chapters.forEach((ch, index) => {
    const player = ch.provider_slug || "manga";
    const team = ch.translation || ch.team || ch.language || "Переклад";
    if (!result[player]) result[player] = {};
    if (!result[player][team]) result[player][team] = [];

    const ep: Episode = {
      id: ch.reference || `${slug}-${index}`,
      created_at: "",
      slug,
      imdb_id: null,
      mal_id: null,
      player,
      player_id: ch.reference || `${slug}-${index}`,
      team,
      episode: Number(ch.number) || index + 1,
      poster: null,
      video_url: "",
      m3u8: null,
      real_url: null,
      name_ua: ch.title || null,
      name_en: ch.title || null,
      name_jp: null,
    };

    result[player][team].push(ep);
  });

  Object.values(result).forEach((teams) => {
    Object.values(teams).forEach((eps) => eps.sort((a, b) => a.episode - b.episode));
  });

  return result;
};
