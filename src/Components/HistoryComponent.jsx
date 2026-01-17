import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { AnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import SettingsStorage from "../Storage/SettingsStorage";
import UserStorage from "../Storage/UserStorage";
import { useThemeColors } from "../Global/useTheme";
import { EventBus } from "../Global/EventBus";

const HistoryComponent = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const showHistory = SettingsStorage.getParameter("showHistory") !== "false"
  const colors = useThemeColors();
  const user = UserStorage.getUser();

  const fetchHistory = useCallback(async () => {
    if (!showHistory || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const historyData = await HikkaApiComplete.getUserHistory(user.username);
      setHistory(historyData.list.map(item => item.anime));
    } catch (error) {
      console.error("Error fetching user history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showHistory, user]);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Listen for history updates from other components
  useEffect(() => {
    const unsubscribe = EventBus.on("historyUpdated", () => {
      // Debounce: wait a bit for Hikka API to process the update
      setTimeout(() => {
        fetchHistory();
      }, 1000);
    });
    return unsubscribe;
  }, [fetchHistory]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!showHistory || history.length === 0) {
    return null;
  }

  return (
    <AnimeListHorizontal
      title="Історія переглядів"
      animeList={history}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    height: 200,
  },
});

export default HistoryComponent;
