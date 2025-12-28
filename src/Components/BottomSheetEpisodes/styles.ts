import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  screensContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
    padding: 0,
    margin: 0,
  },
  screen: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
  },
  dubbingScreen: {},
  // Player Type Selector
  playerTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  playerTypeTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 16,
  },
  // Dubbing Button
  dubbingButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 6,
  },
  playerIndicator: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dubbingChip: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  // Player Tabs
  playerTabsContainer: {
    paddingHorizontal: 16,
    height: 44,
    gap: 8,
  },
  playerTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  // Episodes
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 60,
  },
  episodeItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  episodeContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  episodePoster: {
    width: 100,
    height: 64,
    borderRadius: 8,
  },
  episodeInfo: {
    flex: 1,
    gap: 8,
  },
  shareButton: {
    padding: 4,
  },
  // Dubbings
  dubbingListContent: {
    paddingHorizontal: 8,
    paddingBottom: 60,
  },
  // Scroll button
  scrollButton: {
    position: "absolute",
    bottom: 80,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  scrollButtonInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  // Error/Loading
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareButtonContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,

    alignItems: "stretch",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
});
