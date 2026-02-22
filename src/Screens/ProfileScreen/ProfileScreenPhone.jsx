import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import { H4 } from "../../Styles/Fonts";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";
import LoginScreen from "../LoginScreen";
import useProfileScreen from "./useProfileScreen";

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
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "../../Components/Profile";
import { isTablet } from "../../Styles/Responsive";

export default function ProfileScreen({ navigation }) {
  const colors = useThemeColors();
  const profile = useProfileScreen(navigation);

  useEffect(() => {
    Animated.spring(profile.slideAnim, {
      toValue: -profile.activeTabIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [profile.activeTabIndex]);

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
          <TouchableOpacity
            onPress={profile.navigateToSettings}
            style={[styles.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={StyleSheet.absoluteFill}>
          <LoginScreen isCanSkip={false} />
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
            onPress={profile.navigateToSettings}
            style={[styles.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <ProfileAvatar avatarUrl={profile.user?.avatar} colors={colors} />

        {/* Username */}
        <View style={styles.usernameContainer}>
          <Text selectable={true} style={[H4]}>
            {profile.displayName}
          </Text>
          <TouchableOpacity
            onPress={profile.openEditModal}
            style={[
              styles.editButton,
              { backgroundColor: colors.subtle, width: 44 },
            ]}
          >
            <Icons.Pencil size={18} color={colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        <Text
          selectable={true}
          style={[styles.handle, { color: colors.Text(0.5) }]}
        >
          {profile.handle}
        </Text>

        <View
          style={{
            width: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Stats */}
          <ProfileStats
            stats={profile.stats}
            favorites={profile.favorites}
            colors={colors}
            type="phone"
          />
        </View>

        {/* Tabs */}
        <View
          style={[styles.tabsContainer, { borderBottomColor: colors.subtle }]}
        >
          {TABS.map((tab) => (
            <AnimatedTabButton
              orientation="horizontal"
              key={tab.id}
              tab={tab}
              isActive={profile.activeTab === tab.id}
              onPress={() => profile.setActiveTab(tab.id)}
              colors={colors}
            />
          ))}
        </View>

        {/* Tab Content with Slide Animation */}
        <View
          style={[
            styles.tabContentWrapper,
            {
              backgroundColor: colors.accent,
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
            style={[
              styles.tabContentContainer,
              { transform: [{ translateX: profile.slideAnim }] },
            ]}
          >
            {/* List Tab */}
            <View
              style={[
                { minWidth: SCREEN_WIDTH },
                isTablet() && { minHeight: SCREEN_HEIGHT },
              ]}
            >
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
                  cardWidth={
                    isTablet() ? SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.35
                  }
                  numColumns={isTablet() ? 5 : 3}
                />
              </View>
            </View>

            {/* Favorites Tab */}
            <View
              style={[
                { minWidth: SCREEN_WIDTH },
                isTablet() && { minHeight: SCREEN_HEIGHT },
              ]}
            >
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
                  cardWidth={
                    isTablet() ? SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.35
                  }
                  numColumns={isTablet() ? 5 : 3}
                />
              </View>
            </View>
          </Animated.View>
        </View>
        <View style={{ width: "100%", paddingBottom: 45 }} />
      </ScrollView>

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
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
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
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  handle: {
    textAlign: "center",
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
    marginHorizontal: 20,
  },
  tabContentWrapper: {
    overflow: "hidden",
    width: "100%",
  },
  tabContentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
