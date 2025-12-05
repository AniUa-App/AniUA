import { View, Text } from "react-native";
import React, { useEffect, useCallback, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect } from "@react-navigation/native";
import { H2, H3, H4, H5, H7 } from "../Styles/Fonts";
import { appColor, white, black_1, red } from "../Styles/Colors";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Logger from "../Logger/Logger";

export default function ButtonsScreen({ route }) {
  const { list, title, buttonStyle } = route.params;
  useEffect(() => {
    Logger.debug('ButtonsScreen', 'List changed', { list });
  }, [list]);
  useFocusEffect(
    useCallback(() => {
      Logger.debug('ButtonsScreen', 'Screen focused', { list });
    }, [list])
  );
  return (
    <DefaultScreenWidget>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          padding: 20,
          gap: 10,
        }}
      >
        {list.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              {
                minWidth: "20%", // Мінімальна ширина елемента
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: appColor,
                borderRadius: 8,
                padding: 10,
                minHeight: 50,
              },
              buttonStyle,
            ]}
            onPress={item.onPress}
          >
            <Text style={H4}>{item.title}</Text>
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
}) {
  if (!segments || segments.length === 0) {
    return null;
  }

  segments = segments.map((segment) => ({
    ...segment,
    label: segment.label,
  }));

  // Compute a safe initial index based on value and available segments
  const selectedIndex = useMemo(() => {
    if (!value) return 0;
    const idx = segments.findIndex((segment) => segment.label === value);
    return idx >= 0 ? idx : 0;
  }, [value, segments]);

  function onChangeIndex(index) {
    if (index >= 0 && index < segments.length) {
      const nextLabel = segments[index].label;
      // Avoid redundant updates that can trigger render loops
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
      tintColor={appColor}
      backgroundColor={black_1}
      sliderStyle={{ top: 0, bottom: 0, left: 0, right: 0 }}
      style={{
        width: "100%",
        alignSelf: "center",
        height: 50,
        borderWidth: 0,
        borderRadius: 8,
        overflow: "hidden",
      }}
      fontStyle={{
        ...H7,
        color: white,
      }}
      activeFontStyle={{
        ...H5,

        textAlign: "center",
        color: white,
        lineHeight: (H7?.fontSize ?? 13) + 2,
      }}
    />
  );
}

// Icon/Image-based segmented control with sliding highlight
export function SegmentedControlImageWidget({
  segments = [], // [{ icon: <JSX />, value?: string, label?: string }]
  onChange = () => {},
  value = "",
}) {
  if (!segments || segments.length === 0) return null;

  // Normalize segments: ensure each has label and value for internal mapping
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
    <View
      style={{
        width: "100%",
        alignSelf: "center",
        height: 50,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: black_1,
        position: "relative",
        flexDirection: "row",
      }}
    >
      {/* slider */}
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${selectedIndex * itemWidthPct}%`,
          width: `${itemWidthPct}%`,
          backgroundColor: appColor,
          opacity: 0.25,
          borderRadius: 8,
        }}
        pointerEvents="none"
      />
      {normalized.map((seg, idx) => (
        <TouchableOpacity
          key={seg.value}
          onPress={() => onChangeIndex(idx)}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: 50,
          }}
          activeOpacity={0.8}
        >
          {seg.icon ?? (
            <Text style={{ color: white }}>{String(seg.label)}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
