import React, { useState, useEffect, RefObject } from "react";
import { View, Text } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H4 } from "../Styles/Fonts";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import SliderWidget from "../Widgets/SliderWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import { useSearchFilterBottomSheetStyles } from "../Styles/components/SearchFilterBottomSheetStyles";

export interface SearchFilters {
  status: string;
  seasons: string;
  years: number[];
  score: number;
  genres: string[];
}

type OnApply = {
  (filters: SearchFilters): void;
  (isVerified: boolean): void;
};

interface SearchFilterBottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  filters: SearchFilters;
  loadedGenres: string[];
  onApply: OnApply;
  onReset: () => void;
  activeCategory: string;
  isVerified?: boolean;
}

export default function SearchFilterBottomSheet({
  sheetRef,
  filters,
  loadedGenres,
  onApply,
  onReset,
  activeCategory,
  isVerified = true,
}: SearchFilterBottomSheetProps) {
  const [status, setStatus] = useState(filters.status);
  const [seasons, setSeasons] = useState(filters.seasons);
  const [years, setYears] = useState(filters.years);
  const [score, setScore] = useState(filters.score);
  const [genres, setGenres] = useState(filters.genres);
  const themeColors = useThemeColors();
  const s = useSearchFilterBottomSheetStyles();

  // Синхронізуємо локальний стейт з пропсами при зміні фільтрів
  useEffect(() => {
    setStatus(filters.status);
    setSeasons(filters.seasons);
    setYears(filters.years);
    setScore(filters.score);
    setGenres(filters.genres);
  }, [filters]);

  const handleApply = () => {
    onApply({
      status,
      seasons,
      years,
      score,
      genres,
    });
  };

  const handleReset = () => {
    setStatus("Байдуже");
    setSeasons("Байдуже");
    setYears([1990, new Date().getFullYear()]);
    setScore(0);
    setGenres([]);
    onReset();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={activeCategory === "anime" || activeCategory === "manga" ? ["65%"] : ["15%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.text }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          style={{
            ...props.style,
          }}
        />
      )}
    >
      <BottomSheetScrollView
        style={s.scrollView}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeCategory === "anime" || activeCategory === "manga" ? (
          <View style={s.content}>
            {/* Заголовок */}
            <View style={s.headerRow}>
              <Text
                selectable={true}
                style={[H4, { color: themeColors.text, fontSize: 18 }]}
              >
                Фільтри пошуку
              </Text>
              <View style={s.headerButtons}>
                <TouchableOpacity
                  onPress={handleReset}
                  style={[
                    s.headerButton,
                    { backgroundColor: themeColors.accent },
                  ]}
                >
                  <Icons.Trash size={22} color={themeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleApply}
                  style={[
                    s.headerButton,
                    { backgroundColor: themeColors.accent },
                  ]}
                >
                  <Icons.Check size={22} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Статус */}
            <Text
              selectable={true}
              style={[H4, { color: themeColors.text, marginBottom: 8 }]}
            >
              Статус
            </Text>
            <SegmentedControlLabelWidget
              segments={[
                { label: "Байдуже" },
                { label: "Анонс" },
                { label: activeCategory === "manga" ? "Онґоінг" : "Онґоінґ" },
                { label: "Завершено" },
              ]}
              value={status}
              onChange={(item: { label: string } | string) =>
                setStatus(typeof item === "string" ? item : (item?.label ?? ""))
              }
            />

            {/* Сезон — лише для аніме */}
            {activeCategory === "anime" && (
              <>
                <Text selectable={true} style={[H4, s.sectionLabel]}>
                  Сезон
                </Text>
                <SegmentedControlLabelWidget
                  segments={[
                    { label: "Байдуже" },
                    { label: "Зима" },
                    { label: "Весна" },
                    { label: "Літо" },
                    { label: "Осінь" },
                  ]}
                  value={seasons}
                  onChange={(item: { label: string } | string) =>
                    setSeasons(
                      typeof item === "string" ? item : (item?.label ?? "")
                    )
                  }
                />
              </>
            )}

            {/* Жанри */}
            <Text selectable={true} style={[H4, s.sectionLabel]}>
              Жанри
            </Text>
            <InputPickerWidget
              items={loadedGenres}
              placeholder="Виберіть жанр/жанри..."
              selected={genres}
              onChange={(item: string[]) => setGenres(item)}
            />

            {/* Рік */}
            <SliderWidget
              label="Рік (від)"
              min={1990}
              max={new Date().getFullYear()}
              value={years[0]}
              style={s.slider}
              onChange={(item: number) =>
                setYears([item, new Date().getFullYear()])
              }
            />

            {/* Оцінка */}
            <SliderWidget
              label="Мінімальна оцінка"
              min={0}
              max={10}
              value={score}
              defaultValue={0}
              style={s.slider}
              onChange={(item: number) => setScore(item)}
            />
          </View>
        ) : (
          <SettingsItemWidget
            title={""}
            subtitle={"Показувати лише верифіковані команди"}
            icon={<Icons.Star weight="fill" />}
            iconColor={themeColors.primary}
            button={{
              Icon: isVerified ? (
                <Icons.ToggleRight
                  size={34}
                  color={themeColors.primary}
                  weight="fill"
                />
              ) : (
                <Icons.ToggleLeft size={34} color={themeColors.inActiveText} />
              ),
            }}
            onPress={() => {
              onApply(!isVerified);
            }}
            onPressBody={() => {
              onApply(!isVerified);
            }}
            color={themeColors.background}
            showChevron={false}
            disabled={false}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

