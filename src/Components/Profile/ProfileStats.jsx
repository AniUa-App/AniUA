import { View, Text, StyleSheet } from "react-native";
import { H4, H6 } from "../../Styles/Fonts";

export default function ProfileStats({ stats, favorites, colors }) {
  const userStats = [
    { value: stats?.planned ?? 0, label: "У планах" },
    { value: stats?.watching ?? 0, label: "Дивлюсь" },
    { value: stats?.completed ?? 0, label: "Оглянуто" },
    { value: favorites?.pagination?.total ?? 0, label: "Обрані" },
  ];

  return (
    <View style={styles.statsContainer}>
      {userStats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statItem,
            {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <Text
            style={[
              H4,
              {
                color: colors.text,
                fontFamily: "Nunito-SemiBold",
              },
            ]}
          >
            {String(stat.value)}
          </Text>
          <Text style={[H6, { color: colors.text }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 6,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
});
