import React, { useState, useEffect, useMemo } from "react";
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
import {
  useIsTablet,
  useIsTV,
  useIsTabletPortrait,
} from "../Styles/Responsive";
import BigBannerWidget from "../Widgets/BigBannerWidget";

export default function MangaTabContent() {
  const s = useHomeStyles();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isTabletDevice = useIsTablet();
  const isTVDevice = useIsTV();
  const isTabletPort = useIsTabletPortrait();
  const [bannerManga, setBannerManga] = useState([]);
  const [isBannerLoading, setIsBannerLoading] = useState(true);

  useEffect(() => {
    setIsBannerLoading(true);
    Logger.debug("MangaTabContent", "Старт завантаження банера манґи");
    HikkaSets.getMostPopularManga(1, 6, 2025)
      .then(setBannerManga)
      .then((data) =>
        Logger.info(
          "MangaTabContent",
          `Банер манґи завантажено, елементів: ${data?.length || 0}`,
        ),
      )
      .catch((err) =>
        Logger.error("MangaTabContent", "Помилка завантаження банера", err),
      )
      .finally(() => setIsBannerLoading(false));
  }, []);

  const renderBanner = useMemo(() => {
    if (isBannerLoading) {
      return (
        <View style={s.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (!bannerManga?.length) return null;
    if (isTabletDevice || isTVDevice) {
      return <BigBannerWidget.Tablet content={bannerManga} variant="manga" />;
    }
    return <BigBannerWidget.Mobile content={bannerManga} variant="manga" />;
  }, [
    bannerManga,
    colors.primary,
    isBannerLoading,
    isTabletDevice,
    isTVDevice,
    s.loaderContainer,
  ]);

  const listsContent = (
    <View
      style={
        isTabletDevice || isTVDevice
          ? s.tabletContent
          : isTabletPort
            ? s.contentContainerTablet
            : s.contentContainer
      }
    >
      <CustomMangaPersonalRecList />
    </View>
  );

  // TV — ширший банер та планшетний макет
  if (isTVDevice) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <ScrollView
          style={s.contentNavigator}
          showsVerticalScrollIndicator={false}
          focusable={false}
        >
          <View style={{ marginTop: insets.top + 24 }}>{renderBanner}</View>
          {listsContent}
          <View style={s.spacer} />
        </ScrollView>
      </DefaultScreenWidget>
    );
  }

  // Планшет — банер + списки у ширшому макеті
  if (isTabletDevice) {
    return (
      <DefaultScreenWidget isNavBarPadding={false}>
        <ScrollView
          style={s.contentNavigator}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: insets.top + 24 }}>{renderBanner}</View>
          {listsContent}
          <View style={s.spacer} />
        </ScrollView>
      </DefaultScreenWidget>
    );
  }

  // Телефон — мобільний банер та компактні списки
  return (
    <DefaultScreenWidget isNavBarPadding={false}>
      <ScrollView
        style={s.contentNavigator}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: insets.top + 24 }}>{renderBanner}</View>
        {listsContent}
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
      Logger.debug(
        "MangaTabContent",
        `Завантаження кастомних списків манґи, знайдено: ${data?.length || 0}`,
      );
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
      Logger.debug("MangaTabContent", "Списки манґи відсутні, очищаю контент");
      setLoadedMangaLists([]);
      return;
    }
    Logger.debug(
      "MangaTabContent",
      `Старт завантаження даних списків манґи: ${personalRecList.length}`,
    );
    setIsLoading(true);
    Promise.all(
      personalRecList.map(async (item) => {
        try {
          const res = await sendMangaRequest(item, "preview");
          Logger.debug(
            "MangaTabContent",
            `Список "${item.name}" завантажено, елементів: ${res?.length || 0}`,
          );
          return { name: item.name, mangaList: res };
        } catch (e) {
          Logger.warn(
            "MangaTabContent",
            `Не вдалося завантажити список "${item.name}"`,
            e,
          );
          return { name: item.name, mangaList: [] };
        }
      }),
    )
      .then((results) => {
        setLoadedMangaLists(results);
        Logger.info(
          "MangaTabContent",
          `Списки манґи завантажено, успішних: ${
            results.filter((r) => r.mangaList?.length).length
          }/${results.length}`,
        );
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
