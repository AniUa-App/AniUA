import { View, Text } from "react-native";
import React, { useEffect, useCallback, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect } from "@react-navigation/native";
import { H4, H5, H7 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Logger from "../Logger/Logger";

export default function ButtonsScreen({ route }) {
  const colors = useThemeColors();
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
                minWidth: "20%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 10,
                minHeight: 50,
              },
              buttonStyle,
            ]}
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
  const colors = useThemeColors();

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
      tintColor={colors.primary}
      backgroundColor={"transparent"}
      sliderStyle={{
        borderRadius: 16,
        paddingHorizontal: 8,
      }}
      style={{
        height: 44,
      }}
      fontStyle={{
        ...H5,
        color: colors.Text(0.5),
      }}
      activeFontStyle={{
        ...H5,
        fontWeight: "normal",
        color: colors.text,
      }}
    />
  );
}

export function SegmentedControlImageWidget({
  segments = [],
  onChange = () => {},
  value = "",
}) {
  const colors = useThemeColors();

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
    <View
      style={{
        width: "100%",
        alignSelf: "center",
        height: 50,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: colors.subtle,
        position: "relative",
        flexDirection: "row",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${selectedIndex * itemWidthPct}%`,
          width: `${itemWidthPct}%`,
          backgroundColor: colors.primary,
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
            <Text selectable={true} style={{ color: colors.text }}>
              {String(seg.label)}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
