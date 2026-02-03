import { StyleSheet } from "react-native";

// Shared styles for Download screens
export const styles = StyleSheet.create({
  // Card container (list mode)
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  // Card container (grid mode)
  gridCardContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  animeImage: {
    borderRadius: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    height: "100%",
  },
  gridInfoContainer: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  downloadButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
    borderRadius: 8,
    right: 0,
    bottom: 8,
  },
  gridDownloadButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    right: 4,
    top: 4,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyMessage: {
    textAlign: "center",
    padding: "5%",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  gridContainer: {
    paddingHorizontal: 8,
  },
  gridColumnWrapper: {
    justifyContent: "flex-start",
  },
});

// Get grid item width based on number of columns
export function getGridItemWidth(screenWidth, numColumns, padding = 16) {
  const availableWidth = screenWidth - padding * 2;
  return Math.floor(availableWidth / numColumns);
}
