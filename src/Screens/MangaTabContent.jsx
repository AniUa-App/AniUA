import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { MangaListHorizontal } from "../Widgets/MangaListHorizontalWidget";
import { useThemeColors } from "../Global/useTheme";
import { useNavigation } from "@react-navigation/native";
import { useHomeStyles } from "../Styles/components/HomeStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MangaPersonalRecListStorage from "../Storage/MangaPersonalRecListStorage";
import { sendMangaRequest } from "../Sources/MangaCustomSet";
import { EventBus } from "../Global/EventBus";
import Logger from "../Logger/Logger";
import { ActivityIndicator } from "react-native";
import { HikkaSets } from "../Sources/HikkaSets";
import { useIsTablet, useIsTV, isTV } from "../Styles/Responsive";
export default function MangaTabContent() {
  const s = useHomeStyles();
  const insets = useSafeAreaInsets();
  const isTabletDevice = useIsTablet();

  const [bannerAnimes, setBannerAnimes] = useState([]);
  // Завантаження даних для банера на рівні HomeScreen (для планшетів та TV)
  useEffect(() => {
    if (isTabletDevice || isTV()) {
      HikkaSets.getMostPopularMangaOfTheYear(1, 6)
        .then(setBannerAnimes)
        .catch((err) =>
          Logger.error("Home", "Помилка завантаження банера", err),
        );
    }
  }, [isTabletDevice, isTV]);
  return (
    <DefaultScreenWidget isNavBarPadding={false}>
      <ScrollView
        style={s.contentNavigator}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: insets.top + 60 }}>
          <CustomMangaPersonalRecList />
        </View>
        <View style={s.spacer} />
      </ScrollView>
    </DefaultScreenWidget>
  );
}

const CustomMangaPersonalRecList = React.memo(() => {
  const [personalRecList, setPersonalRecList] = useState([]);
  const colors = useThemeColors();
  const s = useHomeStyles();
  const [loadedMangaLists, setLoadedMangaLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    try {
      setIsLoading(true);
      MangaPersonalRecListStorage.initializeDefaultLists();
      const data = MangaPersonalRecListStorage.getSettingsList();
      setPersonalRecList(data);
    } catch (error) {
      Logger.error(
        "MangaTabContent",
        "Помилка при завантаженні списків манґи",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = EventBus.on("mangaRecListUpdated", () => {
      try {
        const data = MangaPersonalRecListStorage.getSettingsList();
        setPersonalRecList(data);
      } catch (e) {
        Logger.error(
          "MangaTabContent",
          "Помилка при оновленні списків манґи",
          e,
        );
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!personalRecList || personalRecList.length === 0) {
      setLoadedMangaLists([]);
      return;
    }
    setIsLoading(true);
    Promise.all(
      personalRecList.map(async (item) => {
        try {
          const res = await sendMangaRequest(item, "preview");
          return { name: item.name, mangaList: res };
        } catch (e) {
          return { name: item.name, mangaList: [] };
        }
      }),
    )
      .then((results) => {
        setLoadedMangaLists(results);
      })
      .finally(() => setIsLoading(false));
  }, [personalRecList]);

  if (isLoading) {
    return (
      <View style={s.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const nonEmptyLists = loadedMangaLists.filter(
    (list) => list.mangaList && list.mangaList.length > 0,
  );

  if (nonEmptyLists.length === 0) return null;

  return (
    <>
      {nonEmptyLists.map((mangaList) => {
        const originalIndex = personalRecList.findIndex(
          (item) => item.name === mangaList.name,
        );
        return (
          <MangaListHorizontal
            key={mangaList.name}
            title={mangaList.name}
            mangaList={mangaList.mangaList}
            navigation={navigation}
            onClickMore={
              mangaList.mangaList.length < 10
                ? null
                : async () => {
                    const data = await sendMangaRequest(
                      personalRecList[originalIndex],
                      "full",
                    );
                    navigation.navigate("HiddenStack", {
                      screen: "MangaList",
                      params: {
                        title: personalRecList[originalIndex].name,
                        initialData: data,
                      },
                    });
                  }
            }
          />
        );
      })}
    </>
  );
});
