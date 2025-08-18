import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import React, { useRef, useState, useLayoutEffect } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { HikkaSets } from "../Sources/HikkaSets";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";

import {
  appColor,
  white,
  black_1,
  White,
  Black,
  Black_1,
  black,
  AppColor,
  gray,
  Gray,
} from "../Styles/Colors";
import { H4 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import CustomSet, { test } from "../Sources/CustomSet";
import SwitchWidget from "../Widgets/SwitchWidget";
import { EventBus } from "../Global/EventBus";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icons from "../Styles/Icons";
import {
  CustomAnimeListsPreviewScreen,
  CustomisationAnimeListsScreen,
} from "./BottomSheetScreens";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { getGenres } from "../Sources/CustomSet";
import SliderWidget from "../Widgets/SliderWidget";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";

import {
  Statuses,
  Seasons,
  Genres,
  Sort,
  Rating,
  getPagesAndSizes,
  sendRequest,
} from "../Sources/CustomSet";
import { PreviewAnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";

export default function MainScreenCustomisationScreen() {
  const [RECOMMENDATIONS, setRecommendations] = useState();

  const RecListRef = useRef(null);

  const [isPersonalRecView, setIsPersonalRecView] = useState(false);
  const [PerRecList, setPerRecList] = useState([]);
  const [value, setValue] = useState(null);

  function SET_RECOMMENDATIONS(newRecommendations) {
    setRecommendations(newRecommendations);
    EventBus.emit("recommendations", newRecommendations);

    console.log(
      "[MainScreenCustomisationScreen] SET_RECOMMENDATIONS",
      newRecommendations
    );
    SettingsStorage.setParameter(
      "userConfig.recommendations",
      newRecommendations
    );
  }
  function addList(list) {
    PersonalRecListStorage.newSettingsList(list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    EventBus.emit("personalRecListUpdated", list);
  }
  function editList(list) {
    PersonalRecListStorage.editSettingsList(list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    EventBus.emit("personalRecListUpdated", list);
  }
  function deleteList(list) {
    PersonalRecListStorage.deleteSettingsList(list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    EventBus.emit("personalRecListUpdated", list);
  }

  useEffect(() => {
    setRecommendations(
      SettingsStorage.getParameter("userConfig.recommendations")
    );
    setPerRecList(PersonalRecListStorage.getSettingsList());
  }, []);

  function onPressEdit(name) {
    for (let i = 0; i < PerRecList.length; i++) {
      if (PerRecList[i].name === name) {
        setValue(PerRecList[i]);
        break;
      }
    }
    RecListRef.current?.present();
  }

  return (
    <DefaultScreenWidget>
      <SwitchWidget
        title="Показувати загальні рекомендації"
        value={RECOMMENDATIONS?.isEnabled || false}
        onPress={() => {
          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isEnabled: !RECOMMENDATIONS?.isEnabled,
          });
        }}
        onBodyPress={() => {}}
      />
      <SwitchWidget
        title="Показувати вбудований банер"
        value={RECOMMENDATIONS?.isDefaultBigBanner || false}
        onPress={() => {
          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isDefaultBigBanner: !RECOMMENDATIONS?.isDefaultBigBanner,
          });
        }}
      />
      <SwitchWidget
        title="Показувати особисті рекомендації"
        value={RECOMMENDATIONS?.isCustomedPersonalRecommendations || false}
        onPress={() => {
          setIsPersonalRecView(!isPersonalRecView);

          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isCustomedPersonalRecommendations:
              !RECOMMENDATIONS?.isCustomedPersonalRecommendations,
          });
        }}
        onPressBody={() => {
          setIsPersonalRecView(!isPersonalRecView);
        }}
      />
      {isPersonalRecView && (
        <PersonalRecList
          list={PerRecList}
          onPressAdd={() => {
            RecListRef.current?.present();
          }}
          onPressEdit={(name) => {
            onPressEdit(name);
          }}
        />
      )}
      <PersonalRecListFilter
        sheetRef={RecListRef}
        value={value}
        onPressOk={(payload) => {
          console.log(payload, "payload");
          RecListRef.current?.close();
          const existingItem = PerRecList.find(
            (item) => item.name === payload.name
          );
          if (existingItem) {
            editList(payload);
          } else {
            addList(payload);
          }
        }}
        onPressCancel={() => {
          RecListRef.current?.close();
        }}
        onPressDelete={() => {
          console.log(value.name, "value.name");
          deleteList(value);
          RecListRef.current?.close();
        }}
      />
    </DefaultScreenWidget>
  );
}

