import { Dimensions, Platform } from "react-native";

const getDims = () => Dimensions.get("window");

export function isTablet() {
  const { width, height } = getDims();
  const shortest = Math.min(width, height);
  // Heuristic: 600dp+ shortest side is commonly treated as tablet
  // Also consider iPad detection on iOS
  return shortest >= 600 || (Platform.OS === "ios" && Platform.isPad === true);
}

export function maxContentWidth() {
  const { width, height } = getDims();
  const longest = Math.max(width, height);
  // Choose a pleasant readable width cap for typical tablet sizes
  if (longest >= 1366) return 1024; // iPad Pro 12.9, large Android tablets
  if (longest >= 1180) return 980;  // iPad Air/Pro 11
  if (longest >= 1080) return 900;  // Many 10-11" Android tablets
  return 820; // Small tablets
}

export function horizontalPadding() {
  return isTablet() ? 24 : 16;
}

export function verticalPadding() {
  return isTablet() ? 16 : 8;
}

export function isLandscape() {
  const { width, height } = getDims();
  return width > height;
}

export function isTabletLandscape() {
  return isTablet() && isLandscape();
}

export function getSidebarWidth() {
  const { width } = getDims();
  // Sidebar width based on screen size
  if (width >= 1366) return 200; // Large tablets
  if (width >= 1180) return 180; // iPad Air/Pro
  if (width >= 1080) return 160; // Medium tablets
  return 140; // Small tablets
}

export function getNavbarWidth() {
  return isTabletLandscape() ? 80 : "100%";
}
