import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Button";
import { primary } from "../../Styles/Colors";
import { H3, H4, H5 } from "../../Styles/Fonts";
import Slider from "@react-native-community/slider";
import { useThemeColors } from "../../Global/useTheme";

export default function SpeedBottomSheet({
  sheetRef,
  currentRate,
  onRateChange,
}) {
  const themeColors = useThemeColors();
  const [tempRate, setTempRate] = useState(currentRate);
  const [orientation, setOrientation] = useState(
    getOrientation(
      Dimensions.get("window").width,
      Dimensions.get("window").height,
    ),
  );

  useEffect(() => {
    setTempRate(currentRate);
  }, [currentRate]);

  function getOrientation(width, height) {
    if (!width || !height) return "vertical";
    return width > height ? "horizontal" : "vertical";
  }

  useEffect(() => {
    const handleChange = ({ window }) => {
      setOrientation(getOrientation(window.width, window.height));
      sheetRef.current?.close();
    };

    const subscription = Dimensions.addEventListener("change", handleChange);

    return () => {
      subscription?.remove?.();
    };
  }, [sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={orientation === "horizontal" ? ["50%"] : ["20%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.Background(0.95) }}
      handleIndicatorStyle={{ backgroundColor: themeColors.InActiveText(0.5) }}
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
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text
            selectable={true}
            style={[H3, { color: themeColors.text, marginBottom: 8 }]}
          >
            Швидкість відтворення
          </Text>
          <Text
            selectable={true}
            style={[H4, { color: primary, textAlign: "center" }]}
          >
            {tempRate.toFixed(2)}x
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text
            selectable={true}
            style={[H5, { color: themeColors.InActiveText(0.7), minWidth: 40 }]}
          >
            0.25x
          </Text>
          <Slider
            style={styles.slider}
            value={tempRate}
            minimumValue={0.25}
            maximumValue={4.0}
            step={0.05}
            minimumTrackTintColor={primary}
            maximumTrackTintColor={themeColors.InActiveText(0.5)}
            thumbTintColor={primary}
            onValueChange={(value) => {
              setTempRate(value);
              onRateChange(value);
            }}
          />
          <Text
            selectable={true}
            style={[
              H5,
              {
                color: themeColors.InActiveText(0.7),
                minWidth: 40,
                textAlign: "right",
              },
            ]}
          >
            4.0x
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  presetsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    minWidth: 55,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  presetButtonActive: {
    borderWidth: 2,
  },
});
