import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { TextInputWidget } from "./MainScreenCustomisation";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import SliderWidget from "../Widgets/SliderWidget";
import type { ViewStyle } from "react-native";
import type { CustomAnimeSet } from "../Storage/PersonalRecListStorage";
import type ReqCustomSet from "../Sources/CustomSet";
import {
  Genres,
  getGenres,
  Statuses,
  Seasons,
  Sort,
  Rating,
  getPagesAndSizes,
  sendRequest,
} from "../Sources/CustomSet";
import { CustomAnimeSet as CustomAnimeSetType } from "../Storage/PersonalRecListStorage";
import { PreviewAnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import Logger from "../Logger/Logger";

const SegmentedControlLabelWidgetAny: any = SegmentedControlLabelWidget;
const InputPickerWidgetAny: any = InputPickerWidget;
const SliderWidgetAny: any = SliderWidget;
const TextInputWidgetAny: any = TextInputWidget;

type VoidFn = () => void;

export function CustomAnimeListsPreviewScreen({
  onPressAdd = () => {},
  onPressEdit = () => {},
  animeList = [],
}: {
  onPressAdd?: VoidFn;
  onPressEdit?: (anime: any) => void;
  animeList?: CustomAnimeSetType[];
}) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [loadedAnimeLists, setLoadedAnimeLists] =
    useState<{ name: string; animeList: any[] }[]>();

  useEffect(() => {
    if (!animeList || animeList.length === 0) {
      setLoadedAnimeLists([]);
      return;
    }

    setLoading(true);
    Promise.all(
      animeList.map(async (anime) => {
        try {
          const res = await sendRequest(anime, "preview");
          return { name: anime.name, animeList: res };
        } catch (e) {
          return { name: anime.name, animeList: [] };
        }
      }),
    )
      .then((results) => {
        setLoadedAnimeLists(results);
        Logger.debug("BottomSheetScreens", "Search results", { results });
      })
      .finally(() => setLoading(false));
  }, [animeList]);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: 16,
          paddingTop: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            onPressAdd?.();
          }}
          style={{
            width: 44,
            height: 44,
            backgroundColor: colors.primary,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.Plus size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        {loading && <ActivityIndicator size="large" color={colors.primary} />}
        {!loading &&
          loadedAnimeLists?.map((anime, index) => (
            <PreviewAnimeListHorizontal
              key={`${anime.name}-${index}`}
              animeList={anime.animeList}
              title={anime.name}
              onPress={() => {
                onPressEdit?.(anime.name);
              }}
            />
          ))}
      </View>
    </View>
  );
}

function createDefaultReqCustomSet(): ReqCustomSet {
  return {
    Genres: [],
    Statuses: "Онґоінг",
    Seasons: "Зима",
    IsUkrainianised: true,
    Sort: "Загальна оцінка",
    Rating: "G",
    Years: [1965, new Date().getFullYear()],
    Score: [0, 10],
  };
}

function createDefaultCustomSet(): CustomAnimeSet {
  return {
    name: "",
    animeSet: createDefaultReqCustomSet(),
    type: "horizontal",
    pages: 1,
    size: 10,
    isArrow: true,
  };
}

export function CustomisationAnimeListsScreen({
  onPressCheck = () => {},
  onPressCancel = () => {},
}: {
  onPressCheck?: (payload: CustomAnimeSet) => void;
  onPressCancel?: () => void;
}) {
  const colors = useThemeColors();
  const [LoadedGenres, setLoadedGenres] = useState<string[]>([]);

  const [status, setStatus] = useState<string>("Анонс");
  const [seasons, setSeasons] = useState<string>("Зима");
  const [years, setYears] = useState<[number, number]>([
    1965,
    new Date().getFullYear(),
  ]);
  const [score, setScore] = useState<number>(5);
  const [genres, setGenres] = useState<string[]>([]);
  const [animeListName, setAnimeListName] = useState<string>("");

  async function onPressOk() {
    if (animeListName.length === 0) {
      return;
    }
    const animeSet: ReqCustomSet = {
      Genres: genres.map((genre) => Genres[genre]),
      Statuses: status ? Statuses[status] : [],
      Seasons: seasons ? Seasons[seasons] : [],
      IsUkrainianised: true,
      Sort: Sort["Загальна оцінка"],
      Rating: [],
      Years: years,
      Score: [score, 10],
    };

    const { size, pages } = await getPagesAndSizes(animeSet);
    Logger.debug("BottomSheetScreens", "Pagination info", { size, pages });
    const payload: CustomAnimeSetType = {
      name: animeListName,
      animeSet: animeSet,
      type: "horizontal",
      pages: pages,
      size: size,
      isArrow: null,
    };
    onPressCheck(payload);
  }

  useEffect(() => {
    getGenres().then((res) => {
      setLoadedGenres(res);
    });
  }, []);

  return (
    <View style={{ flex: 1, paddingBottom: 100 }}>
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          marginBottom: 16,
          gap: 30,
        }}
      >
        <TextInputWidgetAny
          style={{ width: "80%" }}
          placeholder="Назва"
          title={animeListName}
          onChangeText={(text: string) => {
            setAnimeListName(text);
          }}
        />
        <TouchableOpacity
          onPress={() => {
            if (animeListName.length > 0) {
              onPressOk();
            } else {
              onPressCancel();
            }
          }}
          style={{
            width: 44,
            height: 44,
            backgroundColor: colors.primary,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {animeListName.length > 0 ? (
            <Icons.Check size={24} color={colors.text} />
          ) : (
            <Icons.X size={24} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          gap: 16,
          alignItems: "center",
        }}
      >
        <SegmentedControlLabelWidgetAny
          segments={[
            { label: "Анонс" },
            { label: "Онґоінг" },
            { label: "Завершено" },
            { label: "Байдуже" },
          ]}
          onChange={(item: any) => {
            setStatus(item?.label ?? item);
          }}
        />
        <SegmentedControlLabelWidgetAny
          segments={[
            { label: "Зима" },
            { label: "Весна" },
            { label: "Літо" },
            { label: "Осінь" },
            { label: "Байдуже" },
          ]}
          onChange={(item: any) => {
            setSeasons(item?.label ?? item);
          }}
        />
        <InputPickerWidgetAny
          items={LoadedGenres}
          onChange={(item: any) => {
            setGenres(item);
          }}
        />
        <SliderWidgetAny
          label="Рік"
          min={2000}
          max={2025}
          value={years}
          defaultValue={2005}
          style={{}}
          onChange={(item: any) => {
            setYears([item, new Date().getFullYear()]);
          }}
        />
        <SliderWidgetAny
          label="Оцінка"
          min={0}
          max={10}
          value={score}
          defaultValue={5}
          style={{}}
          onChange={(item: any) => {
            setScore(item);
          }}
        />
      </View>
    </View>
  );
}

export function AnimatedView({
  animation = "right",
  children,
  style,
  duration = 300,
  delay = 0,
  distance,
}: {
  animation?: "left" | "right";
  children?: React.ReactNode;
  style?: ViewStyle;
  duration?: number;
  delay?: number;
  distance?: number;
}) {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useSharedValue(
    animation === "left"
      ? -(distance ?? screenWidth)
      : (distance ?? screenWidth),
  );

  useEffect(() => {
    const startOffset =
      animation === "left"
        ? -(distance ?? screenWidth)
        : (distance ?? screenWidth);
    translateX.value = startOffset;
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [animation, duration, delay, distance]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}
