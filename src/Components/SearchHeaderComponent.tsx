import React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import TextInputComponent from "./TextInputComponent";
import { useSearchHeaderComponentStyles } from "../Styles/components/SearchHeaderComponentStyles";

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
  const s = useSearchHeaderComponentStyles();

  return (
    <View
      style={[
        s.header,
        {
          paddingTop,
        },
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={[s.button, { backgroundColor: themeColors.subtle }]}
        onPress={onGoBack}
      >
        <Icons.ArrowLeft
          size={32}
          color={themeColors.primary}
          weight="regular"
        />
      </TouchableOpacity>

      {/* Search Input */}
      <View style={s.searchInputContainer}>
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
        style={[
          s.button,
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

