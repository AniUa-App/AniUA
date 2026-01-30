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
  activeCategory: string;
}

export default function SearchHeaderComponent({
  searchText,
  onChangeText,
  onSubmitEditing,
  onGoBack,
  onFilterPress,
  paddingTop,
  placeholder = "Пошук...",
  autoFocus = true,
  activeCategory,
}: SearchHeaderComponentProps) {
  const themeColors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop,
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
        <Text
          selectable={true}
          InputComponent
          title={searchText}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </View>

      {/* Filter Button */}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              activeCategory === "anime" || activeCategory === "team"
                ? themeColors.subtle
                : themeColors.Subtle(0.5),
          },
        ]}
        onPress={
          activeCategory === "anime" || activeCategory === "team"
            ? onFilterPress
            : null
        }
      >
        <Icons.SlidersHorizontal
          size={32}
          color={
            activeCategory === "anime" || activeCategory === "team"
              ? themeColors.primary
              : themeColors.Primary(0.5)
          }
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
