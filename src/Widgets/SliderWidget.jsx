import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
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
  label = "Рік",
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
  }, [value, defaultValue, min]);

  const [internal, setInternal] = useState(initial);

  // Синхронізуємо контрольоване значення
  useEffect(() => {
    if (typeof value === "number" && value !== internal) {
      setInternal(value);
    }
  }, [value]);

  const setValue = (v) => {
    setInternal(v);
    onChange(v);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.black_1 }, style]}
    >
      <Text style={[H5, { color: colors.gray, marginBottom: 12 }]}>
        {label}
      </Text>

      <View style={styles.row}>
        <Text style={[H4, { color: colors.white }]}>{internal}</Text>
        <View style={styles.sliderWrap}>
          <Slider
            minimumValue={min}
            maximumValue={max}
            value={internal}
            step={step}
            onValueChange={setValue}
            onSlidingComplete={onChangeEnd}
            minimumTrackTintColor={colors.appColor}
            maximumTrackTintColor={colors.black}
            thumbTintColor={colors.appColor}
          />
        </View>
        <Text style={[H4, { color: colors.white }]}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
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
