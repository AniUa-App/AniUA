import { View, Text, StyleSheet } from "react-native";
import { H4, H5, H6 } from "../../Styles/Fonts";
import { JSX, useMemo } from "react";
import Icon from "../../Styles/Icons";
import Svg, { Circle } from "react-native-svg";
import { stat } from "react-native-fs";

const profileStats = ({
  stats,
  favorites,
  colors,
  type,
}: {
  stats: any;
  favorites: any;
  colors: any;
  type: "phone" | "tablet" | "tv";
}): JSX.Element => {
  if (stats && favorites && colors) {
    return type === "phone" ? (
      <ProfileStatsPhone stats={stats} favorites={favorites} colors={colors} />
    ) : type === "tv" ? (
      <ProfileStatsTV stats={stats} favorites={favorites} colors={colors} />
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
  const sortedUserStatsList = useMemo(() => {
    return userStats.sort(
      (a, b) =>
        ((String(b.value) as any) + b.label).length +
        b.value -
        ((String(a.value) as any) + a.label).length -
        a.value,
    );
  }, [userStats]);

  const total = useMemo(() => {
    return sortedUserStatsList.reduce((sum, s) => sum + s.value, 0);
  }, [sortedUserStatsList]);

  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const gap = sortedUserStatsList.length > 1 ? 0.02 : 0;

  return (
    <View
      style={[
        stylesTablets.statsContainer,
        {
          backgroundColor: colors.accent,
        },
      ]}
    >
      <View style={stylesTablets.statsRow}>
        <View style={stylesTablets.statsList}>
          {sortedUserStatsList.map((stat, index) => (
            <View key={index} style={[stylesTablets.statItem]}>
              <stat.icon size={24} color={stat.color} weight="fill" />
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
              <Text
                selectable={true}
                style={[
                  H5,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {String(stat.value)}
              </Text>
            </View>
          ))}
        </View>
        {total > 0 && (
          <View style={stylesTablets.chartContainer}>
            <Svg width={size} height={size}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {(() => {
                let offset = 0;
                return sortedUserStatsList.map((segment, i) => {
                  const fraction = segment.value / total;
                  if (fraction <= 0) return null;
                  const segmentLength = (fraction - gap) * circumference;
                  const dashOffset = circumference * 0.25 - offset;
                  offset += fraction * circumference;
                  return (
                    <Circle
                      key={i}
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  );
                });
              })()}
            </Svg>
            <View style={stylesTablets.chartCenter}>
              <Text
                style={[
                  H4,
                  {
                    color: colors.text,
                    fontWeight: "700",
                  },
                ]}
              >
                {String(favorites?.pagination?.total ?? 0)}
              </Text>
              <Text
                style={[
                  H6,
                  {
                    color: colors.text,
                    opacity: 0.5,
                  },
                ]}
              >
                Обрані
              </Text>
            </View>
            <View
              style={[
                stylesTablets.statItem,
                {
                  marginTop: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 16,
                },
              ]}
            >
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
                Всього
              </Text>
              <Text
                selectable={true}
                style={[
                  H5,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {String(total ?? 0)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
function ProfileStatsTV({
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
  const sortedUserStatsList = useMemo(() => {
    return userStats.sort(
      (a, b) =>
        ((String(b.value) as any) + b.label).length +
        b.value -
        ((String(a.value) as any) + a.label).length -
        a.value,
    );
  }, [userStats]);

  const total = useMemo(() => {
    return sortedUserStatsList.reduce((sum, s) => sum + s.value, 0);
  }, [sortedUserStatsList]);

  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const gap = sortedUserStatsList.length > 1 ? 0.02 : 0;

  return (
    <View
      focusable={false}
      style={[
        stylesTablets.statsContainer,
        {
          backgroundColor: colors.accent,
        },
      ]}
    >
      <View style={stylesTablets.statsRow} focusable={false}>
        <View style={stylesTablets.statsList} focusable={false}>
          {sortedUserStatsList.map((stat, index) => (
            <View
              key={index}
              style={[stylesTablets.statItem]}
              focusable={false}
            >
              <stat.icon size={24} color={stat.color} weight="fill" />
              <Text
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
              <Text
                style={[
                  H5,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {String(stat.value)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
const stylesPhone = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    flexWrap: "wrap",
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
    borderRadius: 16,
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 84,
  },
  statsList: {
    gap: 16,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 38,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "flex-start",
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
});
