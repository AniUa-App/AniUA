import { ScrollView, Text } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";
import { H5 } from "../../Styles/Fonts";
import { useFilterChipsStyles } from "../../Styles/components/Profile/FilterChipsStyles";

export default function FilterChips({
  filters,
  activeFilter,
  onFilterSelect,
  colors,
}) {
  const s = useFilterChipsStyles();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filtersContainer}
    >
      {filters.map((filter, index) => {
        const Icon = Icons[filter.icon];
        const isActive = activeFilter === filter.id;
        const filterColor = colors[filter.colorKey];
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              s.filterChip,
              {
                borderColor: colors.background,
                backgroundColor: colors.background,
                marginLeft: index === 0 ? 8 : 0,
                marginRight: index === filters.length - 1 ? 8 : 0,
              },
            ]}
            onPress={() => onFilterSelect(filter.id)}
          >
            <Icon
              size={18}
              color={filterColor}
              weight={isActive ? "fill" : "regular"}
            />
            <Text
              selectable={true}
              style={[
                H5,
                {
                  color: isActive ? filterColor : colors.text,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

