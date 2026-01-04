import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { H2, H3, H4, H5, H6, useScaleFontSize } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Icons from "../Styles/Icons";
import { useHikkaUser } from "../Hooks/useHikkaUser";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { Image } from "../Widgets/LoadersWidgets";
import BloomImage, { prefetchBloomImage } from "../Widgets/BloomImage";
import { background } from "../Styles/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedTabButton = ({ tab, isActive, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }, [isActive]);

  const Icon = Icons[tab.icon];

  const animatedSize = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 46],
  });

  const animatedBorderRadius = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const animatedTopBorderRadius = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 16],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.tabItem,
          {
            backgroundColor: colors.accent,
            width: animatedSize,
            height: animatedSize,
            borderTopLeftRadius: animatedTopBorderRadius,
            borderTopRightRadius: animatedTopBorderRadius,
            borderBottomLeftRadius: animatedBorderRadius,
            borderBottomRightRadius: animatedBorderRadius,
          },
        ]}
      >
        <Icon size={28} color={isActive ? colors.activeIcon : colors.icon} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const TABS = [
  { id: "list", icon: "MonitorPlay" },
  { id: "favorites", icon: "Heart" },
];

const FILTERS = [
  { id: "watching", label: "Дивлюсь", icon: "PlayCircle", colorKey: "primary" },
  {
    id: "planned",
    label: "У планах",
    icon: "PlusCircle",
    colorKey: "yellowBookmark",
  },
  {
    id: "completed",
    label: "Оглянуто",
    icon: "CheckCircle",
    colorKey: "orangeBookmark",
  },
  {
    id: "on_hold",
    label: "Відкладено",
    icon: "PauseCircle",
    colorKey: "blueBookmark",
  },
  {
    id: "dropped",
    label: "Закинуто",
    icon: "XCircle",
    colorKey: "redBookmark",
  },
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProfileScreen({ navigation }) {
  const colors = useThemeColors();
  const scaleFontSize = useScaleFontSize();
  const [activeTab, setActiveTab] = useState("list");
  const [activeFilter, setActiveFilter] = useState("watching");
  const [animeList, setAnimeList] = useState([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);

  const insets = useSafeAreaInsets();
  const tabScrollRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeTabIndex = TABS.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -activeTabIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [activeTabIndex]);

  const { user, stats, favorites, isLoading, isAuthenticated, login, logout } =
    useHikkaUser();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setBarStyle("light-content");
    }, [])
  );

  const selectFilter = (filterId) => {
    setActiveFilter(filterId);
  };

  // Завантаження списку аніме при зміні фільтра
  useEffect(() => {
    const fetchAnimeList = async () => {
      if (!user?.username || !activeFilter) return;

      setIsLoadingAnime(true);
      try {
        const response = await HikkaApiComplete.getUserWatchList(
          user.username,
          {
            page: 1,
            size: 50,
            watch_status: activeFilter,
          }
        );
        setAnimeList(response?.list || []);
      } catch (error) {
        console.error("Error fetching anime list:", error);
        setAnimeList([]);
      } finally {
        setIsLoadingAnime(false);
      }
    };

    fetchAnimeList();
  }, [user?.username, activeFilter]);

  const userStats = [
    { value: stats?.planned ?? 0, label: "У планах" },
    { value: stats?.watching ?? 0, label: "Дивлюсь" },
    { value: stats?.completed ?? 0, label: "Оглянуто" },
    { value: favorites?.pagination?.total ?? 0, label: "Обрані" },
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
            <Icons.GearSix size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {!avatarUrl?.includes("avatar") ? (
            <Image
              uri={avatarUrl}
              style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}
              resizeMode="cover"
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

        <Text style={[styles.handle, { color: colors.Text(0.5) }]}>
          {handle}
        </Text>

        {/* Stats */}
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

        {/* Tabs */}
        <View
          style={[styles.tabsContainer, { borderBottomColor: colors.subtle }]}
        >
          {TABS.map((tab) => (
            <AnimatedTabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onPress={() => setActiveTab(tab.id)}
              colors={colors}
            />
          ))}
        </View>

        {/* Tab Content with Slide Animation */}
        <View
          style={[styles.tabContentWrapper, { backgroundColor: colors.accent }]}
        >
          <Animated.View
            style={[
              styles.tabContentContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* List Tab */}
            <View style={[]}>
              {/* Filters */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
              >
                {FILTERS.map((filter, index) => {
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
                          marginRight: index === FILTERS.length - 1 ? 8 : 0,
                        },
                      ]}
                      onPress={() => selectFilter(filter.id)}
                    >
                      <Icon
                        size={18}
                        color={filterColor}
                        weight={isActive ? "fill" : "regular"}
                      />
                      <Text
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

              {/* Anime List */}
              {isLoadingAnime ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : animeList.length > 0 ? (
                <View style={styles.animeGridContainer}>
                  {animeList.map((item, index) => {
                    const anime = item.anime;
                    return (
                      <TouchableOpacity
                        key={anime?.slug || index}
                        style={styles.animeGridItem}
                        onPress={() => {
                          if (anime?.image) prefetchBloomImage(anime.image);
                          navigation.navigate("HiddenStack", {
                            screen: "AnimePreview",
                            params: { anime },
                          });
                        }}
                      >
                        <Image
                          uri={anime?.image}
                          style={{
                            borderRadius: 16,
                            height: SCREEN_HEIGHT * 0.22,
                            width: SCREEN_WIDTH * 0.3,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icons.MonitorPlay
                    size={48}
                    color={colors.Text(0.3)}
                    weight="regular"
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
                    ]}
                  >
                    Список порожній
                  </Text>
                </View>
              )}
            </View>

            {/* Favorites Tab */}
            <View style={styles.emptyState}>
              <Icons.Heart size={48} color={colors.Text(0.3)} />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
                ]}
              >
                Улюблені аніме
              </Text>
            </View>

            {/* Friends Tab */}
            <View style={styles.emptyState}>
              <Icons.Users
                size={48}
                color={colors.Text(0.3)}
                weight="regular"
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
                ]}
              >
                Ваші друзі
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
      <View style={{ width: "100%", paddingBottom: insets.bottom + 40 }} />
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
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
    gap: 6,
  },
  statItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
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
    justifyContent: "space-evenly",
    marginTop: 20,
    marginHorizontal: 20,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 8,
    gap: 5,
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
  contentArea: {
    flex: 1,
    minHeight: 200,
    marginTop: 16,
  },
  tabContentWrapper: {
    overflow: "hidden",
    flex: 1,
    width: "100%",
    height: "100%",
  },
  tabContentContainer: {
    flexDirection: "row",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyStateText: {
    fontFamily: "Nunito-Regular",
    textAlign: "center",
  },
  animeGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
  },
  animeGridItem: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});
