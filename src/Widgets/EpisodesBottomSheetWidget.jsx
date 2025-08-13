import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableHighlight,
  Dimensions,
  FlatList,
  PanResponder,
  Animated,
} from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "./Button";
import {
  AppColor,
  appColor,
  Black,
  black,
  White,
  white,
} from "../Styles/Colors";
import { HikkaApi } from "../Sources/hikka";
import { H3, H4 } from "../Styles/Fonts";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { GetScreenHeight } from "../Global/Functions";
import { EventBus } from "../Global/EventBus";
import Icon from "../Styles/Icons";

// Окремий компонент для елемента серії
const EpisodeItem = React.memo(
  ({
    item,
    checkForStyle,
    onSelectEpisode,
    onLongSelectEpisode,
    sheetRef,
    onSwipeEpisode,
    customIcon = null,
    animeSlug = null,
    type = "list",
  }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const resetAnimation = () => {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    };

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt, gestureState) => {
            // Початок жесту - збільшуємо масштаб
            Animated.spring(scale, {
              toValue: 1.05,
              useNativeDriver: true,
            }).start();
          },
          onPanResponderMove: (evt, gestureState) => {
            const { dx } = gestureState;
            // Анімуємо рух вправо
            if (dx > 0) {
              translateX.setValue(dx * 0.3); // Зменшуємо рух для плавності
            }
          },
          onPanResponderRelease: (evt, gestureState) => {
            const { dx } = gestureState;

            if (dx > 30 && onSwipeEpisode) {
              onSwipeEpisode(item);

              // Додаткова анімація при успішному свайпі
              Animated.sequence([
                Animated.timing(scale, {
                  toValue: 1.1,
                  duration: 100,
                  useNativeDriver: true,
                }),
                Animated.timing(scale, {
                  toValue: 1,
                  duration: 100,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                // Автоматично повертаємо в початкове положення після анімації
                setTimeout(resetAnimation, 1);
              });
            } else {
              // Якщо свайп не досяг порогу - повертаємо одразу
              resetAnimation();
            }
          },
        }),
      []
    );

    const [downloadPct, setDownloadPct] = useState(null);
    const [downloadStatus, setDownloadStatus] = useState(null);
    const [pendingStart, setPendingStart] = useState(false);

    useEffect(() => {
      if (!animeSlug) return;
      const off = EventBus.on("downloadProgress", (payload) => {
        if (
          payload?.slug === animeSlug &&
          Number(payload?.episode) === Number(item?.episode)
        ) {
          setDownloadStatus(payload.status);
          setDownloadPct(
            typeof payload.progress === "number" ? payload.progress : null
          );
        }
      });
      return () => off && off();
    }, [animeSlug, item?.episode]);

    const isDownloading =
      pendingStart ||
      (downloadPct !== null &&
        downloadStatus !== "error" &&
        downloadStatus !== "success");

    return (
      <>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.rowContainer,
            {
              transform: [
                { translateX: onSwipeEpisode ? translateX : 0 },
                { scale: onSwipeEpisode ? scale : 1 },
              ],
            },
          ]}
        >
          <TouchableHighlight
            style={styles.rowFront}
            underlayColor={"transparent"}
            onLongPress={() => {
              onLongSelectEpisode(item);
            }}
            onPress={() => {
              if (type === "download") {
                if (isDownloading) return; // Забороняємо повторний старт
                setPendingStart(true); // оптимістично блокуємо до приходу події
              }
              sheetRef.current?.close();
              onSelectEpisode(item);
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                width: "90%",
                opacity: isDownloading && type === "download" ? 0.8 : 1,
              }}
            >
              <Text
                style={[
                  H3,
                  {
                    color: checkForStyle(item) ? appColor : white,
                  },
                ]}
              >
                Серія {item.episode}
              </Text>
              {isDownloading && type === "download" ? (
                <Icon.DownloadAnimated size={34} color={appColor} />
              ) : customIcon ? (
                customIcon
              ) : null}
            </View>
          </TouchableHighlight>
        </Animated.View>
      </>
    );
  }
);

export default function EpisodesBottomSheet({
  sheetRef,
  episodesList,
  storage_data,
  checkForStyle,
  isChanges,
  onSelectEpisode,
  onLongSelectEpisode,
  onSwipeEpisode,
  customIcon = null,
  type = "list",
}) {
  const navigation = useNavigation();
  const [episodesData, setEpisodesData] = useState([]);
  const [info, setInfo_] = useState(storage_data || {});
  const [isLoading, setIsLoading] = useState(true);

  const setInfo = (info) => {
    setInfo_(info);
    if (isChanges) {
      isChanges(info);
    }
  };

  useEffect(() => {
    if (storage_data) {
      setInfo_(storage_data);
    }
  }, [storage_data]);

  useLayoutEffect(() => {
    setIsLoading(true);

    if (
      episodesList &&
      Object.keys(episodesList).length > 0 &&
      storage_data?.watched?.player &&
      storage_data?.watched?.dubbing &&
      episodesList[storage_data.watched.player] &&
      episodesList[storage_data.watched.player][storage_data.watched.dubbing]
    ) {
      const episodes =
        episodesList[storage_data.watched.player][storage_data.watched.dubbing];

      // Просто використовуємо оригінальні дані
      setEpisodesData(episodes || []);
    } else {
      setEpisodesData([]);
    }

    setIsLoading(false);
  }, [episodesList, storage_data]);

  const renderItem = ({ item }) => (
    <EpisodeItem
      item={item}
      checkForStyle={checkForStyle}
      onSelectEpisode={onSelectEpisode}
      onLongSelectEpisode={onLongSelectEpisode}
      sheetRef={sheetRef}
      onSwipeEpisode={onSwipeEpisode}
      customIcon={customIcon || null}
      animeSlug={storage_data?.slug || null}
      type={type}
    />
  );

  const keyExtractor = (item, index) => `episode-${item.episode}-${index}`;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["50%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: Black(0.8) }}
      handleIndicatorStyle={{ backgroundColor: Black(1) }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          {...props}
        />
      )}
      animationDuration={300}
      enableContentPanningGesture={false}
    >
      <BottomSheetView style={styles.container}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={appColor}
            style={styles.loader}
          />
        ) : episodesData.length === 0 ? (
          <View style={styles.content}>
            <Text style={[H3, { textAlign: "center", padding: 20 }]}>
              Немає доступних епізодів
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            <FlatList
              data={episodesData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: GetScreenHeight() * 0.6 }}
            />
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  content: {
    width: "100%",
    height: "100%",
    alignContent: "center",
  },
  loader: {
    marginVertical: 20,
  },
  rowContainer: {
    width: "100%",
  },
  rowFront: {
    backgroundColor: "transparent",
    paddingLeft: "15%",
    width: "100%",
    height: 70,
    justifyContent: "center",
  },
});
