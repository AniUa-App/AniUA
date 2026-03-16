import React from "react";
import { View, Text } from "react-native";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H5 } from "../Styles/Fonts";
import { useSearchEmptyStateComponentStyles } from "../Styles/components/SearchEmptyStateComponentStyles";

interface SearchEmptyStateComponentProps {
  hasSearched: boolean;
  isLoading?: boolean;
}

export default function SearchEmptyStateComponent({
  hasSearched,
  isLoading = false,
}: SearchEmptyStateComponentProps) {
  const themeColors = useThemeColors();
  const s = useSearchEmptyStateComponentStyles();

  if (isLoading) return null;

  return (
    <View style={[s.container, { backgroundColor: themeColors.subtle }]}>
      <Icons.MagnifyingGlass size={64} color={themeColors.text} weight="thin" />
      <Text
        selectable={true}
        style={[H5, s.text, { color: themeColors.text }]}
      >
        {hasSearched ? "Нічого не знайдено" : "Введіть запит для пошуку"}
      </Text>
    </View>
  );
}

