import React, { useState, useEffect, RefObject } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H4 } from "../Styles/Fonts";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import SliderWidget from "../Widgets/SliderWidget";

export interface SearchFilters {
  status: string;
  seasons: string;
  years: number[];
  score: number;
  genres: string[];
}

interface SearchFilterBottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  filters: SearchFilters;
  loadedGenres: string[];
  onApply: (filters: SearchFilters) => void;
  onReset: () => void;
}

export default function SearchFilterBottomSheet({
  sheetRef,
  filters,
  loadedGenres,
  onApply,
  onReset,
}: SearchFilterBottomSheetProps) {
  const [status, setStatus] = useState(filters.status);
  const [seasons, setSeasons] = useState(filters.seasons);
  const [years, setYears] = useState(filters.years);
  const [score, setScore] = useState(filters.score);
  const [genres, setGenres] = useState(filters.genres);
  const themeColors = useThemeColors();

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
    setYears([2000, new Date().getFullYear()]);
    setScore(0);
    setGenres([]);
    onReset();
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["70%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.subtle }}
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Заголовок */}
          <View style={styles.headerRow}>
            <Text style={[H4, { color: themeColors.text, fontSize: 18 }]}>
              Фільтри пошуку
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleReset}
                style={[
                  styles.headerButton,
                  { backgroundColor: themeColors.background },
                ]}
              >
                <Icons.Trash size={22} color={themeColors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApply}
                style={[
                  styles.headerButton,
                  { backgroundColor: themeColors.primary },
                ]}
              >
                <Icons.Check size={22} color={themeColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Статус */}
          <Text style={[H4, { color: themeColors.text, marginBottom: 8 }]}>
            Статус
          </Text>
          <SegmentedControlLabelWidget
            segments={[
              { label: "Байдуже" },
              { label: "Анонс" },
              { label: "Онґоінґ" },
              { label: "Завершено" },
            ]}
            value={status}
            onChange={(item: { label: string } | string) =>
              setStatus(typeof item === "string" ? item : (item?.label ?? ""))
            }
          />

          {/* Сезон */}
          <Text style={[H4, styles.sectionLabel]}>Сезон</Text>
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
              setSeasons(typeof item === "string" ? item : (item?.label ?? ""))
            }
          />

          {/* Жанри */}
          <Text style={[H4, styles.sectionLabel]}>Жанри</Text>
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
            defaultValue={2000}
            style={styles.slider}
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
            style={styles.slider}
            onChange={(item: number) => setScore(item)}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
  },
  slider: {
    marginTop: 16,
  },
});
