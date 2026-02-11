import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import React, { useRef, useState, useLayoutEffect } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { HikkaSets } from "../Sources/HikkaSets";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Logger from "../Logger/Logger";
import { useThemeColors } from "../Global/useTheme";

export default function TextInputComponent({
  title = "",
  onChangeText = () => {},
  onSubmitEditing = () => {},
  placeholder = "Назва",
  returnKeyType = "search",
  autoFocus = false,
  style,
}) {
  const themeColors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[style]}>
      <TextInput
        value={title}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={themeColors.inActiveText}
        returnKeyType={returnKeyType}
        autoFocus={autoFocus}
        style={{
          height: 45,
          width: "100%",
          paddingHorizontal: 16,
          color: themeColors.text,
          backgroundColor: themeColors.Subtle(1),
          borderRadius: 16,
          borderWidth: isFocused ? 1 : 0,
          borderColor: isFocused ? themeColors.primary : "transparent",
        }}
      />
    </View>
  );
}
