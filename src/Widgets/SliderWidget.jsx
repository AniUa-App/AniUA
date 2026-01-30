import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Slider } from "react-native-awesome-slider";
import { useSharedValue } from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5 } from "../Styles/Fonts";

/**
 * Універсальний слайдер під тему застосунку.
 *
 * Props:
 * - label: string — текст заголовка над слайдером
 * - min: number — мінімальне значення
 * - max: number — максимальне значення
 * - defaultValue: number — стартове значення (для неконтрольованого режиму)
 * - value?: number — контрольоване значення (опціонально)
 * - step?: number — крок, за замовчуванням 1
 * - onChange?: (value: number) => void — викликається під час зміни
 * - onChangeEnd?: (value: number) => void — викликається після завершення свайпу
 * - style?: ViewStyle — стилі контейнера
 */
export default function SliderWidget({
  label = "",
  min = 2000,
  max = 2025,
  defaultValue,
  value,
  step = 1,
  onChange = () => {},
  onChangeEnd = () => {},
  style,
}) {
  const colors = useThemeColors();

  const initial = useMemo(() => {
    if (typeof value === "number") return value;
    if (typeof defaultValue === "number") return defaultValue;
    return min;
  }, []);

  // Shared values for react-native-awesome-slider
  const progress = useSharedValue(initial);
  const minValue = useSharedValue(min);
  const maxValue = useSharedValue(max);

  // React state для відображення поточного значення (без warning)
  const [displayValue, setDisplayValue] = useState(initial);

  // Синхронізуємо контрольоване значення
  useEffect(() => {
    if (typeof value === "number") {
      progress.value = value;
      setDisplayValue(value);
    }
  }, [value]);

  // Оновлюємо min/max якщо вони змінюються
  useEffect(() => {
    minValue.value = min;
  }, [min]);

  useEffect(() => {
    maxValue.value = max;
  }, [max]);

  // Кількість кроків для дискретного слайдера
  const steps = useMemo(() => {
    return Math.round((max - min) / step);
  }, [min, max, step]);

  const handleValueChange = (val) => {
    const rounded = Math.round(val);
    setDisplayValue(rounded);
    onChange(rounded);
  };

  const handleSlidingComplete = (val) => {
    onChangeEnd(Math.round(val));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.accent }, style]}>
      {label && (
        <Text
          selectable={true}
          style={[H5, { color: colors.inActiveText, marginBottom: 12 }]}
        >
          {label}
        </Text>
      )}

      <View style={styles.row}>
        <Text
          selectable={true}
          style={[H4, { color: colors.text, minWidth: 40 }]}
        >
          {displayValue}
        </Text>
        <View style={styles.sliderWrap}>
          <Slider
            progress={progress}
            minimumValue={minValue}
            maximumValue={maxValue}
            steps={steps}
            forceSnapToStep
            renderMark={() => null}
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
            // Gesture handling для роботи в BottomSheet
            activeOffsetX={[-10, 10]}
            failOffsetY={[-20, 20]}
            // Стилізація
            theme={{
              minimumTrackTintColor: colors.primary,
              maximumTrackTintColor: colors.background,
            }}
            sliderHeight={4}
            thumbWidth={20}
            renderBubble={() => null}
          />
        </View>
        <Text
          selectable={true}
          style={[H4, { color: colors.text, minWidth: 40, textAlign: "right" }]}
        >
          {max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderWrap: {
    flex: 1,
  },
});
