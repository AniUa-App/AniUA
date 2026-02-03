import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  Pressable,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BloomImage, { prefetchBloomImage } from "./BloomImage";
import { AniuaApi } from "../Api/AniuaApi";
import FastImage from "react-native-fast-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import { H2, H4 } from "../Styles/Fonts";

const CARD_BORDER_RADIUS = 20;

const AnimatedDot = React.memo(({ index, progress, total, onPress }) => {
  const themeColors = useThemeColors();
  const animatedStyle = useAnimatedStyle(() => {
    // Нормалізуємо progress для loop режиму
    let normalizedProgress = progress.value % total;
    if (normalizedProgress < 0) normalizedProgress += total;

    // Відстань до поточного індексу (з урахуванням loop)
    let distance = Math.abs(normalizedProgress - index);
    if (distance > total / 2) {
      distance = total - distance;
    }

    // Плавна анімація: 0 = активний, 1 = неактивний
    const activeValue = interpolate(
      distance,
      [0, 0.5, 1],
      [1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      width: interpolate(activeValue, [0, 1], [8, 24], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(
        activeValue,
        [0, 1],
        [themeColors.text, themeColors.primary]
      ),
    };
  }, [index, total, themeColors]);

  return (
    <Pressable onPress={() => onPress?.(index)}>
      <Animated.View style={[styles.paginationDot, animatedStyle]} />
    </Pressable>
  );
});

const PaginationDots = React.memo(({ total, progress, onPress }) => {
  if (total <= 1) return null;
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <AnimatedDot
          key={index}
          index={index}
          progress={progress}
          total={total}
          onPress={onPress}
        />
      ))}
    </View>
  );
});

