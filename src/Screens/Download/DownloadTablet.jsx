import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import { TouchableOpacity } from "../../Widgets/Button";
import { Image } from "../../Widgets/LoadersWidgets";
import Icon, { DownloadIcon } from "../../Styles/Icons";
import { H2, H3, H4 } from "../../Styles/Fonts";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import AnimeStorage from "../../Storage/AnimeStorage";
import Logger from "../../Logger/Logger";
import { useGridColumns } from "../../Styles/Responsive";
import { prefetchBloomImage } from "../../Widgets/BloomImage";
import BottomSheetDownloadComponent from "../../Components/BottomSheetDownload/BottomSheetDownloadComponent";
import { styles, getGridItemWidth } from "./styles";

const MAX_CONCURRENT_REQUESTS = 10;

// Tablet version of Download screen (grid layout)
export default function DownloadTablet({
  isNavBarPadding,
  hasManualHeader,
}) {
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const navigation = useNavigation();
  const numColumns = useGridColumns(180);

  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState({});

  const [selectedAnime, setSelectedAnime] = useState(null);
  const downloadSheetRef = useRef(null);

  // Calculate card width based on grid columns
  const cardWidth = useMemo(() => {
    return getGridItemWidth(width, numColumns, 16);
  }, [width, numColumns]);

  const getInfos = useCallback(() => {
    try {
      const storedInfos = AnimeStorage.getAll();
      setInfo(storedInfos || {});
      Logger.debug("DownloadTablet", "Інформація завантажена");
    } catch (error) {
      Logger.error(
        "DownloadTablet",
        "Помилка при завантаженні інформації",
        error
      );
      setInfo({});
    }
  }, []);

  const updateInfo = useCallback(
    (slug, newInfoData) => {
      setInfo((prevInfo) => {
        const updatedInfo = {
          ...prevInfo,
          [slug]: { ...(prevInfo[slug] || {}), ...newInfoData },
        };
        AnimeStorage.set(slug, updatedInfo[slug]);
        return updatedInfo;
      });
    },
    []
  );

  const fetchAnimeDetails = useCallback(async (animeSlug) => {
    try {
      return await HikkaApiComplete.getAnimeDetails(animeSlug);
    } catch (error) {
      Logger.error("DownloadTablet", "Помилка при отриманні деталей аніме", {
        animeSlug,
        error,
      });
      return null;
    }
  }, []);

  const fetchWithConcurrencyLimit = useCallback(
    async (tasks) => {
      const results = [];

      for (let i = 0; i < tasks.length; i += MAX_CONCURRENT_REQUESTS) {
        const batch = tasks.slice(i, i + MAX_CONCURRENT_REQUESTS);
        const batchResults = await Promise.all(batch.map((task) => task()));

        const validResults = batchResults.filter(Boolean);
        if (validResults.length > 0) {
          setAnimeList((prev) => [...prev, ...validResults]);
        }

        results.push(...batchResults);
      }

      return results;
    },
    []
  );

  const fetchDownloadedAnime = useCallback(async () => {
    setIsLoading(true);
    setAnimeList([]);

    const currentInfo = AnimeStorage.getAll();

    const downloadedSlugs = Object.keys(currentInfo).filter(
      (slug) => (currentInfo[slug]?.downloaded_episodes?.length || 0) > 0
    );

    Logger.debug("DownloadTablet", "Завантаження завантаженого", {
      slugs: downloadedSlugs,
    });

    if (downloadedSlugs.length === 0) {
      setIsLoading(false);
      return;
    }

    const tasks = downloadedSlugs.map(
      (slug) => async () => await fetchAnimeDetails(slug)
    );

    await fetchWithConcurrencyLimit(tasks);
    setIsLoading(false);
  }, [fetchAnimeDetails, fetchWithConcurrencyLimit]);

  useFocusEffect(
    useCallback(() => {
      const loadDataSequentially = async () => {
        await getInfos();
        await fetchDownloadedAnime();
      };

      loadDataSequentially();
    }, [getInfos, fetchDownloadedAnime])
  );

  const handleOpenDownloadSheet = useCallback((anime) => {
    setSelectedAnime(anime);
    setTimeout(() => {
      downloadSheetRef.current?.open();
    }, 100);
  }, []);

  const handleInfoChange = useCallback(
    (updatedInfo) => {
      if (selectedAnime) {
        updateInfo(selectedAnime.slug, updatedInfo);
      }
    },
    [selectedAnime, updateInfo]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!item?.slug) {
        return null;
      }

      const currentItemInfo = info?.[item.slug] || {};
      const downloadedCount = currentItemInfo.downloaded_episodes?.length || 0;
      const imgWidth = cardWidth - 16;
      const imgHeight = imgWidth * 1.4;

      return (
        <TouchableOpacity
          style={[
            styles.gridCardContainer,
            {
              backgroundColor: themeColors.background,
              width: cardWidth,
            },
          ]}
          onPress={() => {
            handleOpenDownloadSheet(item);
          }}
        >
          <TouchableOpacity
            onPress={() => {
              prefetchBloomImage(item.image);
              navigation.navigate("HiddenStack", {
                screen: "AnimePreview",
                params: { anime: item },
              });
            }}
          >
            <Image
              uri={item.image}
              style={[
                styles.animeImage,
                { width: imgWidth, height: imgHeight },
              ]}
            />
          </TouchableOpacity>

          <View style={styles.gridInfoContainer}>
            <TouchableOpacity
              onPress={() => {
                prefetchBloomImage(item.image);
                navigation.navigate("HiddenStack", {
                  screen: "AnimePreview",
                  params: { anime: item },
                });
              }}
            >
              <Text
                selectable={true}
                numberOfLines={2}
                ellipsizeMode="tail"
                style={[H3, { marginBottom: 4 }]}
              >
                {item.title_ua || item.title_en || item.title_ja || ""}
              </Text>
            </TouchableOpacity>

            {item.year && (
              <Text
                selectable={true}
                style={[H4, { color: themeColors.inActiveText }]}
              >
                {item.year}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.gridDownloadButton,
              { backgroundColor: themeColors.Background(0.7) },
            ]}
          >
            <DownloadIcon
              fill={themeColors.primary}
              size={20}
              label={String(downloadedCount)}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [info, themeColors, navigation, cardWidth, handleOpenDownloadSheet]
  );

  const keyExtractor = useCallback(
    (item, index) => `${item.slug}-${index}`,
    []
  );

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Icon.DownloadSimple size={64} color={themeColors.inActiveText} />
          <Text
            selectable={true}
            style={[
              styles.emptyMessage,
              H2,
              { color: themeColors.inActiveText },
            ]}
          >
            Список завантаженого порожній
          </Text>
        </View>
      ) : null,
    [isLoading, height, themeColors]
  );

  const ListFooterComponent = useCallback(
    () =>
      isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : null,
    [isLoading, themeColors]
  );

  return (
    <BottomSheetModalProvider>
      <DefaultScreenWidget
        isCheckInternet={false}
        isNavBarPadding={isNavBarPadding}
        hasManualHeader={hasManualHeader}
      >
        <FlatList
          data={animeList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          key={`grid-${numColumns}`}
          showsVerticalScrollIndicator={false}
          initialNumToRender={numColumns * 3}
          maxToRenderPerBatch={numColumns * 4}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={[styles.listContentContainer, styles.gridContainer]}
          columnWrapperStyle={styles.gridColumnWrapper}
        />

        {selectedAnime && (
          <BottomSheetDownloadComponent
            ref={downloadSheetRef}
            slug={selectedAnime.slug}
            anime={selectedAnime}
            info={info[selectedAnime.slug] || {}}
            onInfoChange={handleInfoChange}
            onDownloadComplete={(episode, updatedInfo) => {
              Logger.info("DownloadTablet", "Download complete", { episode });
            }}
            onDownloadError={(error, episode) => {
              Logger.error("DownloadTablet", "Download error", {
                error,
                episode,
              });
            }}
          />
        )}
      </DefaultScreenWidget>
    </BottomSheetModalProvider>
  );
}
