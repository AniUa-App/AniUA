import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Animated,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Svg, Path } from "react-native-svg";
import { appColor, Black, black, white } from "../Styles/Colors";
import { TouchableOpacity } from "./Button";
import { HikkaApi } from "../Sources/hikka";
import ExpandableNotification from "./ExpandableNotification";
import AnimePreviewWidget from "./AnimePreviewWidget";
import Logger from "../Logger/Logger";

export default function SearchLine() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isVisibleNotification, setIsVisibleNotification] = useState(false);
  const [loadedAnimeList, setLoadedAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchAnime = async (event) => {
    try {
      const query = searchText.trim();
      if (!query) return;

      setIsVisibleNotification(false);
      setLoadedAnimeList([]);
      setIsLoading(true);

      const anime = await HikkaApi.searchAnime(query);
      Logger.debug("SearchLine", "Search results", { anime });

      if (!anime || anime.length === 0) {
        setIsVisibleNotification(true);
        return;
      }

      const animeDetails = await Promise.all(
        anime.map((item) => HikkaApi.getAnimeDetails(item.slug))
      );

      if (animeDetails && animeDetails.length > 0) {
        setLoadedAnimeList(animeDetails);
      } else {
        setIsVisibleNotification(true);
      }
    } catch (error) {
      Logger.error("SearchLine", "Помилка пошуку", error);
      setIsVisibleNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const animationValue = useRef(new Animated.Value(0)).current;
  const inputWidth = useRef(new Animated.Value(0)).current;
  const buttonRadius = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: isFocused ? 1 : 0,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    if (isFocused) {
      Animated.sequence([
        Animated.timing(buttonRadius, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(inputWidth, {
          toValue: width * 0.85,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(inputWidth, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonRadius, {
          toValue: 8,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isFocused, width]);

  const animatedColor = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [white, appColor],
  });

  return (
    <>
      {isFocused && (
        <TouchableOpacity
          style={{
            zIndex: 10,
            ...StyleSheet.absoluteFillObject,
          }}
          onPress={() => {
            setIsFocused(false);
            setLoadedAnimeList([]);
            setSearchText("");
          }}
        />
      )}
      <View style={[styles.container, { top: height * 0.06 }]}>
        <View style={styles.row}>
          <Animated.View
            style={[
              styles.button,
              {
                borderRadius: buttonRadius,
              },
            ]}
          >
            <TouchableOpacity
              style={[StyleSheet.absoluteFill, styles.iconContainer]}
              onPress={() => {
                setIsFocused(!isFocused);
                setLoadedAnimeList([]);
                setSearchText("");
              }}
              activeOpacity={1}
            >
              <SearchIcon fill={animatedColor} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.inputContainer,
              {
                width: inputWidth,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  borderBottomRightRadius:
                    isVisibleNotification ||
                    loadedAnimeList.length > 0 ||
                    isLoading
                      ? 0
                      : 8,
                },
              ]}
              placeholder="Пошук..."
              placeholderTextColor={white}
              onChangeText={(text) => setSearchText(text)}
              value={searchText}
              onSubmitEditing={searchAnime}
            />
          </Animated.View>
        </View>
        {isLoading && isFocused && (
          <View
            style={{
              backgroundColor: Black(0.7),
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
            }}
          >
            <ActivityIndicator size="small" color={appColor} />
          </View>
        )}
        {loadedAnimeList.length > 0 && isFocused && (
          <View
            style={{
              maxHeight: 500,
              backgroundColor: Black(0.7),
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <FlatList
              data={loadedAnimeList || []}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item.slug}
              renderItem={({ item }) => (
                <AnimePreviewWidget
                  anime={item}
                  info={{}}
                  updateInfo={() => {}}
                  type="Search"
                  maxHeight={190 / 2}
                  maxWidth={width * 0.85}
                />
              )}
              ListEmptyComponent={
                <Text
                  style={{ color: "white", textAlign: "center", padding: 16 }}
                >
                  Аніме не знайдено
                </Text>
              }
              keyboardShouldPersistTaps="handled"
            />
            <View style={{ height: 10 }} />
          </View>
        )}

        <ExpandableNotification
          visible={isVisibleNotification}
          message={"Аніме не знайдено"}
          onHide={() => {
            setIsVisibleNotification(false);
          }}
          style={{
            backgroundColor: Black(0.7),
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        />
      </View>
    </>
  );
}

function SearchIcon({ fill }) {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <Svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <AnimatedPath
        d="M0.498281 25.9983L7.1482 19.3497C5.22079 17.0357 4.25968 14.0677 4.46481 11.0632C4.66995 8.0586 6.02553 5.24879 8.24956 3.21824C10.4736 1.18769 13.3949 0.0927414 16.4056 0.161166C19.4164 0.229591 22.2849 1.45612 24.4144 3.58561C26.5439 5.7151 27.7704 8.5836 27.8388 11.5944C27.9073 14.6051 26.8123 17.5264 24.7818 19.7504C22.7512 21.9745 19.9414 23.3301 16.9368 23.5352C13.9323 23.7403 10.9643 22.7792 8.65031 20.8518L2.00172 27.5017C1.903 27.6004 1.78581 27.6787 1.65683 27.7322C1.52785 27.7856 1.38961 27.8131 1.25 27.8131C1.11039 27.8131 0.972155 27.7856 0.843174 27.7322C0.714193 27.6787 0.596998 27.6004 0.498281 27.5017C0.399565 27.403 0.321259 27.2858 0.267834 27.1568C0.214409 27.0278 0.186909 26.8896 0.186909 26.75C0.186909 26.6104 0.214409 26.4722 0.267834 26.3432C0.321259 26.2142 0.399565 26.097 0.498281 25.9983ZM25.6875 11.875C25.6875 9.98371 25.1267 8.1349 24.0759 6.56236C23.0252 4.98981 21.5317 3.76416 19.7844 3.0404C18.0371 2.31664 16.1144 2.12727 14.2595 2.49624C12.4045 2.86521 10.7006 3.77595 9.36329 5.11329C8.02595 6.45063 7.11521 8.1545 6.74624 10.0094C6.37727 11.8644 6.56664 13.7871 7.2904 15.5344C8.01417 17.2817 9.23982 18.7752 10.8124 19.8259C12.3849 20.8767 14.2337 21.4375 16.125 21.4375C18.6603 21.4347 21.0909 20.4263 22.8836 18.6336C24.6763 16.8409 25.6847 14.4103 25.6875 11.875Z"
        fill={fill}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
    left: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(24, 28, 20, 0.7)",
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    overflow: "hidden",
  },
  input: {
    height: 40,
    backgroundColor: "rgba(24, 28, 20, 0.7)",
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    color: white,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
