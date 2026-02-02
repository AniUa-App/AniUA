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
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Linking,
  Easing,
} from "react-native";
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
} from "../../Api/AniuaApi";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import Logger from "../../Logger/Logger";
import DubComponent from "../DubComponent";
import { sortDubbingsByPartnerStudios } from "../../Widgets/DubbingBottomSheetWidget";

import {
  BottomSheetEpisodesRef,
  BottomSheetEpisodesProps,
  Player,
} from "./types";
import { PLAYER_ORDER, ITEM_HEIGHT } from "./constants";
import { getPlayerInfo, convertHikkaEpisodes } from "./helpers";
import { DubbingButton } from "./DubbingButton";
import { PlayerTabs } from "./PlayerTabs";
import { EpisodeItem } from "./EpisodeItem";
import { styles } from "./styles";

const BottomSheetEpisodesComponent = forwardRef<
  BottomSheetEpisodesRef,
  BottomSheetEpisodesProps
>(
  (
    {
      anime,
      currentEpisode,
      currentTeam,
      currentPlayer,
      useBuiltInPlayer: initialUseBuiltIn = false,
      watchedEpisodes = [],
      onSelectEpisode,
      onLongPressEpisode,
      onTeamChange,
      onPlayerChange,
      onBuiltInPlayerToggle,
    },
    ref
  ) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const flatListRef = useRef<FlatList>(null);
    const { width, height } = useWindowDimensions();
    const themeColors = useThemeColors();

    // ==================== STATE ====================

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [episodesByPlayer, setEpisodesByPlayer] =
      useState<EpisodesByPlayerAndTeam>({});
    const [teamInfoMap, setTeamInfoMap] = useState<Record<string, Team | null>>(
      {}
    );

    const [selectedPlayer, setSelectedPlayer] = useState<Player>(() =>
      getPlayerInfo(currentPlayer || "moon", themeColors)
    );
    const [selectedDubbing, setSelectedDubbing] = useState<string | null>(
      currentTeam || null
    );
    const [useBuiltIn, setUseBuiltIn] = useState(initialUseBuiltIn);

    // Animation
    const slideAnim = useRef(new Animated.Value(0)).current;
    const playerSlideAnim = useRef(new Animated.Value(0)).current;

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

    const animateToScreen = useCallback(
      (screen: "episodes" | "dubbing") => {
        Animated.timing(slideAnim, {
          toValue: screen === "episodes" ? 0 : 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      },
      [slideAnim]
    );

    const episodesTranslateX = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -width],
    });

    const dubbingTranslateX = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [width, 0],
    });

    // ==================== LOAD DATA ====================

    useEffect(() => {
      if (!anime?.slug) {
        setIsLoading(false);
        return;
      }

      const loadData = async () => {
        setIsLoading(true);
        setError(null);

        let grouped: EpisodesByPlayerAndTeam = {};
        let usedFallback = false;

        try {
          // Отримуємо епізоди
          const episodes = await AniuaApi.getAnimeEpisodes(anime.slug);

          // Якщо пустий масив і сервер заблоковано - йдемо до fallback
          if (episodes.length === 0 && AniuaApi.isBlocked()) {
            throw new Error("Server blocked, trying fallback");
          }

          // Валідуємо та виправляємо m3u8/poster якщо потрібно
          let validatedEpisodes = episodes;
          try {
            validatedEpisodes = await AniuaApi.validateAndFixEpisodes(
              episodes,
              anime.slug
            );
          } catch (validationError) {
            Logger.warn(
              "BottomSheetEpisodes",
              "Validation failed, using original episodes",
              validationError as Error
            );
          }

          // Групуємо вже провалідовані епізоди
          grouped = {};
          validatedEpisodes.forEach((episode) => {
            const player = episode.player || "unknown";
            const team = episode.team || "Невідомо";

            if (!grouped[player]) {
              grouped[player] = {};
            }
            if (!grouped[player][team]) {
              grouped[player][team] = [];
            }
            grouped[player][team].push(episode);
          });

          // Сортуємо епізоди за номером в кожній групі
          Object.values(grouped).forEach((teams) => {
            Object.values(teams).forEach((eps) => {
              eps.sort((a, b) => a.episode - b.episode);
            });
          });
        } catch (aniuaError) {
          Logger.warn(
            "BottomSheetEpisodes",
            "AniuaApi failed, trying fallback to HikkaApi",
            aniuaError as Error
          );

          try {
            const hikkaResult = await HikkaApiComplete.getEpisodes(anime.slug);
            if (hikkaResult.data && typeof hikkaResult.data === "object") {
              grouped = convertHikkaEpisodes(hikkaResult.data, anime.slug);
              usedFallback = true;
              Logger.info(
                "BottomSheetEpisodes",
                "Successfully loaded episodes from HikkaApi fallback"
              );
            } else {
              throw new Error("Invalid HikkaApi response");
            }
          } catch (hikkaError) {
            Logger.error(
              "BottomSheetEpisodes",
              "Both AniuaApi and HikkaApi failed",
              hikkaError as Error
            );
            setError("Не вдалося завантажити епізоди");
            setIsLoading(false);
            return;
          }
        }

        try {
          setEpisodesByPlayer(grouped);

          const allTeams = new Set<string>();
          Object.values(grouped).forEach((teams) => {
            Object.keys(teams).forEach((team) => allTeams.add(team));
          });

          if (!usedFallback) {
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

          const availablePlayers = Object.keys(grouped);
          let initialPlayerName = "moon";
          if (currentPlayer && grouped[currentPlayer]) {
            initialPlayerName = currentPlayer;
          } else if (!grouped["moon"] && availablePlayers.length > 0) {
            initialPlayerName = availablePlayers[0];
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
            "BottomSheetEpisodes",
            "Failed to process data",
            err as Error
          );
          setError("Не вдалося завантажити епізоди");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anime?.slug]);

    // ==================== COMPUTED VALUES ====================

    const availablePlayers = useMemo(() => {
      return Object.keys(episodesByPlayer);
    }, [episodesByPlayer]);

    const currentDubbings = useMemo(() => {
      return episodesByPlayer[selectedPlayer.name] || {};
    }, [episodesByPlayer, selectedPlayer]);

    const sortedDubbings = useMemo(() => {
      const dubbingNames = Object.keys(currentDubbings);
      return sortDubbingsByPartnerStudios(dubbingNames);
    }, [currentDubbings]);

    const currentEpisodes = useMemo(() => {
      if (!selectedPlayer.name || !selectedDubbing) return [];
      return episodesByPlayer[selectedPlayer.name]?.[selectedDubbing] || [];
    }, [selectedPlayer, selectedDubbing, episodesByPlayer]);

    // ==================== HANDLERS ====================

    const handlePlayerSelect = useCallback(
      (player: string) => {
        if (player === selectedPlayer.name) return;

        const currentIndex = PLAYER_ORDER.indexOf(selectedPlayer.name);
        const newIndex = PLAYER_ORDER.indexOf(player);
        const direction = newIndex > currentIndex ? "left" : "right";

        setSelectedPlayer(getPlayerInfo(player, themeColors));
        onPlayerChange?.(player);

        const dubbings = Object.keys(episodesByPlayer[player] || {});
        if (dubbings.length > 0) {
          const sorted = sortDubbingsByPartnerStudios(dubbings);
          const firstDubbing = sorted[0]?.name || dubbings[0];
          setSelectedDubbing(firstDubbing);
          onTeamChange?.(firstDubbing);
        }

        playerSlideAnim.setValue(direction === "left" ? 1 : -1);
        Animated.spring(playerSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 12,
          useNativeDriver: true,
        }).start();
      },
      [
        episodesByPlayer,
        onPlayerChange,
        onTeamChange,
        themeColors,
        selectedPlayer.name,
        playerSlideAnim,
      ]
    );

    const handleDubbingSelect = useCallback(
      (dubbing: string) => {
        setSelectedDubbing(dubbing);
        onTeamChange?.(dubbing);
        animateToScreen("episodes");
      },
      [onTeamChange, animateToScreen]
    );

    const handleEpisodePress = useCallback(
      (episode: Episode) => {
        onSelectEpisode?.(episode, useBuiltIn, currentEpisodes);
        sheetRef.current?.close();
      },
      [onSelectEpisode, useBuiltIn, currentEpisodes]
    );

    const handlePlayerTypeToggle = useCallback(
      (isBuiltIn: boolean) => {
        setUseBuiltIn(isBuiltIn);
        onBuiltInPlayerToggle?.(isBuiltIn);
      },
      [onBuiltInPlayerToggle]
    );

    // ==================== SCROLL HANDLING ====================

    useEffect(() => {
      setShowScrollButton(currentEpisodes.length > 10);
      setIsAtEnd(false);
      isAtEndRef.current = false;
      scrollButtonRotation.setValue(0);
    }, [currentEpisodes.length, scrollButtonRotation]);

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
      [scrollButtonRotation]
    );

    const handleScrollButton = useCallback(() => {
      if (!flatListRef.current) return;

      const scrollStep = currentEpisodes.length > 100 ? 50 : 20;

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
    }, [isAtEnd, currentEpisodes.length, scrollButtonRotation]);

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
          isWatched={watchedEpisodes.includes(item.episode)}
          onPress={() => handleEpisodePress(item)}
          onLongPress={
            onLongPressEpisode ? () => onLongPressEpisode(item) : undefined
          }
          anime={anime}
          player={selectedPlayer.name}
          useBuiltIn={useBuiltIn}
        />
      ),
      [
        watchedEpisodes,
        handleEpisodePress,
        onLongPressEpisode,
        anime,
        selectedPlayer.name,
        useBuiltIn,
      ]
    );

    const keyExtractor = useCallback(
      (item: Episode, index: number) =>
        `${item.team}-${item.episode}-${item.id}-${index}`,
      []
    );

    const getItemLayout = useCallback(
      (_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      []
    );

    const renderDubbingItem = useCallback(
      ({ item }: { item: { name: string; team: Team | null } }) => {
        const { name, team } = item;
        const episodesCount = currentDubbings[name]?.length || 0;
        const isSelected = selectedDubbing === name;
        const teamInfo = team || teamInfoMap[name];

        return (
          <DubComponent
            logo={teamInfo?.logo}
            name={name}
            subtitle={`${episodesCount} серій`}
            isPartner={teamInfo?.is_verified}
            onBodyClick={() => handleDubbingSelect(name)}
            onButtonClick={() => {
              if (teamInfo?.telegram) {
                Linking.openURL(teamInfo.telegram);
              }
            }}
            checkColor={isSelected ? themeColors.text : themeColors.primary}
            style={
              isSelected
                ? {
                    backgroundColor: themeColors.primary,
                    color: themeColors.text,
                  }
                : undefined
            }
            subtitleStyle={{
              color: isSelected ? themeColors.subtle : themeColors.primary,
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
                  color={isSelected ? themeColors.text : themeColors.primary}
                />
              )
            }
          />
        );
      },
      [
        currentDubbings,
        selectedDubbing,
        teamInfoMap,
        handleDubbingSelect,
        themeColors,
      ]
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
      >
        <BottomSheetView style={styles.container}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={themeColors.primary}
              style={styles.loader}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon.WarningCircle size={48} color={themeColors.inActiveText} />
              <Text
                selectable={true}
                style={[H4, { color: themeColors.inActiveText, marginTop: 12 }]}
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
                    const episodes = await AniuaApi.getAnimeEpisodes(
                      anime.slug
                    );
                    let validatedEpisodes = episodes;
                    try {
                      validatedEpisodes = await AniuaApi.validateAndFixEpisodes(
                        episodes,
                        anime.slug
                      );
                    } catch {
                      // Use original if validation fails
                    }

                    const grouped: EpisodesByPlayerAndTeam = {};
                    validatedEpisodes.forEach((episode) => {
                      const player = episode.player || "unknown";
                      const team = episode.team || "Невідомо";
                      if (!grouped[player]) grouped[player] = {};
                      if (!grouped[player][team]) grouped[player][team] = [];
                      grouped[player][team].push(episode);
                    });

                    Object.values(grouped).forEach((teams) => {
                      Object.values(teams).forEach((eps) => {
                        eps.sort((a, b) => a.episode - b.episode);
                      });
                    });

                    setEpisodesByPlayer(grouped);
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
              {/* Episodes Screen */}
              <Animated.View
                style={[
                  styles.screen,
                  { transform: [{ translateX: episodesTranslateX }], width },
                ]}
              >
                {selectedDubbing && (
                  <DubbingButton
                    dubbingName={selectedDubbing}
                    team={teamInfoMap[selectedDubbing]}
                    currentPlayer={selectedPlayer}
                    onPress={() => animateToScreen("dubbing")}
                    useBuiltIn={useBuiltIn}
                    onPlayerTypeToggle={handlePlayerTypeToggle}
                  />
                )}

                {currentEpisodes.length === 0 ? (
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
                      data={currentEpisodes}
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
              </Animated.View>

              {/* Dubbing Selection Screen */}
              <Animated.View
                style={[
                  styles.screen,
                  styles.dubbingScreen,
                  {
                    transform: [{ translateX: dubbingTranslateX }],
                    width,
                  },
                ]}
              >
                <PlayerTabs
                  availablePlayers={availablePlayers}
                  activePlayer={selectedPlayer}
                  onPlayerSelect={handlePlayerSelect}
                />

                <View
                  style={{
                    backgroundColor: themeColors.subtle,
                    flex: 1,
                  }}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      transform: [
                        {
                          translateX: playerSlideAnim.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: [-width * 0.3, 0, width * 0.3],
                          }),
                        },
                      ],
                      opacity: playerSlideAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [0, 1, 0],
                      }),
                    }}
                  >
                    <FlatList
                      data={sortedDubbings}
                      renderItem={renderDubbingItem}
                      keyExtractor={(item) => item.name}
                      showsVerticalScrollIndicator={false}
                      style={{ paddingTop: 8 }}
                      contentContainerStyle={styles.dubbingListContent}
                    />
                  </Animated.View>
                </View>
              </Animated.View>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheetEpisodesComponent.displayName = "BottomSheetEpisodesComponent";

export default BottomSheetEpisodesComponent;
