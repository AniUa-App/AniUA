import { StyleSheet } from "react-native";

// Base styles shared across all device types
export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  continueWatchingBtn: {
    borderRadius: 8,
    padding: 10,
    margin: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  posterContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 10,
    zIndex: 10,
    padding: 4,
    borderRadius: 8,
  },
  ratingContainer: {
    position: "absolute",
    top: 50,
    right: 0,
    padding: 8,
    paddingRight: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#fff",
    fontSize: 18,
    marginRight: 4,
  },
  playTrailerBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 40,
    left: 20,
    padding: 10,
    borderRadius: 8,
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 8,
  },
  yearEpisodes: {
    color: "#888",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  ageLimitContainer: {
    backgroundColor: "#333",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ageLimitText: {
    color: "#fff",
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagItem: {
    marginRight: 8,
    marginBottom: 4,
  },
  descriptionText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 16,
  },
  actionsRow: {
    marginTop: 9,
    gap: 14,
    justifyContent: "center",
    flexDirection: "row",
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 6,
  },
  actionButtonText: {
    color: "#fff",
    marginLeft: 4,
  },
  similarTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  similarContainer: {
    flexDirection: "row",
  },
  similarCard: {
    marginRight: 16,
  },
  similarImage: {
    marginBottom: 4,
    borderRadius: 16,
  },
  similarText: {
    color: "#ccc",
    fontSize: 12,
  },
  // Characters styles
  characterCard: {
    marginRight: 12,
    alignItems: "center",
    width: 100,
  },
  characterImage: {
    borderRadius: 50,
    marginBottom: 8,
  },
  characterName: {
    textAlign: "center",
    fontSize: 12,
  },
});

// Tablet-specific styles
export const tabletStyles = StyleSheet.create({
  ...baseStyles,
  contentContainer: {
    ...baseStyles.contentContainer,
    padding: 20,
  },
  actionsRow: {
    ...baseStyles.actionsRow,
    gap: "10%",
  },
  sidePanel: {
    width: "40%",
  },
  mainPanel: {
    width: "60%",
    padding: 20,
  },
});

// TV-specific styles
export const tvStyles = StyleSheet.create({
  ...baseStyles,
  contentContainer: {
    ...baseStyles.contentContainer,
    padding: 32,
  },
  actionsRow: {
    ...baseStyles.actionsRow,
    gap: 24,
  },
  actionButton: {
    ...baseStyles.actionButton,
    width: 64,
    height: 64,
  },
  backButton: {
    ...baseStyles.backButton,
    top: 40,
    left: 40,
    padding: 8,
  },
  ratingContainer: {
    ...baseStyles.ratingContainer,
    top: 40,
    padding: 12,
  },
  focusedButton: {
    borderWidth: 3,
    borderColor: "#fff",
    transform: [{ scale: 1.1 }],
  },
  sidePanel: {
    width: "35%",
  },
  mainPanel: {
    width: "65%",
    padding: 32,
  },
});

// Get styles based on device type
export function getStyles(deviceType) {
  switch (deviceType) {
    case "tv":
      return tvStyles;
    case "tablet":
      return tabletStyles;
    default:
      return phoneStyles;
  }
}
