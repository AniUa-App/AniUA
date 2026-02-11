import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import { H4 } from "../../Styles/Fonts";
import Icons from "../../Styles/Icons";
import LoginScreen from "../LoginScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useProfileScreen from "./useProfileScreen";
import { TVButton } from "../../Components/TV";
import { TV } from "../../Styles/TVStyles";

import {
  AnimatedTabButton,
  ProfileAvatar,
  ProfileStats,
  FilterChips,
  AnimeGrid,
  UsernameEditModal,
  TABS,
  FILTERS,
  FAVORITES_FILTERS,
} from "../../Components/Profile";

export default function ProfileScreenTV({ navigation }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const profile = useProfileScreen(navigation);

  useEffect(() => {
    const targetY = profile.activeTabIndex === 0 ? 0 : -profile.listTabHeight;
    Animated.spring(profile.slideAnim, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [profile.activeTabIndex, profile.listTabHeight]);

  if (profile.isLoading) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!profile.isAuthenticated) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={[styles.header, { zIndex: 1 }]}>
          <TVButton
            onPress={profile.navigateToSettings}
            style={[styles.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={36} color={colors.primary} />
          </TVButton>
        </View>
        <View style={StyleSheet.absoluteFill}>
          <LoginScreen isCanSkip={false} />
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View style={styles.container}>
        {/* Sidebar - Profile info */}
        <ScrollView
          style={styles.sidebar}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Settings button */}
          <View style={styles.sidebarHeader}>
            <TVButton
              onPress={profile.navigateToSettings}
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
            >
              <Icons.GearSix size={32} color={colors.primary} />
            </TVButton>
          </View>
          <View style={{ left: 32, paddingTop: "5%" }}>
            {/* Avatar */}
            <ProfileAvatar avatarUrl={profile.user?.avatar} colors={colors} />

            {/* Username */}
            <View style={styles.usernameContainer}>
              <Text selectable={true} style={[H4, { fontSize: 22 }]}>
                {profile.displayName}
              </Text>
              <TVButton
                onPress={profile.openEditModal}
                style={[styles.editButton, { backgroundColor: colors.accent }]}
              >
                <Icons.Pencil size={18} color={colors.primary} weight="fill" />
              </TVButton>
            </View>

            <Text
              selectable={true}
              style={[styles.handle, { color: colors.Text(0.5), fontSize: 16 }]}
            >
              {profile.handle}
            </Text>
          </View>

          {/* Stats */}
          <ProfileStats
            type="tablet"
            stats={profile.stats}
            favorites={profile.favorites}
            colors={colors}
          />
          <View style={{ height: insets.bottom + 64 }} />
        </ScrollView>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TVButton
              key={tab.id}
              style={[
                styles.tabButton,
                profile.activeTab === tab.id && {
                  backgroundColor: colors.Primary(0.15),
                },
              ]}
              onPress={() => profile.setActiveTab(tab.id)}
              hasTVPreferredFocus={profile.activeTab === tab.id}
            >
              <AnimatedTabButton
                tab={tab}
                isActive={profile.activeTab === tab.id}
                onPress={() => profile.setActiveTab(tab.id)}
                colors={colors}
                orientation="vertical"
              />
            </TVButton>
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={[styles.content, { backgroundColor: colors.accent }]}
          contentContainerStyle={{ paddingTop: insets.top }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.tabContentWrapper,
              {
                height: Math.max(
                  profile.activeTab === "list"
                    ? profile.listTabHeight
                    : profile.favoritesTabHeight,
                  300
                ),
              },
            ]}
          >
            <Animated.View
              style={{ transform: [{ translateY: profile.slideAnim }] }}
            >
              {/* List Tab */}
              <View
                onLayout={(e) =>
                  profile.setListTabHeight(e.nativeEvent.layout.height)
                }
              >
                <FilterChips
                  filters={FILTERS}
                  activeFilter={profile.activeFilter}
                  onFilterSelect={profile.setActiveFilter}
                  colors={colors}
                />
                <AnimeGrid
                  data={profile.animeList}
                  isLoading={profile.isLoadingAnime}
                  emptyIcon="MonitorPlay"
                  emptyText="Список порожній"
                  colors={colors}
                  navigation={navigation}
                  showAnimeDetails={profile.showAnimeDetails}
                  getAnimeFromItem={(item) => item.anime}
                  numColumns={6}
                  cardWidth={160}
                />
              </View>

              {/* Favorites Tab */}
              <View
                onLayout={(e) =>
                  profile.setFavoritesTabHeight(e.nativeEvent.layout.height)
                }
              >
                <FilterChips
                  filters={FAVORITES_FILTERS}
                  activeFilter={profile.activeFavoriteFilter}
                  onFilterSelect={profile.setActiveFavoriteFilter}
                  colors={colors}
                />
                <AnimeGrid
                  data={profile.favoritesList}
                  isLoading={profile.isLoadingFavorites}
                  emptyIcon="Heart"
                  emptyText="Список порожній"
                  colors={colors}
                  navigation={navigation}
                  showAnimeDetails={profile.showAnimeDetails}
                  getAnimeFromItem={(item) => item}
                  numColumns={6}
                  cardWidth={160}
                />
              </View>
            </Animated.View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      <UsernameEditModal
        visible={profile.isEditModalVisible}
        onClose={profile.closeEditModal}
        username={profile.newUsername}
        onChangeUsername={profile.setNewUsername}
        onSubmit={profile.handleUpdateUsername}
        isUpdating={profile.isUpdatingUsername}
        colors={colors}
      />
      {profile.snackbar}
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: TV.padding.screen,
    paddingTop: 50,
    paddingBottom: 8,
  },
  sidebar: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 100,
    maxWidth: "25%",
    flexDirection: "column",
  },
  sidebarHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  usernameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  editButton: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    textAlign: "center",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
    gap: 16,
    top: "4%",
    paddingHorizontal: 8,
  },
  tabButton: {
    borderRadius: TV.button.borderRadius,
    minHeight: TV.button.minHeight,
  },
  tabContentWrapper: {
    overflow: "hidden",
    width: "100%",
  },
});
