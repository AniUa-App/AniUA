import { View, Text } from "react-native";
import React from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import AnimeListHorizontal from "../Widgets/AnimeListHorizontalWidget";
import { HikkaSets } from "../Sources/HikkaSets";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { appColor } from "../Styles/Colors";
import SettingsStorage from "../Storage/SettingsStorage";
import CustomSet from "../Sources/CustomSet";

export default function MainScreenCustomisationScreen() {
  const [animeRecommendationsList, setAnimeRecommendationsList] = useState([]);

  const userConfig = SettingsStorage.getParameter("userConfig");

  return (
    <DefaultScreenWidget>
      {/* <AnimeListWidget
        animeList={}
        onPress={() => {}}
      /> */}
    </DefaultScreenWidget>
  );
}

function CustomisationScreen() {
  return (
    <View>
      <Text>CustomisationScreen</Text>
    </View>
  );
}

const OngoingAnimeList = React.memo(() => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getOngoingAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularAnime();
  }, []);

  const handleShowMore = useCallback(async () => {
    try {
      const data = await HikkaSets.getOngoingAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Онґоінги",
          initialData: data,
        },
      });
    } catch (error) {
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
      </View>
    );
  }

  return (
    <AnimeListHorizontal
      title="Онґоінги"
      animeList={animeList}
      onClickMore={handleShowMore}
    />
  );
});
