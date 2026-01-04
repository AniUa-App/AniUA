import React, { useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, Text } from "react-native";
import { TouchableOpacity } from "./Button";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import BloomImage, { prefetchBloomImage } from "./BloomImage";
import { AniuaApi } from "../Sources/AniuaApi";
import Carousel from "react-native-reanimated-carousel";
import FastImage from "react-native-fast-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  Extrapolation,
} from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import { H2, H1, H3, H4 } from "../Styles/Fonts";

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
    <TouchableOpacity onPress={() => onPress?.(index)} activeOpacity={0.7}>
      <Animated.View style={[styles.paginationDot, animatedStyle]} />
    </TouchableOpacity>
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
  const carouselRef = useRef(null);
  const progress = useSharedValue(0);
  const themeColors = useThemeColors();

  useEffect(() => {
    if (animes?.length > 0) {
      const slugs = animes.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [animes]);

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
    carouselRef.current?.scrollTo({ index, animated: true });
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const title = item.title_ua || item.title_en || item.title_ja || "";
      const year = item.year;
      const score = item.score;

      return (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          activeOpacity={0.95}
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
              <Text style={[H4, { color: themeColors.text }]}>
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
            <TouchableOpacity
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
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
      <Carousel
        ref={carouselRef}
        loop
        autoPlay
        autoPlayInterval={4000}
        style={{ width: BANNER_WIDTH, height: BANNER_HEIGHT }}
        width={BANNER_WIDTH}
        height={BANNER_HEIGHT}
        data={animes}
        renderItem={renderItem}
        scrollAnimationDuration={1200}
        onProgressChange={progress}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
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
  const CARD_WIDTH = Math.round(PAGE_WIDTH / 2.5);
  const BANNER_HEIGHT = Math.round(PAGE_HEIGHT * 0.8);
  const navigation = useNavigation();

  useEffect(() => {
    if (animes?.length > 0) {
      const slugs = animes.map((a) => a.slug).filter(Boolean);
      AniuaApi.prefetchMultipleEpisodes(slugs, 3);
    }
  }, [animes]);

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

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        onPress={() => handlePress(item)}
        activeOpacity={0.95}
        style={styles.itemContainer}
      >
        <FastImage
          source={{ uri: item.image }}
          style={styles.itemImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </TouchableOpacity>
    ),
    [handlePress]
  );

  if (!animes?.length) return null;

  return (
    <View
      style={[
        styles.container,
        {
          width: CARD_WIDTH,
          height: BANNER_HEIGHT,
          backgroundColor: "transparent",
        },
      ]}
    >
      <Carousel
        loop
        autoPlay
        autoPlayInterval={4000}
        style={{ width: CARD_WIDTH, height: BANNER_HEIGHT }}
        width={CARD_WIDTH}
        height={BANNER_HEIGHT}
        data={animes}
        renderItem={renderItem}
        scrollAnimationDuration={1200}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
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
