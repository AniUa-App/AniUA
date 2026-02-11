import { Dimensions, Platform, useWindowDimensions } from "react-native";

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
  if (longest >= 1180) return 980; // iPad Air/Pro 11
  if (longest >= 1080) return 900; // Many 10-11" Android tablets
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

// MD3 navbar (vertical) width used on tablet landscape
export function getNavbarWidth() {
  const { width } = getDims();
  // Slightly narrower than sidebar to fit MD3 compact rail
  if (width >= 1366) return 120;
  if (width >= 1180) return 108;
  if (width >= 1080) return 96;
  return 84;
}

// Reactive hooks that update on rotation using useWindowDimensions
export function useIsTablet() {
  const { width, height } = useWindowDimensions();
  const shortest = Math.min(width, height);
  return shortest >= 600 || (Platform.OS === "ios" && Platform.isPad === true);
}

export function useIsLandscape() {
  const { width, height } = useWindowDimensions();
  return width > height;
}

export function useIsTabletLandscape() {
  const tablet = useIsTablet();
  const landscape = useIsLandscape();
  return tablet && landscape;
}

// TV detection - Android TV typically has uiMode set to 'tv'
// Also check for large landscape screens without touch
export function isTV() {
  const { width, height } = getDims();
  const longest = Math.max(width, height);
  const shortest = Math.min(width, height);

  // Android TV detection via Platform
  if (Platform.isTV) return true;

  // Heuristic: Large screen (1080p+) with wide aspect ratio
  // TVs typically have 16:9 or wider ratio and 1920+ width
  const aspectRatio = longest / shortest;
  return longest >= 1920 && aspectRatio >= 1.7;
}

export function useIsTV() {
  const { width, height } = useWindowDimensions();
  const longest = Math.max(width, height);
  const shortest = Math.min(width, height);

  if (Platform.isTV) return true;

  const aspectRatio = longest / shortest;
  return longest >= 1920 && aspectRatio >= 1.7;
}

// Get device type for component selection
export function getDeviceType() {
  if (isTV()) return "tv";
  if (isTabletLandscape()) return "tablet";
  return "phone";
}

export function useDeviceType() {
  const tv = useIsTV();
  const tabletLandscape = useIsTabletLandscape();

  if (tv) return "tv";
  if (tabletLandscape) return "tablet";
  return "phone";
}

// Hook to detect tablet in portrait mode
export function useIsTabletPortrait() {
  const tablet = useIsTablet();
  const landscape = useIsLandscape();
  return tablet && !landscape;
}

// Hook to calculate optimal number of grid columns based on screen width
export function useGridColumns(minCardWidth = 180) {
  const { width } = useWindowDimensions();
  const isTabletDevice = useIsTablet();
  const tvDevice = useIsTV();

  if (tvDevice) {
    const availableWidth = width - 64; // 32px padding each side
    const columns = Math.floor(availableWidth / minCardWidth);
    return Math.max(4, Math.min(columns, 7));
  }

  if (!isTabletDevice) return 1;

  // Calculate columns based on available width and minimum card width
  // Account for padding (16px on each side)
  const availableWidth = width - 32;
  const columns = Math.floor(availableWidth / minCardWidth);

  return Math.max(2, Math.min(columns, 4)); // Between 2-4 columns
}

// Static version of grid columns (for non-hook contexts)
export function getGridColumns(minCardWidth = 180) {
  const { width } = getDims();

  if (isTV()) {
    const availableWidth = width - 64;
    const columns = Math.floor(availableWidth / minCardWidth);
    return Math.max(4, Math.min(columns, 7));
  }

  if (!isTablet()) return 1;

  const availableWidth = width - 32;
  const columns = Math.floor(availableWidth / minCardWidth);

  return Math.max(2, Math.min(columns, 4));
}

// TV sidebar width
export function getTVSidebarWidth() {
  return 220;
}

// TV layout hook
export function useTVLayout() {
  const { width } = useWindowDimensions();
  const sidebarWidth = getTVSidebarWidth();
  const contentWidth = width - sidebarWidth;
  const columns = Math.max(4, Math.min(Math.floor((contentWidth - 64) / 200), 7));

  return { sidebarWidth, contentWidth, columns };
}
