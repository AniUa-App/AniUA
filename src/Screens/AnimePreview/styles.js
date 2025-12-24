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
});

// Phone-specific styles - New redesigned layout
export const phoneStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },

  // Poster section
  posterContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  posterGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
  },

  // Content container
  contentContainer: {
    padding: 16,
    paddingTop: 20,
  },

  // Title section
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    lineHeight: 28,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
  },

  // Primary actions row (Watch, Download, Favorite)
  primaryActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  watchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  watchButtonText: {
    fontWeight: "600",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // Genres tags
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },

  // Info section
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 10,
  },
  infoIcon: {
    width: 24,
    alignItems: "center",
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: "500",
  },

  // Description
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    lineHeight: 22,
    opacity: 0.9,
  },
  sourceText: {
    marginTop: 12,
    opacity: 0.6,
  },

  // Rating section
  ratingSection: {
    marginBottom: 24,
    alignItems: "center",
  },
  ratingSectionTitle: {
    marginBottom: 12,
    opacity: 0.8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    padding: 4,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabActive: {
    // backgroundColor will be set dynamically
  },
  tabInactive: {
    // backgroundColor will be set dynamically
  },

  // Section header
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: "600",
  },

  // Similar anime
  similarContainer: {
    marginBottom: 24,
  },
  similarCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  similarImage: {
    borderRadius: 16,
  },
  similarCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },

  // Characters
  charactersContainer: {
    marginBottom: 24,
  },
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

  // Legacy styles for compatibility
  actionsRow: {
    marginTop: 9,
    gap: "14%",
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
  continueWatchingBtn: {
    borderRadius: 8,
    padding: 10,
    margin: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagItem: {
    marginRight: 8,
    marginBottom: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
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
  playTrailerBtn: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: 40,
    left: 20,
    padding: 10,
    borderRadius: 8,
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
    case 'tv':
      return tvStyles;
    case 'tablet':
      return tabletStyles;
    default:
      return phoneStyles;
  }
}
