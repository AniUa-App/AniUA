import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return null;
}

/**
 * Програмна навігація до екрану
 * @param {string} name - Назва екрану або стеку
 * @param {object} params - Параметри для екрану
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/**
 * Навігація до екрану AnimePreview за slug
 * @param {string} slug - Slug аніме
 */
export function navigateToAnime(slug) {
  if (navigationRef.isReady() && slug) {
    navigationRef.navigate("HiddenStack", {
      screen: "AnimePreview",
      params: { slug },
    });
  }
}

/**
 * Навігація до екрану MangaPreview за slug
 * @param {string} slug - Slug манґи
 */
export function navigateToManga(slug) {
  if (navigationRef.isReady() && slug) {
    navigationRef.navigate("HiddenStack", {
      screen: "MangaPreview",
      params: { slug },
    });
  }
}
