import { View, Text } from "react-native";
import React, { useEffect, useCallback, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect } from "@react-navigation/native";
import { H4 } from "../Styles/Fonts";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Logger from "../Logger/Logger";
import {
  useButtonsStyles,
  useSegmentedLabelStyles,
  useSegmentedImageStyles,
} from "../Styles/components/ButtonsStyles";

export default function ButtonsScreen({ route }) {
  const s = useButtonsStyles();
  const { list, title, buttonStyle } = route.params;
  useEffect(() => {
    Logger.debug("ButtonsScreen", "List changed", { list });
  }, [list]);
  useFocusEffect(
    useCallback(() => {
      Logger.debug("ButtonsScreen", "Screen focused", { list });
    }, [list])
  );
  return (
    <DefaultScreenWidget>
      <View style={s.grid}>
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[s.gridButton, buttonStyle]}
            onPress={item.onPress}
          >
            <Text selectable={true} style={H4}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </DefaultScreenWidget>
  );
}

export function SegmentedControlLabelWidget({
  segments = [],
  onChange = () => {},
  value = "",
  style = {},
  backgroundColor = null,
}) {
  const s = useSegmentedLabelStyles();

  if (!segments || segments.length === 0) {
    return null;
  }

  segments = segments.map((segment) => ({
    ...segment,
    label: segment.label,
  }));

  const selectedIndex = useMemo(() => {
    if (!value) return 0;
    const idx = segments.findIndex((segment) => segment.label === value);
    return idx >= 0 ? idx : 0;
  }, [value, segments]);

  function onChangeIndex(index) {
    if (index >= 0 && index < segments.length) {
      const nextLabel = segments[index].label;
      if (nextLabel !== value) {
        onChange(nextLabel);
      }
    }
  }

  return (
    <SegmentedControl
      values={segments.map((s) => String(s.label))}
      selectedIndex={selectedIndex}
      onChange={(event) =>
        onChangeIndex(event.nativeEvent.selectedSegmentIndex)
      }
      tintColor={s.tintColor}
      backgroundColor={"transparent"}
      sliderStyle={s.slider}
      style={{ height: s.height }}
      fontStyle={s.fontStyle}
      activeFontStyle={s.activeFontStyle}
    />
  );
}

export function SegmentedControlImageWidget({
  segments = [],
  onChange = () => {},
  value = "",
}) {
  const s = useSegmentedImageStyles();

  if (!segments || segments.length === 0) return null;

  const normalized = useMemo(
    () =>
      segments.map((s, idx) => ({
        ...s,
        label: s.label ?? s.value ?? String(idx),
        value: s.value ?? s.label ?? String(idx),
      })),
    [segments]
  );

  const selectedIndex = useMemo(() => {
    if (!value) return 0;
    const idx = normalized.findIndex(
      (s) => s.value === value || s.label === value
    );
    return idx >= 0 ? idx : 0;
  }, [value, normalized]);

  const onChangeIndex = (index) => {
    if (index >= 0 && index < normalized.length) {
      const next = normalized[index].value;
      if (next !== value) onChange(next);
    }
  };

  const itemWidthPct = 100 / normalized.length;

  return (
    <View style={s.container}>
      <View
        style={s.activeHighlight(selectedIndex, itemWidthPct)}
        pointerEvents="none"
      />
      {normalized.map((seg, idx) => (
        <TouchableOpacity
          key={seg.value}
          onPress={() => onChangeIndex(idx)}
          style={s.segmentButton}
          activeOpacity={0.8}
        >
          {seg.icon ?? (
            <Text selectable={true} style={s.segmentText}>
              {String(seg.label)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
