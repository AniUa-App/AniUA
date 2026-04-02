import React, { useEffect, useCallback, useRef, useState } from "react";
import { View, useWindowDimensions, Text, FlatList } from "react-native";
import { TouchableOpacity } from "./Button";
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
import { useBigBannerStyles } from "../Styles/components/BigBannerStyles";

const AnimatedDot = React.memo(({ index, progress, total, onPress }) => {
  const themeColors = useThemeColors();
  const s = useBigBannerStyles();
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
      Extrapolation.CLAMP,
    );

    return {
      width: interpolate(activeValue, [0, 1], [8, 24], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(
        activeValue,
        [0, 1],
        [themeColors.text, themeColors.primary],
      ),
    };
  }, [index, total, themeColors]);

  return (
    <TouchableOpacity onPress={() => onPress?.(index)}>
      <Animated.View style={[s.paginationDot, animatedStyle]} />
    </TouchableOpacity>
  );
});

const PaginationDots = React.memo(({ total, progress, onPress }) => {
  const s = useBigBannerStyles();
  if (total <= 1) return null;
  return (
    <View style={s.paginationContainer}>
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

const Mobile = React.memo(({ content, variant = "anime" }) => {
  const isAnime = variant === "anime";
  const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = useWindowDimensions();
  const BANNER_WIDTH = Math.round(PAGE_WIDTH);
  const BANNER_HEIGHT = Math.round(Math.max(200, PAGE_HEIGHT / 1.4));
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const progress = useSharedValue(0);
  const themeColors = useThemeColors();
  const s = useBigBannerStyles();
  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef(null);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    if (isAnime && content?.length > 0) {
      const slugs = content.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [content, isAnime]);

  // AutoPlay
  useEffect(() => {
    if (!content?.length || content.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      if (isTouchingRef.current) return;

      const nextIndex = (currentIndexRef.current + 1) % content.length;
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
  }, [content?.length]);

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
        screen: isAnime ? "AnimePreview" : "MangaPreview",
        params: isAnime ? { anime: item } : { slug: item.slug, _fromTap: true },
      });
    },
    [navigation, isAnime],
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
    [BANNER_WIDTH],
  );

  const onMomentumScrollEnd = useCallback(
    (event) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / BANNER_WIDTH,
      );
      currentIndexRef.current = newIndex;
    },
    [BANNER_WIDTH],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: BANNER_WIDTH,
      offset: BANNER_WIDTH * index,
      index,
    }),
    [BANNER_WIDTH],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const title =
        item.title_ua || item.title_en || item.title_ja || item.title_original || "";
      const year = item.year;
      const score = item.score;

      return (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={[
            s.itemContainer,
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
            width={BANNER_WIDTH * s.bloomImage.widthScale}
            height={BANNER_HEIGHT * s.bloomImage.heightScale}
            blurRadius={s.bloomImage.blurRadius}
            borderRadius={s.bloomImage.borderRadius}
            blurBorderRadius={s.bloomImage.blurBorderRadius}
            glowScale={s.bloomImage.glowScale}
            resizeMode={FastImage.resizeMode.cover}
            fadePercent={s.bloomImage.fadePercent}
          />

          <LinearGradient
            colors={s.gradientColors}
            locations={[0, 1]}
            style={[
              s.gradientOverlay,
              {
                width: BANNER_WIDTH * s.bloomImage.widthScale,
                height: BANNER_HEIGHT * s.bloomImage.heightScale,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {score > 0 && (
            <View style={s.ratingBadge}>
              <Icons.StarFour
                size={s.mobile.iconSize}
                color={themeColors.primary}
              />
              <Text selectable={true} style={s.ratingText}>
                {score.toFixed(1)}
              </Text>
            </View>
          )}
          <View
            style={[
              s.bottomOverlay,
              { alignItems: title.length > 20 ? "flex-start" : "center" },
            ]}
          >
            <View style={s.titleContainer}>
              <Text selectable={true} style={s.title} numberOfLines={2}>
                {title}
                {year ? ` (${year})` : ""}
              </Text>
            </View>
            <View style={s.mobile.playButton}>
              {isAnime ? (
                <Icons.PlayCircle
                  size={s.mobile.iconSize}
                  color={themeColors.primary}
                />
              ) : (
                <Icons.BookOpen
                  size={s.mobile.iconSize}
                  color={themeColors.primary}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handlePress, themeColors, s, BANNER_WIDTH, BANNER_HEIGHT, isAnime],
  );

  if (!content?.length) return null;

  return (
    <View
      style={[
        s.container,
        {
          height: BANNER_HEIGHT,
          backgroundColor: "transparent",
          alignItems: "center",
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={content}
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
        total={content.length}
        progress={progress}
        onPress={onPressPagination}
      />
    </View>
  );
});

const Tablet = React.memo(({ content, variant = "anime" }) => {
  const isAnime = variant === "anime";
  const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = useWindowDimensions();
  const BANNER_WIDTH = Math.round(PAGE_WIDTH * 0.4);
  const BANNER_HEIGHT = Math.round(PAGE_HEIGHT * 0.85);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const progress = useSharedValue(0);
  const themeColors = useThemeColors();
  const s = useBigBannerStyles();
  const currentIndexRef = useRef(0);
  const autoPlayRef = useRef(null);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    if (isAnime && content?.length > 0) {
      const slugs = content.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [content, isAnime]);

  // AutoPlay
  useEffect(() => {
    if (!content?.length || content.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      if (isTouchingRef.current) return;

      const nextIndex = (currentIndexRef.current + 1) % content.length;
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
  }, [content?.length]);

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
        screen: isAnime ? "AnimePreview" : "MangaPreview",
        params: isAnime ? { anime: item } : { slug: item.slug, _fromTap: true },
      });
    },
    [navigation, isAnime],
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
    [BANNER_WIDTH],
  );

  const onMomentumScrollEnd = useCallback(
    (event) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / BANNER_WIDTH,
      );
      currentIndexRef.current = newIndex;
    },
    [BANNER_WIDTH],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: BANNER_WIDTH,
      offset: BANNER_WIDTH * index,
      index,
    }),
    [BANNER_WIDTH],
  );

  const renderItem = useCallback(
    ({ item }) => {
      const title =
        item.title_ua || item.title_en || item.title_ja || item.title_original || "";
      const year = item.year;
      const score = item.score;

      return (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={[
            s.itemContainer,
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
            width={BANNER_WIDTH * s.bloomImage.widthScale}
            height={BANNER_HEIGHT * s.bloomImage.heightScale}
            blurRadius={s.bloomImage.blurRadius}
            borderRadius={s.bloomImage.borderRadius}
            blurBorderRadius={s.bloomImage.blurBorderRadius}
            glowScale={s.bloomImage.glowScale}
            resizeMode={FastImage.resizeMode.cover}
            fadePercent={s.bloomImage.fadePercent}
          />
          <LinearGradient
            colors={s.gradientColors}
            locations={[0, 1]}
            style={[
              s.gradientOverlay,
              { width: BANNER_WIDTH * 0.83, height: BANNER_HEIGHT * 0.85 },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {score > 0 && (
            <View style={s.ratingBadge}>
              <Icons.StarFour
                size={s.tablet.iconSize}
                color={themeColors.primary}
              />
              <Text selectable={true} style={s.ratingText}>
                {score.toFixed(1)}
              </Text>
            </View>
          )}
          <View
            style={[
              s.bottomOverlay,
              { alignItems: title.length > 20 ? "flex-start" : "center" },
            ]}
          >
            <View style={s.titleContainer}>
              <Text selectable={true} style={s.title} numberOfLines={2}>
                {title}
                {year ? ` (${year})` : ""}
              </Text>
            </View>
            <View style={s.tablet.playButton}>
              {isAnime ? (
                <Icons.PlayCircle
                  size={s.tablet.iconSize}
                  color={themeColors.primary}
                />
              ) : (
                <Icons.BookOpen
                  size={s.tablet.iconSize}
                  color={themeColors.primary}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handlePress, themeColors, s, BANNER_WIDTH, BANNER_HEIGHT, isAnime],
  );

  if (!content?.length) return null;

  return (
    <View
      style={[
        s.container,
        {
          height: BANNER_HEIGHT,
          backgroundColor: "transparent",
          alignItems: "center",
        },
      ]}
    >
      <FlatList
        ref={flatListRef}
        data={content}
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
        total={content.length}
        progress={progress}
        onPress={onPressPagination}
      />
    </View>
  );
});

export default { Mobile, Tablet };
