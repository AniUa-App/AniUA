import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H6 } from "../Styles/Fonts";

export interface SearchCategory {
  id: string;
  label: string;
  icon: keyof typeof Icons;
}

interface SearchCategoryTabsComponentProps {
  categories: SearchCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function SearchCategoryTabsComponent({
  categories,
  activeCategory,
  onCategoryChange,
}: SearchCategoryTabsComponentProps) {
  const themeColors = useThemeColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={[styles.container]}
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const IconComponent = Icons[category.icon] as React.ComponentType<{
          size: number;
          color: string;
          weight: string;
        }>;

        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              {
                backgroundColor: themeColors.Subtle(0.9),
                borderBottomLeftRadius: isActive ? 0 : 18,
                borderBottomRightRadius: isActive ? 0 : 18,
                height: isActive ? 40 : 34,
                paddingBottom: isActive ? 2 : 0,
              },
            ]}
            onPress={() => onCategoryChange(category.id)}
          >
            <View style={styles.tabContent}>
              {IconComponent && (
                <IconComponent
                  size={18}
                  color={
                    isActive ? themeColors.activeIcon : themeColors.inActiveText
                  }
                  weight={isActive ? "fill" : "regular"}
                />
              )}
              <Text
                style={[
                  H6,
                  {
                    color: isActive
                      ? themeColors.text
                      : themeColors.inActiveText,
                    marginLeft: 6,
                  },
                ]}
              >
                {category.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 55,
    gap: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
