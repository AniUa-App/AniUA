import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions, FlatList } from "react-native";
import { TouchableOpacity } from "./Button";
import LinearGradient from "react-native-linear-gradient";
import { GetScreenHeight, GetScreenWidth } from "../Global/Functions";
import { useNavigation } from "@react-navigation/native";
import { Image } from "./LoadersWidgets";

const width = GetScreenWidth();
const height = GetScreenHeight() * 0.7;

const BigBannerWidget = React.memo(({ animes }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  useEffect(() => {
    if (!animes || animes.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % animes.length;

        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [animes]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems && viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== null && newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
        }
      }
    },
    [currentIndex]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() =>
          navigation.navigate("HiddenStack", {
            screen: "AnimePreview",
            params: { anime: item },
          })
        }
      >
        <Image uri={item.image} style={{ width: "100%", height: "100%" }} />

        <LinearGradient
          colors={["rgba(255,249,249,0)", "rgba(24,28,20,0.9)"]}
          style={styles.bottomGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </TouchableOpacity>
    ),
    [navigation]
  );

  const keyExtractor = useCallback(
    (item, index) => `banner-${item.slug || index}`,
    []
  );

  if (!animes || animes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={animes}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
});

export default BigBannerWidget;

const styles = StyleSheet.create({
  container: {
    height: height,
  },
  imageContainer: {
    width: width,
    height: height,
    position: "relative",
  },

  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "35%",
  },
});
