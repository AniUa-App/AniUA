import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { AnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import SettingsStorage from "../Storage/SettingsStorage";
import UserStorage from "../Storage/UserStorage";
import { useThemeColors } from "../Global/useTheme";

const HistoryComponent = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const showHistory = SettingsStorage.getParameter("showHistory") !== "false"
  const colors = useThemeColors();
  const user = UserStorage.getUser();

  useEffect(() => {
    if (!showHistory || !user) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const historyData = await HikkaApiComplete.getUserHistory(user.username);
        setHistory(historyData.list.map(item => item.anime));
      } catch (error) {
        console.error("Error fetching user history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [showHistory, user]);

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
