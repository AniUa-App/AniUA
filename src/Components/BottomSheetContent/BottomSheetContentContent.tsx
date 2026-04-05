import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Linking,
  BackHandler,
  findNodeHandle,
  TVFocusGuideView as RNTVFocusGuideView,
} from "react-native";

const TVFocusGuideView = RNTVFocusGuideView || View;
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../../Widgets/Button";
import { H4, H5 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import {
  AniuaApi,
  Episode,
  Team,
  EpisodesByPlayerAndTeam,
  Provider,
} from "../../Api/AniuaApi";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import {
  fetchProviders,
  fetchAnimeEpisodes,
  fetchMangaChapters,
} from "./CustomApi";
import Logger from "../../Logger/Logger";
import DubComponent from "../DubComponent";
import { sortDubbingsByPartnerStudios } from "../../Widgets/DubbingBottomSheetWidget";

import {
  BottomSheetContentRef,
  BottomSheetContentProps,
  Player,
} from "./types";
import { ITEM_HEIGHT } from "./constants";
import {
  getPlayerInfo,
  convertHikkaEpisodes,
  convertMangaChaptersToEpisodes,
} from "./helpers";
import { DubbingButton } from "./DubbingButton";
import { PlayerTabs } from "./PlayerTabs";
import { EpisodeItem } from "./ContentItem";
import { styles } from "../../Styles/components/BottomSheetContentStyles";

type ContentByPlayerAndTeam = Record<string, Record<string, Episode[]>>;

const BottomSheetContentComponent = forwardRef<
  BottomSheetContentRef,
  BottomSheetContentProps
>(
  (
    {
      item: contentItem,
      contentType,
      currentEpisode,
      currentTeam,
      currentPlayer,
      useBuiltInPlayer: initialUseBuiltIn = false,
      watchedContent = [],
      onSelectEpisode,
      onLongPressEpisode,
      onTeamChange,
      onPlayerChange,
      onBuiltInPlayerToggle,
      onSelectChapters,
      prefetchedChapters,
      providers: providersProp = [],
    },
    ref,
  ) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const flatListRef = useRef<FlatList>(null);
    const { width, height } = useWindowDimensions();
    const themeColors = useThemeColors();

    // ==================== STATE ====================

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [contentByPlayer, setContentByPlayer] =
      useState<ContentByPlayerAndTeam>({});
    const [teamInfoMap, setTeamInfoMap] = useState<Record<string, Team | null>>(
      {},
    );
    const [providers, setProviders] = useState<Provider[]>(() =>
      Array.isArray(providersProp) ? providersProp : [],
    );

    const [selectedPlayer, setSelectedPlayer] = useState<Player>(() =>
      getPlayerInfo(currentPlayer || "moon", themeColors),
    );
    const [selectedDubbing, setSelectedDubbing] = useState<string | null>(
      currentTeam || null,
    );
    const [useBuiltIn, setUseBuiltIn] = useState(initialUseBuiltIn);

    useEffect(() => {
      setUseBuiltIn(initialUseBuiltIn);
    }, [initialUseBuiltIn]);

    // Focus management for TV
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Active screen: "content" or "dubbing"
    const [activeScreen, setActiveScreen] = useState<"content" | "dubbing">(
      "content",
    );

    // Circular focus navigation for dubbing screen
    const firstPlayerTabRef = useRef<any>(null);
    const lastDubbingRef = useRef<any>(null);
    const [firstPlayerTabHandle, setFirstPlayerTabHandle] = useState<
      number | undefined
    >(undefined);
    const [lastDubbingHandle, setLastDubbingHandle] = useState<
      number | undefined
    >(undefined);

    // Scroll button state
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const scrollButtonRotation = useRef(new Animated.Value(0)).current;
    const isAtEndRef = useRef(false);

    // ==================== EXPOSE METHODS ====================

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.present(),
      close: () => sheetRef.current?.close(),
    }));

    // ==================== ANIMATION ====================

    const animateToScreen = useCallback((screen: "content" | "dubbing") => {
      setActiveScreen(screen);
    }, []);

    // ==================== BACK HANDLER ====================

    useEffect(() => {
      if (!isSheetOpen) return;

      const backAction = () => {
        if (activeScreen === "dubbing") {
          animateToScreen("content");
        } else {
          sheetRef.current?.close();
        }
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => sub.remove();
    }, [isSheetOpen, activeScreen, animateToScreen]);

    // ==================== LOAD DATA ====================

    useEffect(() => {
      if (!contentItem?.slug) {
        setIsLoading(false);
        return;
      }

      const loadData = async () => {
        setIsLoading(true);
        setError(null);

        let grouped: ContentByPlayerAndTeam = {};
        let usedFallback = false;

        try {
          // Завантажуємо провайдерів для сортування (якщо не передані)
          if (providers.length === 0) {
            const prov = await fetchProviders();
            setProviders(prov);
          }

          if (contentType === "anime") {
            let content = await fetchAnimeEpisodes(contentItem.slug);

            if (content.length === 0 && AniuaApi.isBlocked()) {
              throw new Error("Server blocked, trying fallback");
            }

            try {
              content = await AniuaApi.validateAndFixEpisodes(
                content,
                contentItem.slug,
              );
            } catch (validationError) {
              Logger.warn(
                "BottomSheetContent",
                "Validation failed, using original content",
                validationError as Error,
              );
            }

            const groupedEpisodes: ContentByPlayerAndTeam = {};
            content.forEach((episode) => {
              const player = episode.player || "unknown";
              const team = episode.team || "Невідомо";

              if (!groupedEpisodes[player]) groupedEpisodes[player] = {};
              if (!groupedEpisodes[player][team])
                groupedEpisodes[player][team] = [];
              groupedEpisodes[player][team].push(episode);
            });

            Object.values(groupedEpisodes).forEach((teams) => {
              Object.values(teams).forEach((eps) =>
                eps.sort((a, b) => a.episode - b.episode),
              );
            });

            grouped = groupedEpisodes;
          } else {
            const chapters =
              Array.isArray(prefetchedChapters) && prefetchedChapters.length > 0
                ? prefetchedChapters
                : await fetchMangaChapters(contentItem.slug);
            grouped = convertMangaChaptersToEpisodes(
              chapters,
              contentItem.slug,
            );
          }
        } catch (aniuaError) {
          Logger.warn(
            "BottomSheetContent",
            "AniuaApi failed, trying fallback to HikkaApi",
            aniuaError as Error,
          );

          try {
            if (contentType === "anime") {
              const hikkaResult = await HikkaApiComplete.getEpisodes(
                contentItem.slug,
              );
              if (hikkaResult.data && typeof hikkaResult.data === "object") {
                grouped = convertHikkaEpisodes(
                  hikkaResult.data,
                  contentItem.slug,
                );
                usedFallback = true;
                Logger.info(
                  "BottomSheetContent",
                  "Successfully loaded content from HikkaApi fallback",
                );
              } else {
                throw new Error("Invalid HikkaApi response");
              }
            } else if (
              Array.isArray(prefetchedChapters) &&
              prefetchedChapters.length > 0
            ) {
              grouped = convertMangaChaptersToEpisodes(
                prefetchedChapters,
                contentItem.slug,
              );
            } else {
              grouped = {};
              throw new Error("No fallback for manga");
            }
          } catch (hikkaError) {
            Logger.error(
              "BottomSheetContent",
              "Both AniuaApi and HikkaApi failed",
              hikkaError as Error,
            );
            setError("Не вдалося завантажити епізоди");
            setIsLoading(false);
            return;
          }
        }

        try {
          setContentByPlayer(grouped);

          const allTeams = new Set<string>();
          Object.values(grouped).forEach((teams) => {
            Object.keys(teams).forEach((team) => allTeams.add(team));
          });

          if (!usedFallback && contentType === "anime") {
            const teamInfoPromises = Array.from(allTeams).map(async (name) => {
              const team = await AniuaApi.getTeamByName(name, true);
              return { name, team };
            });

            const teamInfoResults = await Promise.all(teamInfoPromises);
            const infoMap: Record<string, Team | null> = {};
            teamInfoResults.forEach(({ name, team }) => {
              infoMap[name] = team;
            });
            setTeamInfoMap(infoMap);
          } else {
            const infoMap: Record<string, Team | null> = {};
            allTeams.forEach((name) => {
              infoMap[name] = null;
            });
            setTeamInfoMap(infoMap);
          }

          const availablePlayersRaw = Object.keys(grouped);
          const providerOrder = providers.length
            ? providers.map((p) => p.slug)
            : availablePlayersRaw;
          const availablePlayers = availablePlayersRaw.sort((a, b) => {
            const ia = providerOrder.indexOf(a);
            const ib = providerOrder.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
          });

          let initialPlayerName = availablePlayers[0] || "unknown";
          if (currentPlayer && grouped[currentPlayer]) {
            initialPlayerName = currentPlayer;
          }
          setSelectedPlayer(getPlayerInfo(initialPlayerName, themeColors));

          const dubbings = Object.keys(grouped[initialPlayerName] || {});
          if (currentTeam && dubbings.includes(currentTeam)) {
            setSelectedDubbing(currentTeam);
          } else if (dubbings.length > 0) {
            const sorted = sortDubbingsByPartnerStudios(dubbings);
            setSelectedDubbing(sorted[0]?.name || dubbings[0]);
          }
        } catch (err) {
          Logger.error(
            "BottomSheetContent",
            "Failed to process data",
            err as Error,
          );
          setError("Не вдалося завантажити епізоди");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentItem?.slug, contentType]);

    // ==================== COMPUTED VALUES ====================

    const availablePlayers = useMemo(() => {
      return Object.keys(contentByPlayer);
    }, [contentByPlayer]);

    const currentDubbings = useMemo(() => {
      return contentByPlayer[selectedPlayer.name] || {};
    }, [contentByPlayer, selectedPlayer]);

    const sortedDubbings = useMemo(() => {
      const dubbingNames = Object.keys(currentDubbings);
      return sortDubbingsByPartnerStudios(dubbingNames);
    }, [currentDubbings]);

    const currentContent = useMemo(() => {
      if (!selectedPlayer.name || !selectedDubbing) return [];
      return contentByPlayer[selectedPlayer.name]?.[selectedDubbing] || [];
    }, [selectedPlayer, selectedDubbing, contentByPlayer]);

    // ==================== HANDLERS ====================

    const handlePlayerSelect = useCallback(
      (player: string) => {
        if (player === selectedPlayer.name) return;

        setSelectedPlayer(getPlayerInfo(player, themeColors));
        onPlayerChange?.(player);

        const dubbings = Object.keys(contentByPlayer[player] || {});
        if (dubbings.length > 0) {
          const sorted = sortDubbingsByPartnerStudios(dubbings);
          const firstDubbing = sorted[0]?.name || dubbings[0];
          setSelectedDubbing(firstDubbing);
          onTeamChange?.(firstDubbing);
        }
      },
      [
        contentByPlayer,
        onPlayerChange,
        onTeamChange,
        themeColors,
        selectedPlayer.name,
      ],
    );

    const handleDubbingSelect = useCallback(
      (dubbing: string) => {
        setSelectedDubbing(dubbing);
        onTeamChange?.(dubbing);
        animateToScreen("content");
      },
      [onTeamChange, animateToScreen],
    );

    const handleEpisodePress = useCallback(
      (episode: Episode) => {
        onSelectEpisode?.(episode, useBuiltIn, currentContent);
        if (contentType === "manga") {
          onSelectChapters?.(
            currentContent
              .filter(
                (ch) =>
                  ch.team === selectedDubbing &&
                  ch.player === selectedPlayer.name,
              )
              .map((ep) => ep),
          );
        }
        sheetRef.current?.close();
      },
      [
        onSelectEpisode,
        useBuiltIn,
        currentContent,
        onSelectChapters,
        selectedDubbing,
        selectedPlayer.name,
        contentType,
      ],
    );

    const handlePlayerTypeToggle = useCallback(
      (isBuiltIn: boolean) => {
        setUseBuiltIn(isBuiltIn);
        onBuiltInPlayerToggle?.(isBuiltIn);
      },
      [onBuiltInPlayerToggle],
    );

    // ==================== SCROLL HANDLING ====================

    // Update circular focus handles when dubbing screen is active
    useEffect(() => {
      if (activeScreen === "dubbing") {
        const timer = setTimeout(() => {
          const tabHandle = firstPlayerTabRef.current
            ? findNodeHandle(firstPlayerTabRef.current)
            : null;
          const dubbingHandle = lastDubbingRef.current
            ? findNodeHandle(lastDubbingRef.current)
            : null;
          setFirstPlayerTabHandle(tabHandle || undefined);
          setLastDubbingHandle(dubbingHandle || undefined);
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [activeScreen, sortedDubbings, availablePlayers]);

    useEffect(() => {
      setShowScrollButton(currentContent.length > 10);
      setIsAtEnd(false);
      isAtEndRef.current = false;
      scrollButtonRotation.setValue(0);
    }, [currentContent.length, scrollButtonRotation]);

    const handleScroll = useCallback(
      (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } =
          event.nativeEvent;
        const isNearEnd =
          contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
        const isNearStart = contentOffset.y <= 50;

        if (isNearEnd && !isAtEndRef.current) {
          setIsAtEnd(true);
          isAtEndRef.current = true;
          Animated.timing(scrollButtonRotation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }

        if (isNearStart && isAtEndRef.current) {
          setIsAtEnd(false);
          isAtEndRef.current = false;
          Animated.timing(scrollButtonRotation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
      [scrollButtonRotation],
    );

    const handleScrollButton = useCallback(() => {
      if (!flatListRef.current) return;

      const scrollStep = currentContent.length > 100 ? 50 : 20;

      if (isAtEnd) {
        const currentOffset =
          (flatListRef.current as any)._listRef?._scrollMetrics?.offset || 0;
        const newOffset = Math.max(0, currentOffset - scrollStep * ITEM_HEIGHT);
        flatListRef.current.scrollToOffset({
          offset: newOffset,
          animated: true,
        });

        if (newOffset === 0) {
          setIsAtEnd(false);
          isAtEndRef.current = false;
          Animated.timing(scrollButtonRotation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } else {
        const currentOffset =
          (flatListRef.current as any)._listRef?._scrollMetrics?.offset || 0;
        flatListRef.current.scrollToOffset({
          offset: currentOffset + scrollStep * ITEM_HEIGHT,
          animated: true,
        });
      }
    }, [isAtEnd, currentContent.length, scrollButtonRotation]);

    const rotateInterpolation = scrollButtonRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // ==================== RENDER FUNCTIONS ====================

    const renderEpisodeItem = useCallback(
      ({ item }: { item: Episode }) => (
        <EpisodeItem
          mode="watch"
          episode={item}
          isWatched={watchedContent.includes(item.episode)}
          onPress={() => handleEpisodePress(item)}
          onLongPress={
            onLongPressEpisode ? () => onLongPressEpisode(item) : undefined
          }
          anime={contentItem}
          player={selectedPlayer.name}
          useBuiltIn={useBuiltIn}
        />
      ),
      [
        watchedContent,
        handleEpisodePress,
        onLongPressEpisode,
        selectedPlayer.name,
        useBuiltIn,
      ],
    );

    const keyExtractor = useCallback(
      (item: Episode, index: number) =>
        `${item.team}-${item.episode}-${item.id}-${index}`,
      [],
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      [],
    );

    // ==================== RENDER ====================

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["60%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: themeColors.background,
        }}
        handleIndicatorStyle={{ backgroundColor: themeColors.inActiveIcon }}
        backdropComponent={(props) => (
          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            activeOpacity={1}
            style={[props.style as object]}
          />
        )}
        enableContentPanningGesture={false}
        onChange={(index) => setIsSheetOpen(index >= 0)}
      >
        <BottomSheetView style={styles.container}>
          <TVFocusGuideView style={{ flex: 1 }} autoFocus>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={themeColors.primary}
                style={styles.loader}
              />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon.WarningCircle
                  size={48}
                  color={themeColors.inActiveText}
                />
                <Text
                  selectable={true}
                  style={[
                    H4,
                    { color: themeColors.inActiveText, marginTop: 12 },
                  ]}
                >
                  {error}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={async () => {
                    setIsLoading(true);
                    setError(null);
                    try {
                      if (contentType === "anime") {
                        let content = await fetchAnimeEpisodes(
                          contentItem.slug,
                        );
                        try {
                          content = await AniuaApi.validateAndFixEpisodes(
                            content,
                            contentItem.slug,
                          );
                        } catch {
                          // ignore
                        }
                        const groupedRetry: ContentByPlayerAndTeam = {};
                        content.forEach((episode) => {
                          const player = episode.player || "unknown";
                          const team = episode.team || "Невідомо";
                          if (!groupedRetry[player]) groupedRetry[player] = {};
                          if (!groupedRetry[player][team])
                            groupedRetry[player][team] = [];
                          groupedRetry[player][team].push(episode);
                        });
                        Object.values(groupedRetry).forEach((teams) => {
                          Object.values(teams).forEach((eps) => {
                            eps.sort((a, b) => a.episode - b.episode);
                          });
                        });
                        setContentByPlayer(groupedRetry);
                      } else {
                        const chapters =
                          Array.isArray(prefetchedChapters) &&
                          prefetchedChapters.length > 0
                            ? prefetchedChapters
                            : await fetchMangaChapters(contentItem.slug);
                        const groupedRetry = convertMangaChaptersToEpisodes(
                          chapters,
                          contentItem.slug,
                        );
                        setContentByPlayer(groupedRetry);
                      }
                    } catch {
                      setError("Не вдалося завантажити епізоди");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <Text
                    selectable={true}
                    style={[H5, { color: themeColors.background }]}
                  >
                    Спробувати знову
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.screensContainer,
                  { height: height * 0.6, width: "100%" },
                ]}
              >
                {/* Content Screen */}
                {activeScreen === "content" && (
                  <View style={[styles.screen, { width }]}>
                    {selectedDubbing && (
                      <DubbingButton
                        dubbingName={selectedDubbing}
                        team={teamInfoMap[selectedDubbing]}
                        currentPlayer={selectedPlayer}
                        onPress={() => animateToScreen("dubbing")}
                        useBuiltIn={useBuiltIn}
                        onPlayerTypeToggle={handlePlayerTypeToggle}
                        hasTVPreferredFocus={isSheetOpen}
                      />
                    )}

                    {currentContent.length === 0 ? (
                      <View
                        style={[
                          styles.emptyContainer,
                          { backgroundColor: themeColors.subtle },
                        ]}
                      >
                        <Icon.FilmStrip
                          size={48}
                          color={themeColors.inActiveText}
                        />
                        <Text
                          selectable={true}
                          style={[
                            H4,
                            {
                              color: themeColors.inActiveText,
                              marginTop: 12,
                              textAlign: "center",
                            },
                          ]}
                        >
                          Немає доступних епізодів
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{
                          backgroundColor: themeColors.subtle,
                          flex: 1,
                        }}
                      >
                        <FlatList
                          ref={flatListRef}
                          data={currentContent}
                          renderItem={renderEpisodeItem}
                          keyExtractor={keyExtractor}
                          getItemLayout={getItemLayout}
                          showsVerticalScrollIndicator={false}
                          onScroll={handleScroll}
                          scrollEventThrottle={16}
                          style={{ paddingTop: 4 }}
                          contentContainerStyle={styles.listContent}
                        />
                        {showScrollButton && (
                          <Animated.View
                            style={[
                              styles.scrollButton,
                              {
                                transform: [{ rotate: rotateInterpolation }],
                              },
                            ]}
                          >
                            <TouchableOpacity
                              onPress={handleScrollButton}
                              style={[
                                styles.scrollButtonInner,
                                { backgroundColor: themeColors.background },
                              ]}
                            >
                              <Icon.CaretDown
                                size={28}
                                color={themeColors.text}
                                weight="bold"
                              />
                            </TouchableOpacity>
                          </Animated.View>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* Dubbing Selection Screen */}
                {activeScreen === "dubbing" && (
                  <View style={[styles.screen, { width }]}>
                    <PlayerTabs
                      availablePlayers={availablePlayers}
                      activePlayer={selectedPlayer}
                      onPlayerSelect={handlePlayerSelect}
                      hasTVPreferredFocus={activeScreen === "dubbing"}
                      nextFocusUp={lastDubbingHandle}
                      firstTabInnerRef={firstPlayerTabRef}
                      providers={providers}
                    />

                    <View
                      style={{
                        backgroundColor: themeColors.subtle,
                        flex: 1,
                      }}
                    >
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ paddingTop: 8 }}
                        contentContainerStyle={styles.dubbingListContent}
                      >
                        {sortedDubbings.map((item, index) => {
                          const { name, team } = item;
                          const contentCount =
                            currentDubbings[name]?.length || 0;
                          const isSelected = selectedDubbing === name;
                          const teamInfo = team || teamInfoMap[name];
                          const isLast = index === sortedDubbings.length - 1;

                          return (
                            <DubComponent
                              key={name}
                              innerRef={isLast ? lastDubbingRef : undefined}
                              nextFocusDown={
                                isLast ? firstPlayerTabHandle : undefined
                              }
                              logo={teamInfo?.logo}
                              name={name}
                              subtitle={`${contentCount} серій`}
                              isPartner={teamInfo?.is_verified}
                              onBodyClick={() => handleDubbingSelect(name)}
                              onButtonClick={() => {
                                if (teamInfo?.telegram) {
                                  Linking.openURL(teamInfo.telegram);
                                }
                              }}
                              checkColor={
                                isSelected
                                  ? themeColors.text
                                  : themeColors.primary
                              }
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: themeColors.primary,
                                      color: themeColors.text,
                                    }
                                  : undefined
                              }
                              subtitleStyle={{
                                color: isSelected
                                  ? themeColors.subtle
                                  : themeColors.primary,
                              }}
                              buttonStyle={{
                                backgroundColor: isSelected
                                  ? themeColors.primary
                                  : themeColors.background,
                                padding: 6,
                                borderRadius: 8,
                              }}
                              icon={
                                teamInfo?.is_verified && (
                                  <Icon.TelegramLogo
                                    size={32}
                                    color={
                                      isSelected
                                        ? themeColors.text
                                        : themeColors.primary
                                    }
                                  />
                                )
                              }
                            />
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>
            )}
          </TVFocusGuideView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

BottomSheetContentComponent.displayName = "BottomSheetContentComponent";

export default BottomSheetContentComponent;
