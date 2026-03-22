import { View, Text } from "react-native";
import {
  useProfileStatsPhoneStyles,
  useProfileStatsTabletsStyles,
} from "../../Styles/components/Profile/ProfileStatsStyles";
import { JSX, useMemo } from "react";
import Icon from "../../Styles/Icons";
import Svg, { Circle } from "react-native-svg";

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
      <ProfileStatsPhone stats={stats} favorites={favorites} />
    ) : type === "tv" ? (
      <ProfileStatsTV stats={stats} colors={colors} />
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
}: {
  stats: any;
  favorites: any;
}) {
  const s = useProfileStatsPhoneStyles();
  const userStats = [
    { value: stats?.planned ?? 0, label: "У планах" },
    { value: stats?.watching ?? 0, label: "Дивлюсь" },
    { value: stats?.completed ?? 0, label: "Оглянуто" },
    { value: favorites?.pagination?.total ?? 0, label: "Обрані" },
  ];

  return (
    <View style={s.statsContainer}>
      {userStats.map((stat, index) => (
        <View key={index} style={s.statItem}>
          <Text selectable={true} style={s.statValue}>
            {String(stat.value)}
          </Text>
          <Text selectable={true} style={s.statLabel}>
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
  const s = useProfileStatsTabletsStyles();
  const { size, strokeWidth, radius, circumference, center } = s.chart;

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

  const total = useMemo(
    () => sortedUserStatsList.reduce((sum, s) => sum + s.value, 0),
    [sortedUserStatsList],
  );

  const segmentGap = sortedUserStatsList.length > 1 ? 0.02 : 0;

  return (
    <View style={s.statsContainer}>
      <View style={s.statsRow}>
        <View style={s.statsList}>
          {sortedUserStatsList.map((stat, index) => (
            <View key={index} style={s.statItem}>
              <stat.icon size={24} color={stat.color} weight="fill" />
              <Text selectable={true} style={s.statLabel}>
                {stat.label}
              </Text>
              <Text selectable={true} style={s.statValue}>
                {String(stat.value)}
              </Text>
            </View>
          ))}
        </View>
        {total > 0 && (
          <View style={s.chartContainer}>
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
                  const segmentLength = (fraction - segmentGap) * circumference;
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
            <View style={s.chartCenter}>
              <Text style={s.chartCenterValue}>
                {String(favorites?.pagination?.total ?? 0)}
              </Text>
              <Text style={s.chartCenterLabel}>Обрані</Text>
            </View>
            <View style={s.chartStatItem}>
              <Text selectable={true} style={s.statLabel}>
                Всього
              </Text>
              <Text selectable={true} style={s.statValue}>
                {String(total)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function ProfileStatsTV({ stats, colors }: { stats: any; colors: any }) {
  const s = useProfileStatsTabletsStyles();
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

  return (
    <View focusable={false} style={s.statsContainer}>
      <View style={s.statsRow} focusable={false}>
        <View style={s.statsList} focusable={false}>
          {sortedUserStatsList.map((stat, index) => (
            <View key={index} style={s.statItem} focusable={false}>
              <stat.icon size={24} color={stat.color} weight="fill" />
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={s.statValue}>{String(stat.value)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
