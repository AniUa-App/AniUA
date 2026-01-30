import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRef, useState, useLayoutEffect, useEffect, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsSection from "../Widgets/SettingsSectionWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import { useThemeColors } from "../Global/useTheme";
import { TouchableOpacity } from "../Widgets/Button";
import Logger from "../Logger/Logger";
import { H4, H6 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icons from "../Styles/Icons";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { getGenres } from "../Sources/CustomSet";
import SliderWidget from "../Widgets/SliderWidget";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import {
  ToggleSettingWidget,
  ExpandableSection,
} from "../Widgets/CustomisationWidgets";

import {
  Statuses,
  Seasons,
  Genres,
  Sort,
  getPagesAndSizes,
  sendRequest,
} from "../Sources/CustomSet";
import { PreviewAnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";

export default function MainScreenCustomisationScreen() {
  const themeColors = useThemeColors();
  const [RECOMMENDATIONS, setRecommendations] = useState();
  const [isPersonalRecExpanded, setIsPersonalRecExpanded] = useState(false);

  const RecListRef = useRef(null);

  const [PerRecList, setPerRecList] = useState([]);
  const [value, setValue] = useState(null);

  function SET_RECOMMENDATIONS(newRecommendations) {
    setRecommendations(newRecommendations);
    EventBus.emit("recommendations", newRecommendations);

    Logger.debug("MainScreenCustomisation", "SET_RECOMMENDATIONS", {
      newRecommendations,
    });
    SettingsStorage.setParameter(
      "userConfig.recommendations",
      newRecommendations
    );
  }

  function addList(list) {
    PersonalRecListStorage.newSettingsList(list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    Logger.debug("MainScreenCustomisation", "Додано новий список", { list });
    EventBus.emit("personalRecListUpdated", list);
  }

  function editList(name, list) {
    PersonalRecListStorage.editSettingsList(name, list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    Logger.debug("MainScreenCustomisation", "Відредаговано список", {
      name,
      list,
    });
    EventBus.emit("personalRecListUpdated", list);
  }

  function deleteList(list) {
    PersonalRecListStorage.deleteSettingsList(list);
    setPerRecList(PersonalRecListStorage.getSettingsList());
    Logger.debug("MainScreenCustomisation", "Видалено список", { list });
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
    <DefaultScreenWidget isCheckInternet={false} isNavBarPadding={true}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16 }}
      >
        {/* Загальні налаштування */}
        <SettingsSection title="Загальні">
          <ToggleSettingWidget
            title="Вбудований банер"
            subtitle="Показувати великий банер зверху"
            icon={<Icons.Image />}
            value={RECOMMENDATIONS?.isDefaultBigBanner || false}
            onToggle={() => {
              SET_RECOMMENDATIONS({
                ...RECOMMENDATIONS,
                isDefaultBigBanner: !RECOMMENDATIONS?.isDefaultBigBanner,
              });
            }}
          />
        </SettingsSection>

        {/* Персональні рекомендації */}
        <SettingsSection title="Персональні рекомендації">
          <ToggleSettingWidget
            title="Особисті рекомендації"
            subtitle="Власні списки аніме на головному екрані"
            icon={<Icons.ListPlus />}
            value={RECOMMENDATIONS?.isCustomedPersonalRecommendations || false}
            onToggle={() => {
              const newValue =
                !RECOMMENDATIONS?.isCustomedPersonalRecommendations;
              SET_RECOMMENDATIONS({
                ...RECOMMENDATIONS,
                isCustomedPersonalRecommendations: newValue,
              });
              if (newValue) setIsPersonalRecExpanded(true);
            }}
          />

          {RECOMMENDATIONS?.isCustomedPersonalRecommendations && (
            <ExpandableSection
              title="Керування списками"
              icon={<Icons.List />}
              expanded={isPersonalRecExpanded}
              onToggle={() => setIsPersonalRecExpanded(!isPersonalRecExpanded)}
            >
              <PersonalRecList
                list={PerRecList}
                onPressAdd={() => {
                  setValue(null);
                  RecListRef.current?.present();
                }}
                onPressEdit={(name) => {
                  onPressEdit(name);
                }}
                onPressClear={() => {
                  PersonalRecListStorage.clearStorage();
                  setPerRecList([]);
                  EventBus.emit("personalRecListUpdated");
                }}
              />
            </ExpandableSection>
          )}
        </SettingsSection>

        <View style={{ height: 130 }} />
      </ScrollView>

      <PersonalRecListFilter
        sheetRef={RecListRef}
        value={value}
        onPressOk={(payload) => {
          Logger.debug("MainScreenCustomisation", "onPressOk", { payload });
          RecListRef.current?.close();
          Logger.debug("MainScreenCustomisation", "Дані для обробки", {
            valueName: value?.name,
            payloadName: payload.name,
          });
          try {
            const existingItem = !!PerRecList.find(
              (item) => item.name === payload?.name || item.name === value?.name
            );
            Logger.debug(
              "MainScreenCustomisation",
              "Перевірка існуючого елемента",
              { existingItem }
            );
            if (existingItem) {
              editList(value?.name, payload);
            } else {
              addList(payload);
            }
          } catch (error) {
            Logger.error(
              "MainScreenCustomisation",
              "Помилка при обробці onPressOk",
              error
            );
          }
        }}
        onPressCancel={() => {
          RecListRef.current?.close();
        }}
        onPressDelete={() => {
          Logger.debug("MainScreenCustomisation", "Видалення списку", {
            name: value.name,
          });
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
  onPressClear = () => {},
}) {
  const themeColors = useThemeColors();
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
        Logger.debug("MainScreenCustomisation", "Завантажено списки аніме", {
          results,
        });
      })
      .finally(() => setLoading(false));
  }, [personalRecList]);

  return (
    <View style={{ paddingTop: 8 }}>
      {/* Кнопки керування */}
      <View style={styles.actionButtons}>
        <SettingsItemWidget
          title="Очистити всі"
          subtitle="Видалити всі списки"
          icon={<Icons.Trash />}
          iconColor={themeColors.redBookmark}
          showChevron
          onPress={onPressClear}
        />
        <SettingsItemWidget
          title="Додати список"
          subtitle="Створити новий список аніме"
          icon={<Icons.Plus />}
          iconColor={themeColors.primary}
          showChevron
          onPress={onPressAdd}
        />
      </View>

      {/* Завантаження */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      )}

      {/* Списки аніме */}
      {!loading &&
        loadedAnimeLists?.map((anime, index) => (
          <View key={`${anime.name}-${index}`} style={{ marginTop: 16 }}>
            <PreviewAnimeListHorizontal
              animeList={anime.animeList}
              title={anime.name}
              onPress={() => {
                onPressEdit?.(anime.name);
              }}
            />
          </View>
        ))}

      {!loading && loadedAnimeLists.length === 0 && (
        <View style={styles.emptyState}>
          <Icons.ListDashes size={48} color={themeColors.inActiveText} />
          <Text
            selectable={true}
            style={[H6, { color: themeColors.inActiveText, marginTop: 8 }]}
          >
            Списків ще немає
          </Text>
        </View>
      )}
    </View>
  );
}