const Mobile = React.memo(({ animes }) => {
  const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = useWindowDimensions();
  const BANNER_WIDTH = Math.round(PAGE_WIDTH);
  const BANNER_HEIGHT = Math.round(Math.max(200, PAGE_HEIGHT / 1.4));
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const progress = useSharedValue(0);
  const themeColors = useThemeColors();
  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef(null);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    if (animes?.length > 0) {
      const slugs = animes.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [animes]);

  // AutoPlay
  useEffect(() => {
    if (!animes?.length || animes.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      if (isTouchingRef.current) return;

      const nextIndex = (currentIndexRef.current + 1) % animes.length;
      currentIndexRef.current = nextIndex;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      progress.value = withTiming(nextIndex, { duration: 300 });
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [animes?.length]);

  const onTouchStart = useCallback(() => {
    isTouchingRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  const handlePress = useCallback(
    (item) => {
      prefetchBloomImage(item.image);
      navigation.navigate("HiddenStack", {
        screen: "AnimePreview",
        params: { anime: item },
      });
    },
    [navigation]
  );

  const onPressPagination = useCallback((index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    currentIndexRef.current = index;
  }, []);

  const onScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      progress.value = offsetX / BANNER_WIDTH;
    },
    [BANNER_WIDTH]
  );

  const onMomentumScrollEnd = useCallback(
    (event) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / BANNER_WIDTH
      );
      currentIndexRef.current = newIndex;
    },
    [BANNER_WIDTH]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: BANNER_WIDTH,
      offset: BANNER_WIDTH * index,
      index,
    }),
    [BANNER_WIDTH]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const title = item.title_ua || item.title_en || item.title_ja || "";
      const year = item.year;
      const score = item.score;

      return (
        <Pressable
          onPress={() => handlePress(item)}
          style={[
            styles.itemContainer,
            {
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <BloomImage
            uri={item.image}
            width={BANNER_WIDTH * 0.9}
            height={BANNER_HEIGHT * 0.9}
            blurRadius={100}
            borderRadius={16}
            blurBorderRadius={0}
            glowScale={1.15}
            resizeMode={FastImage.resizeMode.cover}
            fadePercent={0.2}
          />
          {/* Darkening gradient overlay */}
          <LinearGradient
            colors={["transparent", themeColors.Background(0.5)]}
            locations={[0, 1]}
            style={[
              styles.gradientOverlay,
              {
                width: BANNER_WIDTH * 0.83,
                height: BANNER_HEIGHT * 0.85,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Rating badge */}
          {score > 0 && (
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: themeColors.Background(0.8) },
              ]}
            >
              <Icons.StarFour size={32} color={themeColors.primary} />
              <Text selectable={true} style={[H4, { color: themeColors.text }]}>
                {score.toFixed(1)}
              </Text>
            </View>
          )}
          {/* Title and play button */}
          <View
            style={[
              styles.bottomOverlay,
              {
                alignItems: title.length > 20 ? "flex-start" : "center",
              },
            ]}
          >
            <View style={styles.titleContainer}>
              <Text
                selectable={true}
                style={[
                  H2,
                  {
                    color: themeColors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {title}
                {year ? ` (${year})` : ""}
              </Text>
            </View>
            <View
              style={[
                styles.playButton,
                {
                  backgroundColor: themeColors.background,
                  width: 54,
                  height: 54,
                },
              ]}
            >
              <Icons.PlayCircle size={32} color={themeColors.primary} />
            </View>
          </View>
        </Pressable>
      );
    },
    [handlePress, themeColors, BANNER_WIDTH, BANNER_HEIGHT]
  );

  if (!animes?.length) return null;

  return (
    <View
      style={[
        styles.container,
        {
          height: BANNER_HEIGHT,
          backgroundColor: "transparent",
          alignItems: "center",
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={animes}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        getItemLayout={getItemLayout}
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        scrollEventThrottle={16}
      />
      <PaginationDots
        total={animes.length}
        progress={progress}
        onPress={onPressPagination}
      />
    </View>
  );
});

const Tablet = React.memo(({ animes }) => {
  const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = useWindowDimensions();
  const BANNER_WIDTH = Math.round(PAGE_WIDTH * 0.4);
  const BANNER_HEIGHT = Math.round(PAGE_HEIGHT * 0.85);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const progress = useSharedValue(0);
  const themeColors = useThemeColors();
  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef(null);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    if (animes?.length > 0) {
      const slugs = animes.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [animes]);

  // AutoPlay
  useEffect(() => {
    if (!animes?.length || animes.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      if (isTouchingRef.current) return;

      const nextIndex = (currentIndexRef.current + 1) % animes.length;
      currentIndexRef.current = nextIndex;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      progress.value = withTiming(nextIndex, { duration: 300 });
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [animes?.length]);

  const onTouchStart = useCallback(() => {
    isTouchingRef.current = true;
  }, []);

  const onTouchEnd = useCallback(() => {
    isTouchingRef.current = false;
  }, []);

  const handlePress = useCallback(
    (item) => {
      prefetchBloomImage(item.image);
      navigation.navigate("HiddenStack", {
        screen: "AnimePreview",
        params: { anime: item },
      });
    },
    [navigation]
  );

  const onPressPagination = useCallback((index) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    currentIndexRef.current = index;
  }, []);

  const onScroll = useCallback(
    (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      progress.value = offsetX / BANNER_WIDTH;
    },
    [BANNER_WIDTH]
  );

  const onMomentumScrollEnd = useCallback(
    (event) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / BANNER_WIDTH
      );
      currentIndexRef.current = newIndex;
    },
    [BANNER_WIDTH]
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: BANNER_WIDTH,
      offset: BANNER_WIDTH * index,
      index,
    }),
    [BANNER_WIDTH]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const title = item.title_ua || item.title_en || item.title_ja || "";
      const year = item.year;
      const score = item.score;

      return (
        <Pressable
          onPress={() => handlePress(item)}
          style={[
            styles.itemContainer,
            {
              width: BANNER_WIDTH,
              height: BANNER_HEIGHT,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <BloomImage
            uri={item.image}
            width={BANNER_WIDTH * 0.9}
            height={BANNER_HEIGHT * 0.9}
            blurRadius={100}
            borderRadius={16}
            blurBorderRadius={0}
            glowScale={1.15}
            resizeMode={FastImage.resizeMode.cover}
            fadePercent={0.2}
          />
          {/* Darkening gradient overlay */}
          <LinearGradient
            colors={["transparent", themeColors.Background(0.5)]}
            locations={[0, 1]}
            style={[
              styles.gradientOverlay,
              {
                width: BANNER_WIDTH * 0.83,
                height: BANNER_HEIGHT * 0.85,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Rating badge */}
          {score > 0 && (
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: themeColors.Background(0.8) },
              ]}
            >
              <Icons.StarFour size={28} color={themeColors.primary} />
              <Text selectable={true} style={[H4, { color: themeColors.text }]}>
                {score.toFixed(1)}
              </Text>
            </View>
          )}
          {/* Title and play button */}
          <View
            style={[
              styles.bottomOverlay,
              {
                alignItems: title.length > 20 ? "flex-start" : "center",
              },
            ]}
          >
            <View style={styles.titleContainer}>
              <Text
                selectable={true}
                style={[
                  H2,
                  {
                    color: themeColors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {title}
                {year ? ` (${year})` : ""}
              </Text>
            </View>
            <View
              style={[
                styles.playButton,
                {
                  backgroundColor: themeColors.background,
                  width: 48,
                  height: 48,
                },
              ]}
            >
              <Icons.PlayCircle size={28} color={themeColors.primary} />
            </View>
          </View>
        </Pressable>
      );
    },
    [handlePress, themeColors, BANNER_WIDTH, BANNER_HEIGHT]
  );

  if (!animes?.length) return null;

  return (
    <View
      style={[
        styles.container,
        {
          height: BANNER_HEIGHT,
          backgroundColor: "transparent",
          alignItems: "center",
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={animes}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.slug || index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        getItemLayout={getItemLayout}
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="start"
        scrollEventThrottle={16}
      />
      <PaginationDots
        total={animes.length}
        progress={progress}
        onPress={onPressPagination}
      />
    </View>
  );
});

export default { Mobile, Tablet };

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
  },
  itemContainer: {
    flex: 1,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#E53935",
  },
  ratingBadge: {
    position: "absolute",
    top: "12%",
    right: "8.7%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    gap: 4,
  },

  bottomOverlay: {
    margin: 18,
    position: "absolute",
    bottom: "8%",
    left: "8%",
    right: "8%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
  },

  playButton: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientOverlay: {
    position: "absolute",
    borderRadius: 16,
  },
});
