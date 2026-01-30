import { ScrollView, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";
import { H5 } from "../../Styles/Fonts";

export default function FilterChips({
  filters,
  activeFilter,
  onFilterSelect,
  colors,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {filters.map((filter, index) => {
        const Icon = Icons[filter.icon];
        const isActive = activeFilter === filter.id;
        const filterColor = colors[filter.colorKey];
        return (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
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

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    height: 38,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 8,
    gap: 5,
  },
});