export function PersonalRecListFilter({
  onPressOk = () => {},
  onPressCancel = () => {},
  onPressDelete = () => {},
  sheetRef,
  value = {},
}) {
  const themeColors = useThemeColors();
  const [LoadedGenres, setLoadedGenres] = useState([]);

  const [status, setStatus] = useState("Анонс");
  const [seasons, setSeasons] = useState("Зима");
  const [years, setYears] = useState([2000, new Date().getFullYear()]);
  const [score, setScore] = useState(5);
  const [genres, setGenres] = useState([]);
  const [animeListName, setAnimeListName] = useState("");

  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const isEditMode = useMemo(() => {
    return value && Object.keys(value || {}).length > 0;
  }, [value]);

  const hasChanges = useMemo(() => {
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
    Logger.debug("MainScreenCustomisation", "Отримано розміри списку", {
      pages,
      size,
    });
    const payload = {
      name: animeListName,
      animeSet: animeSet,
      type: "horizontal",
      pages: pages,
      size: size,
      isArrow: null,
    };
    Logger.debug("MainScreenCustomisation", "Створено payload", { payload });
    onPressOk(payload);
  }

  useEffect(() => {
    getGenres().then((res) => {
      setLoadedGenres(res);
    });
    if (value) {
      const name = value.name ?? "";
      const st = Object.keys(Statuses).find(
        (key) => Statuses[key] === value.animeSet?.Statuses
      );
      const ss = Object.keys(Seasons).find(
        (key) => Seasons[key] === value.animeSet?.Seasons
      );
      const yrs = value.animeSet?.Years ?? [2000, new Date().getFullYear()];
      const scr = value.animeSet?.Score?.[0] ?? 5;
      const genreNames = (value.animeSet?.Genres || [])
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
      setAnimeListName("");
      setStatus("Анонс");
      setSeasons("Зима");
      setYears([2000, new Date().getFullYear()]);
      setScore(5);
      setGenres([]);
      setInitialSnapshot(null);
    }
  }, [value]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["65%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.accent }}
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
          {/* Заголовок */}
          <View style={styles.sheetHeader}>
            <Text
              selectable={true}
              style={[H4, { color: themeColors.text, fontWeight: "bold" }]}
            >
              {isEditMode ? "Редагувати список" : "Новий список"}
            </Text>
          </View>

          {/* Назва списку */}
          <View style={styles.inputRow}>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: themeColors.accent,
                },
              ]}
            >
              <Icons.TextT size={20} color={themeColors.inActiveText} />
              <TextInput
                value={animeListName}
                onChangeText={setAnimeListName}
                placeholder="Назва списку"
                placeholderTextColor={themeColors.inActiveText}
                style={[
                  H4,
                  {
                    flex: 1,
                    color: themeColors.text,
                    marginLeft: 12,
                  },
                ]}
              />
            </View>
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
              style={[
                styles.actionButton,
                { backgroundColor: themeColors.primary },
              ]}
            >
              {isEditMode ? (
                hasChanges ? (
                  <Icons.Check size={24} color={themeColors.text} />
                ) : (
                  <Icons.Trash size={24} color={themeColors.text} />
                )
              ) : animeListName.length > 0 ? (
                <Icons.Check size={24} color={themeColors.text} />
              ) : (
                <Icons.X size={24} color={themeColors.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Фільтри */}
          <View style={styles.filtersContainer}>
            <Text
              selectable={true}
              style={[H6, { color: themeColors.inActiveText, marginBottom: 8 }]}
            >
              Статус
            </Text>
            <SegmentedControlLabelWidget
              segments={[
                { label: "Анонс" },
                { label: "Онґоінг" },
                { label: "Завершено" },
                { label: "Байдуже" },
              ]}
              value={status}
              onChange={(item) => {
                setStatus(item?.label ?? item);
              }}
            />

            <Text
              selectable={true}
              style={[
                H6,
                {
                  color: themeColors.inActiveText,
                  marginTop: 16,
                  marginBottom: 8,
                },
              ]}
            >
              Сезон
            </Text>
            <SegmentedControlLabelWidget
              segments={[
                { label: "Зима" },
                { label: "Весна" },
                { label: "Літо" },
                { label: "Осінь" },
                { label: "Байдуже" },
              ]}
              value={seasons}
              onChange={(item) => {
                setSeasons(item?.label ?? item);
              }}
            />

            <Text
              selectable={true}
              style={[
                H6,
                {
                  color: themeColors.inActiveText,
                  marginTop: 16,
                  marginBottom: 8,
                },
              ]}
            >
              Жанри
            </Text>
            <InputPickerWidget
              items={LoadedGenres}
              placeholder="Виберіть жанр/жанри..."
              selected={genres}
              onChange={(item) => {
                setGenres(item);
              }}
            />

            <SliderWidget
              label="Рік від"
              min={2000}
              max={2025}
              value={years[0]}
              defaultValue={2005}
              style={{ marginTop: 16 }}
              onChange={(item) => {
                setYears([item, new Date().getFullYear()]);
              }}
            />

            <SliderWidget
              label="Мінімальна оцінка"
              min={0}
              max={10}
              value={score}
              defaultValue={5}
              style={{ marginTop: 8 }}
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
  actionButtons: {
    gap: 2,
  },
  loaderContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    paddingHorizontal: 16,
  },
});
