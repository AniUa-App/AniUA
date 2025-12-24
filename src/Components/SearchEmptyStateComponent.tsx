import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H5 } from "../Styles/Fonts";

interface SearchEmptyStateComponentProps {
  hasSearched: boolean;
  isLoading?: boolean;
}

export default function SearchEmptyStateComponent({
  hasSearched,
  isLoading = false,
}: SearchEmptyStateComponentProps) {
  const themeColors = useThemeColors();

  if (isLoading) return null;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.subtle }]}>
      <Icons.MagnifyingGlass size={64} color={themeColors.text} weight="thin" />
      <Text style={[H5, styles.text, { color: themeColors.text }]}>
        {hasSearched ? "Нічого не знайдено" : "Введіть запит для пошуку"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "60%",
  },
  text: {
    opacity: 0.6,
    marginTop: 16,
  },
});
