import axios from "axios";
import {
  ANIUA_PROVIDERS_URL,
  ANIUA_ANIME_EPISODES_URL,
  ANIUA_MANGA_CHAPTERS_URL,
} from "./apiEndpoints";
import { Provider, Episode, MangaChapter } from "../../Api/AniuaApi";

// Simple wrapper without shared axios interceptors
const client = axios.create({ timeout: 20000 });

export async function fetchProviders(): Promise<Provider[]> {
  try {
    const res = await client.get(ANIUA_PROVIDERS_URL);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function fetchAnimeEpisodes(slug: string): Promise<Episode[]> {
  try {
    const res = await client.get(ANIUA_ANIME_EPISODES_URL, { params: { slug } });
    const list = Array.isArray(res.data?.episodes) ? res.data.episodes : res.data || [];
    return list as Episode[];
  } catch {
    return [];
  }
}

export async function fetchMangaChapters(slug: string): Promise<MangaChapter[]> {
  try {
    const res = await client.get(ANIUA_MANGA_CHAPTERS_URL, { params: { slug } });
    const raw = res.data?.chapters ?? res.data;
    return Array.isArray(raw) ? (raw as MangaChapter[]) : [];
  } catch {
    return [];
  }
}
