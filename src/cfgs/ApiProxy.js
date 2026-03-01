import { Platform } from "react-native";

/**
 * On web, routes API calls through the local CORS proxy (web/proxy-server.js).
 * On native, returns the original URL unchanged.
 */

const PROXY_BASE = "http://localhost:3001";

const PROXY_MAP = {
  "https://api-aniua.yuzka.site": `${PROXY_BASE}/api/aniua`,
  "https://api.hikka.io": `${PROXY_BASE}/api/hikka`,
  "https://api.hikka-features.pp.ua": `${PROXY_BASE}/api/hikka-features`,
};

/**
 * Resolves API base URL — applies proxy on web, returns original on native.
 * @param {string} originalUrl
 * @returns {string}
 */
export function resolveApiUrl(originalUrl) {
  if (Platform.OS !== "web") return originalUrl;

  // Strip trailing slash for matching
  const normalized = originalUrl.replace(/\/$/, "");
  return PROXY_MAP[normalized] ?? originalUrl;
}
