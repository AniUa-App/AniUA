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
  dubbingScreen: {
    // Для другого екрану вибору озвучки
  },
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
    justifyContent: "space-between",
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
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    marginVertical: 4,
  },
  episodeContent: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  episodePoster: {
    borderRadius: 16,
    width: 160,
    height: 90,
  },
  episodeInfo: {
    justifyContent: "center",
    flex: 1,
  },
  downloadButton: {
    borderRadius: 12,
    position: "absolute",
    right: 2,
    bottom: 4,
  },
  downloadButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: "98%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: "center",
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
    width: 44,
    height: 44,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
});
