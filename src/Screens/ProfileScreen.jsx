import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { useScaleFontSize } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useHikkaUser } from "../Hooks/useHikkaUser";

const TABS = [
  { id: "list", icon: "Play" },
  { id: "favorites", icon: "Heart" },
  { id: "friends", icon: "UsersThree" },
];

const FILTERS = [
  { id: "completed", label: "Оглянуто", icon: "CheckCircle" },
  { id: "planned", label: "У планах", icon: "PlusCircle" },
  { id: "watching", label: "Дивлюсь", icon: "Play" },
];

export default function ProfileScreen({ navigation }) {
  const colors = useThemeColors();
  const scaleFontSize = useScaleFontSize();
  const [activeTab, setActiveTab] = useState("favorites");
  const [activeFilters, setActiveFilters] = useState(["completed"]);

  const { user, stats, isLoading, isAuthenticated, login, logout } =
    useHikkaUser();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setBarStyle("light-content");
    }, [])
  );

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const userStats = [
    { value: stats?.planned ?? 0, label: "У планах" },
    { value: stats?.watching ?? 0, label: "Дивлюсь" },
    { value: stats?.completed ?? 0, label: "Оглянуто" },
    { value: (stats?.on_hold ?? 0) + (stats?.dropped ?? 0), label: "Інше" },
  ];

  const displayName = user?.username || "Користувач AniUa";
  const handle = user?.username ? `@${user.username}` : "@aniua_user";
  const avatarUrl = user?.avatar;

  // Стан завантаження
  if (isLoading) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DefaultScreenWidget>
    );
  }

  // Не авторизований
  if (!isAuthenticated) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={styles.notAuthContainer}>
          <View
            style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}
          >
            <Icons.User size={72} color={colors.Text(0.3)} weight="regular" />
          </View>

          <Text
            style={[
              styles.notAuthTitle,
              { color: colors.text, fontSize: scaleFontSize(18) },
            ]}
          >
            Увійдіть в акаунт
          </Text>

          <Text
            style={[
              styles.notAuthSubtitle,
              { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
            ]}
          >
            Авторизуйтесь через Hikka, щоб синхронізувати свій список аніме
          </Text>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={login}
          >
            <Icons.SignIn size={20} color={colors.background} weight="bold" />
            <Text
              style={[
                styles.loginButtonText,
                { color: colors.background, fontSize: scaleFontSize(15) },
              ]}
            >
              Увійти через Hikka
            </Text>
          </TouchableOpacity>
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={[styles.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={28} color={colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <FastImage
              source={{ uri: avatarUrl }}
              style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View
              style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}
            >
              <Icons.User size={72} color={colors.Text(0.5)} weight="regular" />
            </View>
          )}
        </View>

        {/* Username */}
        <View style={styles.usernameContainer}>
          <Text
            style={[
              styles.displayName,
              { color: colors.text, fontSize: scaleFontSize(17) },
            ]}
          >
            {displayName}
          </Text>
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: colors.subtle, width: 48 },
            ]}
          >
            <Icons.Pencil size={18} color={colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.handle, { color: colors.Text(0.5) }]}>{handle}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {userStats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statItem,
                {
                  borderColor: colors.Primary(0.2),
                  backgroundColor: colors.Background(0.3),
                },
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  { color: colors.primary, fontSize: scaleFontSize(18) },
                ]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: colors.Text(0.5), fontSize: scaleFontSize(11) },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View
          style={[styles.tabsContainer, { borderColor: colors.Primary(0.15) }]}
        >
          {TABS.map((tab) => {
            const IconComponent = Icons[tab.icon];
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabItem,
                  isActive && {
                    borderBottomWidth: 2,
                    borderBottomColor: colors.primary,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <IconComponent
                  size={24}
                  color={isActive ? colors.primary : colors.Text(0.3)}
                  weight={isActive ? "fill" : "regular"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {FILTERS.map((filter) => {
            const IconComponent = Icons[filter.icon];
            const isActive = activeFilters.includes(filter.id);
            return (
              <Pressable
                key={filter.id}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: "transparent",
                    borderColor: isActive
                      ? colors.primary
                      : colors.Primary(0.25),
                  },
                ]}
                onPress={() => toggleFilter(filter.id)}
              >
                <IconComponent
                  size={16}
                  color={isActive ? colors.primary : colors.Text(0.4)}
                  weight={isActive ? "fill" : "regular"}
                />
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: isActive ? colors.primary : colors.Text(0.4),
                      fontSize: scaleFontSize(13),
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.Primary(0.3) }]}
          onPress={logout}
        >
          <Icons.SignOut size={18} color={colors.primary} weight="bold" />
          <Text
            style={[
              styles.logoutButtonText,
              { color: colors.primary, fontSize: scaleFontSize(14) },
            ]}
          >
            Вийти
          </Text>
        </TouchableOpacity>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Empty state or content will go here */}
        </View>
      </ScrollView>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  notAuthTitle: {
    fontFamily: "Nunito-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  notAuthSubtitle: {
    fontFamily: "Nunito-Regular",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  loginButtonText: {
    fontFamily: "Nunito-Bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  avatarOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  usernameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  displayName: {
    fontFamily: "Nunito-SemiBold",
  },
  editButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  handle: {
    textAlign: "center",
    marginTop: 2,
    fontFamily: "Nunito-Regular",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 72,
  },
  statValue: {
    fontFamily: "Nunito-Bold",
  },
  statLabel: {
    fontFamily: "Nunito-Regular",
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    gap: 56,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 5,
  },
  filterLabel: {
    fontFamily: "Nunito-SemiBold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 24,
    gap: 8,
  },
  logoutButtonText: {
    fontFamily: "Nunito-SemiBold",
  },
  contentArea: {
    flex: 1,
    minHeight: 200,
    marginTop: 16,
  },
});
