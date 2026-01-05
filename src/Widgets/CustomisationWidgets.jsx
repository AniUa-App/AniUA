import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { useState, useEffect } from "react";
import { primary, background, text } from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5, H6 } from "../Styles/Fonts";
import SettingsItemWidget from "./SettingsItemWidget";
import Icons from "../Styles/Icons";
import Slider from "@react-native-community/slider";
import ColorPicker, {
  Panel1,
  Swatches,
  OpacitySlider,
  HueSlider,
  colorKit,
} from "reanimated-color-picker";
import { runOnJS } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import Logger from "../Logger/Logger";

const customSwatches = new Array(6)
  .fill("#fff")
  .map(() => colorKit.randomRgbColor().hex());

export function SliderWidget({
  title,
  icon,
  onValueChange = () => {},
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
}) {
  const themeColors = useThemeColors();
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  return (
    <View style={[styles.sliderContainer, { borderColor: themeColors.subtle }]}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderTitleRow}>
          {icon && (
            <View style={[styles.sliderIcon, { backgroundColor: themeColors.Background(0.5) }]}>
              {icon}
            </View>
          )}
          <Text style={[H4, { color: themeColors.text }]}>{title}</Text>
        </View>
        <View style={[styles.valueContainer, { backgroundColor: themeColors.primary }]}>
          <Text style={[H4, { color: themeColors.text }]}>{sliderValue}</Text>
        </View>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={1}
          value={sliderValue}
          minimumTrackTintColor={themeColors.primary}
          maximumTrackTintColor={themeColors.Text(0.2)}
          thumbTintColor={themeColors.primary}
          onValueChange={(val) => {
            setSliderValue(val);
            onValueChange(val);
          }}
        />
        <View style={styles.rangeLabels}>
          <Text style={[H6, { color: themeColors.Text(0.5) }]}>{minimumValue}</Text>
          <Text style={[H6, { color: themeColors.Text(0.5) }]}>{maximumValue}</Text>
        </View>
      </View>
    </View>
  );
}

export function ColorPickerWidget({
  title,
  icon,
  onValueChange = () => {},
  onComplete = () => {},
  value = primary,
}) {
  const themeColors = useThemeColors();
  const [pickerColor, setPickerColor] = useState(
    typeof value === "string" ? value : customSwatches[0]
  );
  const [isOpened, setIsOpened] = useState(false);

  if (!isOpened) {
    return (
      <SettingsItemWidget
        title={title}
        icon={icon || <Icons.Palette />}
        iconColor={value}
        showChevron
        onPress={() => setIsOpened(true)}
      />
    );
  }

  return (
    <View style={[styles.colorPickerContainer, { borderColor: themeColors.subtle }]}>
      <View style={styles.colorPickerHeader}>
        <Text style={[H4, { color: themeColors.text, paddingLeft: 8 }]}>{title}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsOpened(false)}
        >
          <Icons.X size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.colorPickerContent}>
        <ColorPicker
          value={pickerColor}
          sliderThickness={25}
          thumbSize={24}
          thumbShape="circle"
          onChange={(c) => {
            "worklet";
            const hex = c?.hex ?? pickerColor;
            runOnJS(setPickerColor)(hex);
            runOnJS(onValueChange)(c);
          }}
          onComplete={(c) => {
            "worklet";
            const hex = c?.hex ?? pickerColor;
            runOnJS(setPickerColor)(hex);
            runOnJS(onComplete)(c);
          }}
          style={styles.picker}
          boundedThumb
        >
          <View style={{ flexDirection: "column", gap: 15 }}>
            <Panel1 style={styles.panelStyle} />
            <HueSlider style={styles.hueSliderStyle} />
            <OpacitySlider style={styles.hueSliderStyle} />
          </View>

          <Swatches
            style={styles.swatchesContainer}
            swatchStyle={styles.swatchStyle}
            colors={customSwatches}
          />
        </ColorPicker>
      </View>
    </View>
  );
}

export function PhotoPickerWidget({ title, subtitle, icon, onPick }) {
  const themeColors = useThemeColors();
  const [, setImage] = useState(null);

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      Logger.debug("Customisation", "Результат вибору зображення", { result });

      const canceled = result?.canceled ?? result?.type === "cancel";
      if (canceled) {
        return null;
      }

      const asset = result?.assets?.[0] || result;
      const uri = asset?.uri || null;
      const name = asset?.name || null;
      const mimeType = asset?.mimeType || null;
      if (!uri) {
        Logger.warn(
          "Customisation",
          "Не вдалося отримати URI вибраного зображення"
        );
        return null;
      }

      setImage(uri);
      const payload = { uri, name, mimeType };
      onPick?.(payload);
      return payload;
    } catch (err) {
      Logger.error("Customisation", "Помилка вибору зображення", err);
      return null;
    }
  };

  return (
    <SettingsItemWidget
      title={title}
      subtitle={subtitle}
      icon={icon || <Icons.Image />}
      button={{
        Icon: <Icons.FolderOpen size={28} color={themeColors.text} />,
      }}
      onPress={pickImage}
    />
  );
}

export function ToggleSettingWidget({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  onToggle,
}) {
  const themeColors = useThemeColors();

  return (
    <SettingsItemWidget
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      button={{
        Icon: value ? (
          <Icons.ToggleRight size={34} color={themeColors.primary} weight="fill" />
        ) : (
          <Icons.ToggleLeft size={34} color={themeColors.inActiveText} />
        ),
      }}
      onPress={onToggle}
    />
  );
}

export function ExpandableSection({ title, icon, iconColor, expanded, onToggle, children }) {
  const themeColors = useThemeColors();
  const [animatedHeight] = useState(new Animated.Value(expanded ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <View>
      <SettingsItemWidget
        title={title}
        icon={icon}
        iconColor={iconColor}
        button={{
          Icon: (
            <Icons.CaretDown
              size={24}
              color={themeColors.inActiveText}
              style={{
                transform: [{ rotate: expanded ? "180deg" : "0deg" }],
              }}
            />
          ),
        }}
        onPress={onToggle}
      />
      {expanded && (
        <Animated.View
          style={{
            opacity: animatedHeight,
            paddingHorizontal: 8,
            paddingTop: 8,
          }}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    backgroundColor: "transparent",
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sliderWrapper: {
    alignItems: "center",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  colorPickerContainer: {
    backgroundColor: "transparent",
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
  },
  colorPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  colorPickerContent: {
    alignItems: "center",
  },
  picker: {
    gap: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  panelStyle: {
    borderRadius: 16,
    width: 180,
    height: 180,
  },
  hueSliderStyle: {
    width: 180,
    height: 25,
    borderRadius: 12,
  },
  swatchesContainer: {
    flexDirection: "column",
    gap: 12,
  },
  swatchStyle: {
    borderRadius: 16,
    height: 28,
    width: 28,
    margin: 0,
  },
});
