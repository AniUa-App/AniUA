import { View, Text, StyleSheet } from "react-native";
import { H4, H5, H6 } from "../../Styles/Fonts";
import { JSX } from "react";
import Icon from "../../Styles/Icons";

const profileStats = ({
  stats,
  favorites,
  colors,
  type,
}: {
  stats: any;
  favorites: any;
  colors: any;
  type: "phone" | "tablet";
}): JSX.Element => {
  if (stats && favorites && colors) {
    return type === "phone" ? (
      <ProfileStatsPhone stats={stats} favorites={favorites} colors={colors} />
    ) : (
      <ProfileStatsTablet stats={stats} favorites={favorites} colors={colors} />
    );
  }
  return null;
};

export default profileStats;
function ProfileStatsPhone({
  stats,
  favorites,
  colors,
}: {
  stats: any;
  favorites: any;
  colors: any;
}) {
  const userStats = [
    {
      value: stats?.planned ?? 0,
      label: "У планах",
    },
    {
      value: stats?.watching ?? 0,
      label: "Дивлюсь",
    },
    {
      value: stats?.completed ?? 0,
      label: "Оглянуто",
    },
    {
      value: favorites?.pagination?.total ?? 0,
      label: "Обрані",
    },
  ];

  return (
    <View style={stylesPhone.statsContainer}>
      {userStats.map((stat, index) => (
        <View
          key={index}
          style={[
            stylesPhone.statItem,
            {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <Text
            selectable={true}
            style={[
              H4,
              {
                color: colors.text,
                fontWeight: "700",
              },
            ]}
          >
            {String(stat.value)}
          </Text>
          <Text
            selectable={true}
            style={[H6, { color: colors.text, opacity: 0.7 }]}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
function ProfileStatsTablet({
  stats,
  favorites,
  colors,
}: {
  stats: any;
  favorites: any;
  colors: any;
}) {
  const userStats = [
    {
      key: "planned",
      label: "Заплановано",
      icon: Icon.PlusCircle,
      value: stats?.planned ?? 0,
      color: colors.yellowBookmark,
    },
    {
      key: "completed",
      label: "Переглянуто",
      icon: Icon.CheckCircle,
      value: stats?.completed ?? 0,
      color: colors.orangeBookmark,
    },
    {
      key: null,
      label: "Не дивлюсь",
      icon: Icon.PlusCircle,
      value: stats?.dropped ?? 0,
      color: colors.withoutBookmark,
    },
    {
      key: "on_hold",
      label: "Відкладено",
      icon: Icon.PauseCircle,
      value: stats?.on_hold ?? 0,
      color: colors.blueBookmark,
    },
    {
      key: "dropped",
      label: "Закинуто",
      icon: Icon.XCircle,
      value: stats?.dropped ?? 0,
      color: colors.redBookmark,
    },
    {
      key: "watching",
      label: "Дивлюсь",
      icon: Icon.PlayCircle,
      value: stats?.watching ?? 0,
      color: colors.primary,
    },
  ];

  return (
    <View style={stylesTablets.statsContainer}>
      {userStats.map((stat, index) => (
        <View
          key={index}
          style={[
            stylesTablets.statItem,
            {
              backgroundColor: colors.accent,
            },
          ]}
        >
          <View
            style={[
              stylesTablets.iconContainer,
              {
                backgroundColor: stat.color + "20",
              },
            ]}
          >
            <stat.icon size={20} color={stat.color} weight="fill" />
          </View>
          <View style={stylesTablets.textContainer}>
            <Text
              selectable={true}
              style={[
                H4,
                {
                  color: colors.text,
                  fontWeight: "700",
                },
              ]}
            >
              {String(stat.value)}
            </Text>
            <Text
              selectable={true}
              style={[
                H6,
                {
                  color: colors.text,
                  opacity: 0.7,
                },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const stylesPhone = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 4,
  },
});

const stylesTablets = StyleSheet.create({
  statsContainer: {
    flexDirection: "column",
    marginHorizontal: 16,
    marginTop: 20,
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
});
