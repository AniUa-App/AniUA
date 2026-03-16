import React from "react";
import { View, Text, ScrollView } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H6 } from "../Styles/Fonts";
import { useSearchCategoryTabsComponentStyles } from "../Styles/components/SearchCategoryTabsComponentStyles";

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
  const s = useSearchCategoryTabsComponentStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={s.scrollView}
      contentContainerStyle={[s.container]}
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
              s.tab,
              {
                backgroundColor: themeColors.subtle,
                borderBottomLeftRadius: isActive ? 0 : 18,
                borderBottomRightRadius: isActive ? 0 : 18,
                height: isActive ? 40 : 34,
                paddingBottom: isActive ? 2 : 0,
              },
            ]}
            onPress={() => onCategoryChange(category.id)}
          >
            <View style={s.tabContent}>
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
                selectable={true}
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

