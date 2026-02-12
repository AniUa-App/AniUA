import { StyleSheet } from "react-native";

// Shared styles for Bookmark screens
export const styles = StyleSheet.create({
  // List content container
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  // Loader container
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "5%",
    color: "grey",
  },
  // Grid specific styles (tablet)
  gridContainer: {
    paddingHorizontal: 8,
  },
  gridColumnWrapper: {
    justifyContent: "flex-start",
  },
});

// Get grid item width based on number of columns
export function getGridItemWidth(screenWidth, numColumns, padding = 16) {
  const availableWidth = screenWidth - padding * 5;
  return Math.floor(availableWidth / numColumns);
}

// Status titles mapping
export const STATUS_TITLES = {
  favourite: "Улюблене",
  watching: "Дивлюсь",
  completed: "Переглянуто",
  planned: "Заплановано",
  dropped: "Закинуто",
};
