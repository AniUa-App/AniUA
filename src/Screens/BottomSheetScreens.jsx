import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { appColor, black_1, gray, white } from "../Styles/Colors";
import Icons from "../Styles/Icons";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { TabWidget, TextInputWidget } from "./MainScreenCustomisation";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import { H3, H4 } from "../Styles/Fonts";
import InputPickerWidget from "../Widgets/InputPickerWidget";
import SliderWidget from "../Widgets/SliderWidget";

export function CustomAnimeListsPreviewScreen({ onPressAdd = () => {} }) {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          padding: 16,
          paddingTop: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            onPressAdd?.();
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
          <Icons.Plus size={24} color={white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CustomisationAnimeListsScreen({ onPressCheck = () => {} }) {
  const [selectedStatus, setSelectedStatus] = useState(0);
  return (
    <View style={{ flex: 1, paddingTop: 16, paddingBottom: 100 }}>
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 30,
          paddingTop: 0,
        }}
      >
        <TextInputWidget style={{ width: "80%" }} placeholder="Назва" />
        <TouchableOpacity
          onPress={() => {
            onPressCheck?.();
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
          <Icons.Check size={24} color={white} />
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
          ]}
          onChange={(item) => {
            console.log(item);
          }}
        />
        <SegmentedControlLabelWidget
          segments={[
            { label: "Зима" },
            { label: "Весна" },
            { label: "Літо" },
            { label: "Осінь" },
          ]}
          onChange={(item) => {
            console.log(item);
          }}
        />
        <InputPickerWidget
          items={["Зима", "Весна", "Літо", "Осінь"]}
          selected={["Зима"]}
          onChange={(item) => {
            console.log(item);
          }}
        />
        <SliderWidget label="Рік" min={2000} max={2025} value={2020} />
        <SliderWidget label="Оцінка" min={0} max={10} value={5} />
      </View>
    </View>
  );
}

export function AnimatedView({
  animation = "right",
  children,
  style,
  duration = 300,
  delay = 0,
  distance,
}) {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useSharedValue(
    animation === "left"
      ? -(distance ?? screenWidth)
      : (distance ?? screenWidth)
  );

  useEffect(() => {
    const startOffset =
      animation === "left"
        ? -(distance ?? screenWidth)
        : (distance ?? screenWidth);
    translateX.value = startOffset;
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [animation, duration, delay, distance]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}
