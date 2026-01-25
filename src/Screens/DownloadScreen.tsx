import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { TouchableOpacity } from "../Widgets/Button";
import { Image } from "../Widgets/LoadersWidgets";
import Icon, { DownloadIcon } from "../Styles/Icons";
import { H2, H3, H4 } from "../Styles/Fonts";
import { HikkaApi } from "../Sources/hikka";
import AnimeStorage from "../Storage/AnimeStorage";
import Logger from "../Logger/Logger";
import { isTabletLandscape, isTablet } from "../Styles/Responsive";
import { prefetchBloomImage } from "../Widgets/BloomImage";
import BottomSheetDownloadComponent from "../Components/BottomSheetDownload/BottomSheetDownloadComponent";
import type { BottomSheetDownloadRef } from "../Components/BottomSheetDownload/types";

const MAX_CONCURRENT_REQUESTS = 10;

interface AnimeInfo {
  downloaded_episodes?: Array<{
    episode: number;
    video_path: string;
  }>;
  [key: string]: any;
}

interface AnimeItem {
  slug: string;
  title_ua?: string;
  title_en?: string;
  title_ja?: string;
  image?: string;
  rating?: string;
  year?: number;
  genres?: Array<{ name_ua: string }>;
}

export default function DownloadScreen({
  isNavBarPadding,
  hasManualHeader,
}: {
  isNavBarPadding?: boolean;
  hasManualHeader?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();
  const navigation = useNavigation<any>();

  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState<Record<string, AnimeInfo>>({});

  // Для BottomSheet
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem | null>(null);
  const downloadSheetRef = useRef<BottomSheetDownloadRef>(null);

  const getInfos = useCallback(() => {
    try {
      const storedInfos = AnimeStorage.getAll();
      setInfo(storedInfos || {});
      Logger.debug("DownloadScreen", "Інформація завантажена");
    } catch (error) {
      Logger.error(
        "DownloadScreen",
        "Помилка при завантаженні інформації",
        error
      );
      setInfo({});
    }
  }, []);

  const updateInfo = useCallback(
    (slug: string, newInfoData: Partial<AnimeInfo>) => {
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

  const fetchAnimeDetails = useCallback(async (animeSlug: string) => {
    try {
      return await HikkaApi.getAnimeDetails(animeSlug);
    } catch (error) {
      Logger.error("DownloadScreen", "Помилка при отриманні деталей аніме", {
        animeSlug,
        error,
      });
      return null;
    }
  }, []);

  const fetchWithConcurrencyLimit = useCallback(
    async (tasks: Array<() => Promise<any>>) => {
      const results: any[] = [];

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

    Logger.debug("DownloadScreen", "Завантаження завантаженого", {
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

  const handleOpenDownloadSheet = useCallback((anime: AnimeItem) => {
    setSelectedAnime(anime);
    setTimeout(() => {
      downloadSheetRef.current?.open();
    }, 100);
  }, []);

  const handleInfoChange = useCallback(
    (updatedInfo: AnimeInfo) => {
      if (selectedAnime) {
        updateInfo(selectedAnime.slug, updatedInfo);
      }
    },
    [selectedAnime, updateInfo]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: AnimeItem; index: number }) => {
      if (!item?.slug) {
        return null;
      }

      const currentItemInfo = info?.[item.slug] || {};
      const downloadedCount = currentItemInfo.downloaded_episodes?.length || 0;
      return (
        <TouchableOpacity
          style={[
            styles.cardContainer,
            {
              backgroundColor: themeColors.background,
            },
            isTabletLandscape()
              ? { height: height * 0.3 }
              : isTablet()
                ? { height: height * 0.2 }
                : { height: height * 0.25 },
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
                isTabletLandscape()
                  ? { width: width * 0.12, height: height * 0.3 }
                  : isTablet()
                    ? { width: width * 0.2, height: height * 0.2 }
                    : { width: width * 0.35, height: height * 0.25 },
              ]}
            />
          </TouchableOpacity>

          <View style={styles.infoContainer}>
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
                numberOfLines={4}
                ellipsizeMode="tail"
                style={[H3, { marginBottom: 8 }]}
              >
                {(item.title_ua || item.title_en || item.title_ja || "")
                  .length > 20
                  ? (item.title_ua || item.title_en || item.title_ja || "")
                      .split(" ")
                      .slice(0, 6)
                      .join(" ") + "..."
                  : item.title_ua || item.title_en || item.title_ja}
              </Text>
            </TouchableOpacity>

            {item.year && (
              <Text style={[H4, { marginBottom: 4 }]}>
                Рік:{" "}
                <Text style={{ color: themeColors.primary }}>{item.year}</Text>
              </Text>
            )}
            {item.genres && item.genres.length > 0 && (
              <Text numberOfLines={2} ellipsizeMode="tail" style={H4}>
                Жанри:{" "}
                <Text style={{ color: themeColors.primary }}>
                  {item.genres.map((genre) => genre.name_ua).join(", ")}
                </Text>
              </Text>
            )}
            <View
              style={[
                styles.downloadButton,
                { backgroundColor: themeColors.accent },
              ]}
            >
              <DownloadIcon
                fill={themeColors.primary}
                size={24}
                label={String(downloadedCount)}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [info, themeColors, navigation, width, height, handleOpenDownloadSheet]
  );

  const keyExtractor = (item: AnimeItem, index: number) =>
    `${item.slug}-${index}`;

  const ListEmptyComponent = useCallback(
    () =>
      !isLoading ? (
        <View style={[styles.emptyContainer, { marginTop: -height * 0.1 }]}>
          <Icon.DownloadSimple size={64} color={themeColors.inActiveText} />
          <Text
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
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={styles.listContentContainer}
        />

        {selectedAnime && (
          <BottomSheetDownloadComponent
            ref={downloadSheetRef}
            anime={selectedAnime}
            info={info[selectedAnime.slug] || {}}
            onInfoChange={handleInfoChange}
            onDownloadComplete={(episode, updatedInfo) => {
              Logger.info("DownloadScreen", "Download complete", { episode });
            }}
            onDownloadError={(error, episode) => {
              Logger.error("DownloadScreen", "Download error", {
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

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  animeImage: {
    borderRadius: 16,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    height: "100%",
  },
  downloadButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
    borderRadius: 8,
    right: 0,
    bottom: 8,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyMessage: {
    textAlign: "center",
    padding: "5%",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
