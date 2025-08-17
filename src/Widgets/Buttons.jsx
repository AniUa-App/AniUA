import { View, Text } from "react-native";
import React, { useEffect, useCallback, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect } from "@react-navigation/native";
import { H2, H3, H4, H5, H7 } from "../Styles/Fonts";
import { appColor, white, black_1 } from "../Styles/Colors";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

export default function ButtonsScreen({ route }) {
  const { list, title, buttonStyle } = route.params;
  useEffect(() => {
    console.log(list);
  }, [list]);
  useFocusEffect(
    useCallback(() => {
      console.log(list);
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
      onChange={(event) => onChangeIndex(event.nativeEvent.selectedSegmentIndex)}
      tintColor={appColor}
      backgroundColor={black_1}
      style={{
        width: "100%",
        height: 50,
        borderWidth: 0,
        borderRadius: 8,
      }}
      fontStyle={{
        ...H7,
        color: white,
      }}
      activeFontStyle={{
        ...H7,
        color: white,
      }}
    />
  );
}