function PersonalRecList({
  list = [],
  onPressAdd = () => {},
  onPressEdit = () => {},
}) {
  const [personalRecList, setPersonalRecList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedAnimeLists, setLoadedAnimeLists] = useState([]);

  useLayoutEffect(() => {
    setPersonalRecList(list ?? []);
  }, [list]);

  useLayoutEffect(() => {
    if (!personalRecList || personalRecList.length === 0) {
      setLoadedAnimeLists([]);
      return;
    }

    setLoading(true);
    Promise.all(
      personalRecList.map(async (anime) => {
        try {
          const res = await sendRequest(anime, "preview");
          return { name: anime.name, animeList: res };
        } catch (e) {
          return { name: anime.name, animeList: [] };
        }
      })
    )
      .then((results) => {
        setLoadedAnimeLists(results);
        console.log(results, "results");
      })
      .finally(() => setLoading(false));
  }, [personalRecList]);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: 8,
          paddingTop: 0,
          gap: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            PersonalRecListStorage.clearStorage();
            setPersonalRecList([]);
          }}
          style={{
            width: 44,
            height: 44,
            backgroundColor: appColor,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.Trash size={24} color={white} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressAdd}
          style={{
            width: 44,
            height: 44,
            backgroundColor: appColor,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.Plus size={24} color={white} />
        </TouchableOpacity>
      </View>
      {loading && <ActivityIndicator size="large" color={appColor} />}
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
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export function PersonalRecListFilter({
  onPressOk = () => {},
  onPressCancel = () => {},
  onPressDelete = () => {},
  sheetRef,
  value = {},
}) {
  const [LoadedGenres, setLoadedGenres] = useState([]);

  const [status, setStatus] = useState("Анонс");
  const [seasons, setSeasons] = useState("Зима");
  const [years, setYears] = useState([2000, new Date().getFullYear()]);
  const [score, setScore] = useState(5);
  const [genres, setGenres] = useState([]);
  const [animeListName, setAnimeListName] = useState("");

  // Track initial snapshot for edit mode to detect changes
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const isEditMode = React.useMemo(() => {
    return value && Object.keys(value || {}).length > 0;
  }, [value]);
  const hasChanges = React.useMemo(() => {
    if (!isEditMode || !initialSnapshot) return false;
    const isEqualArray = (a = [], b = []) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    const sameName = animeListName === initialSnapshot.name;
    const sameStatus = status === initialSnapshot.status;
    const sameSeasons = seasons === initialSnapshot.seasons;
    const sameYears = isEqualArray(years, initialSnapshot.years);
    const sameScore = score === initialSnapshot.score;
    const sameGenres = isEqualArray(genres, initialSnapshot.genres);
    return !(
      sameName &&
      sameStatus &&
      sameSeasons &&
      sameYears &&
      sameScore &&
      sameGenres
    );
  }, [
    isEditMode,
    initialSnapshot,
    animeListName,
    status,
    seasons,
    years,
    score,
    genres,
  ]);

  async function onPressOkey() {
    if (animeListName.length === 0) {
      return;
    }
    const animeSet = {
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
    const payload = {
      name: animeListName,
      animeSet: animeSet,
      type: "horizontal",
      pages: pages,
      size: size,
      isArrow: null,
    };
    onPressOk(payload);
  }

  useEffect(() => {
    getGenres().then((res) => {
      setLoadedGenres(res);
    });
    if (value) {
      const name = value.name ?? "";
      const st = Object.keys(Statuses).find(
        (key) => Statuses[key] === value.animeSet.Statuses
      );
      const ss = Object.keys(Seasons).find(
        (key) => Seasons[key] === value.animeSet.Seasons
      );
      const yrs = value.animeSet.Years ?? [2000, new Date().getFullYear()];
      const scr = value.animeSet.Score?.[0] ?? 5;
      const genreNames = (value.animeSet.Genres || [])
        .map((genreSlug) =>
          Object.keys(Genres).find((key) => Genres[key] === genreSlug)
        )
        .filter(Boolean);

      setAnimeListName(name);
      setStatus(st);
      setSeasons(ss);
      setYears(yrs);
      setScore(scr);
      setGenres(genreNames);

      setInitialSnapshot({
        name,
        status: st,
        seasons: ss,
        years: yrs,
        score: scr,
        genres: genreNames,
      });
    } else {
      setInitialSnapshot(null);
    }
  }, [value]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["60%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: Black_1(0.8) }}
      handleIndicatorStyle={{ backgroundColor: black }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          {...props}
        />
      )}
      animationDuration={300}
      enableContentPanningGesture={false}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingBottom: 100 }}>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              marginBottom: 16,
              gap: 30,
            }}
          >
            <TextInputWidget
              style={{ width: "80%" }}
              placeholder="Назва"
              title={animeListName}
              onChangeText={(text) => {
                setAnimeListName(text);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (isEditMode) {
                  if (hasChanges) {
                    onPressOkey();
                  } else {
                    onPressDelete();
                  }
                } else {
                  if (animeListName.length > 0) {
                    onPressOkey();
                  } else {
                    onPressCancel();
                  }
                }
              }}
              style={{
                width: 44,
                height: 44,
                backgroundColor: appColor,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isEditMode ? (
                hasChanges ? (
                  <Icons.Check size={24} color={white} />
                ) : (
                  <Icons.Trash size={24} color={white} />
                )
              ) : animeListName.length > 0 ? (
                <Icons.Check size={24} color={white} />
              ) : (
                <Icons.X size={24} color={white} />
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
            <SegmentedControlLabelWidget
              segments={[
                { label: "Анонс" },
                { label: "Онґоінґ" },
                { label: "Завершено" },
                { label: "Неважливо" },
              ]}
              value={status}
              onChange={(item) => {
                setStatus(item?.label ?? item);
              }}
            />
            <SegmentedControlLabelWidget
              segments={[
                { label: "Зима" },
                { label: "Весна" },
                { label: "Літо" },
                { label: "Осінь" },
                { label: "Неважливо" },
              ]}
              value={seasons}
              onChange={(item) => {
                setSeasons(item?.label ?? item);
              }}
            />
            <InputPickerWidget
              items={LoadedGenres}
              placeholder="Виберіть жанр/жанри..."
              selected={genres}
              onChange={(item) => {
                setGenres(item);
              }}
            />
            <SliderWidget
              label="Рік"
              min={2000}
              max={2025}
              value={years[0]}
              defaultValue={2005}
              style={{}}
              onChange={(item) => {
                setYears([item, new Date().getFullYear()]);
              }}
            />
            <SliderWidget
              label="Оцінка"
              min={0}
              max={10}
              value={score}
              defaultValue={5}
              style={{}}
              onChange={(item) => {
                setScore(item);
              }}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: black_1,
    borderRadius: 8,
    padding: 4,
    alignSelf: "center",
    position: "relative",
  },
  segmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: appColor,
  },
  segmentIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: appColor,
    borderRadius: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function TabWidget({ segments, onSelect = () => {}, style }) {
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [layouts, setLayouts] = useState({});
  const translateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const animateTo = (label) => {
    const layout = layouts[label];
    if (!layout) return;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: layout.x,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: layout.width,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  React.useEffect(() => {
    if (layouts[activeSegment]) {
      animateTo(activeSegment);
    }
  }, [activeSegment, layouts]);

  return (
    <View style={[styles.segmentContainer, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.segmentIndicator,
          { width: indicatorWidth, transform: [{ translateX }] },
        ]}
      />
      {segments.map((label) => {
        const isActive = activeSegment === label;
        return (
          <TouchableOpacity
            key={label}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [label]: { x, width } }));
            }}
            onPress={() => {
              setActiveSegment(label);
              onSelect(label);
            }}
            style={[styles.segmentButton, {}]}
          >
            <Text style={[H4, { color: isActive ? white : White(0.8) }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TextInputWidget({
  title = "",
  onChangeText = () => {},
  placeholder = "Назва",
  style,
}) {
  return (
    <View style={[style]}>
      <TextInput
        value={title}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        placeholder={placeholder}
        placeholderTextColor={gray}
        style={{
          height: 45,
          width: "100%",
          paddingHorizontal: 16,
          color: white,
          backgroundColor: Black_1(1),
          borderRadius: 8,
        }}
      />
    </View>
  );
}
