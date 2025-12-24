import React from "react";
import { View, StyleSheet } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import TextInputComponent from "./TextInputComponent";

interface SearchHeaderComponentProps {
  searchText: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  onGoBack: () => void;
  onFilterPress: () => void;
  paddingTop: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchHeaderComponent({
  searchText,
  onChangeText,
  onSubmitEditing,
  onGoBack,
  onFilterPress,
  paddingTop,
  placeholder = "Пошук аніме...",
  autoFocus = true,
}: SearchHeaderComponentProps) {
  const themeColors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop,
          backgroundColor: themeColors.background,
        },
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColors.subtle }]}
        onPress={onGoBack}
      >
        <Icons.ArrowLeft
          size={32}
          color={themeColors.primary}
          weight="regular"
        />
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInputComponent
          title={searchText}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColors.subtle }]}
        onPress={onFilterPress}
      >
        <Icons.SlidersHorizontal
          size={32}
          color={themeColors.primary}
          weight="regular"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  button: {
    padding: 6,
    borderRadius: 16,
  },
  searchInputContainer: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
});
