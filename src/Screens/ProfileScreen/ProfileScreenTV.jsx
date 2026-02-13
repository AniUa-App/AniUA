import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TVFocusGuideView as RNTVFocusGuideView,
} from "react-native";

const TVFocusGuideView = RNTVFocusGuideView || View;
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
        <View style={StyleSheet.absoluteFill}>
          <LoginScreen isCanSkip={false} />
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <TVFocusGuideView style={styles.container} autoFocus>
        {/* Sidebar - Profile info */}
        <View style={styles.sidebar} focusable={false}>
          <View style={{ left: 16, paddingTop: "20%" }} focusable={false}>
            {/* Avatar */}
            <ProfileAvatar avatarUrl={profile.user?.avatar} colors={colors} />

            {/* Username */}
            <View style={styles.usernameContainer} focusable={false}>
              <Text style={[H4, { fontSize: 16 }]}>{profile.displayName}</Text>
              <TVButton
                onPress={profile.openEditModal}
                style={[styles.editButton, { backgroundColor: colors.accent }]}
              >
                <Icons.Pencil size={14} color={colors.primary} weight="fill" />
              </TVButton>
            </View>

            <Text
              style={[styles.handle, { color: colors.Text(0.5), fontSize: 12 }]}
            >
              {profile.handle}
            </Text>
          </View>

          {/* Stats */}
          <ProfileStats
            type="tv"
            stats={profile.stats}
            favorites={profile.favorites}
            colors={colors}
          />
        </View>

        {/* Tabs */}
        <TVFocusGuideView style={styles.tabsContainer} autoFocus>
          {TABS.map((tab) => (
            <TVButton
              key={tab.id}
              style={[styles.tabButton, profile.activeTab === tab.id && {}]}
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
        </TVFocusGuideView>

        {/* Content */}
        <ScrollView
          style={[styles.content, { backgroundColor: colors.accent }]}
          contentContainerStyle={{ paddingTop: insets.top }}
          showsVerticalScrollIndicator={false}
          focusable={false}
        >
          {/* List Tab */}
          {profile.activeTab === "list" && (
            <View>
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
                numColumns={3}
                cardWidth={120}
              />
            </View>
          )}

          {/* Favorites Tab */}
          {profile.activeTab === "favorites" && (
            <View>
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
                numColumns={3}
                cardWidth={120}
              />
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </TVFocusGuideView>

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
    paddingTop: 20,
    paddingHorizontal: 8,
    paddingBottom: 40,
    width: "35%",
    flexDirection: "column",
  },
  sidebarHeader: {
    flexDirection: "row",
    marginBottom: 4,
  },

  usernameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  editButton: {
    width: 32,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    textAlign: "center",
    marginTop: 2,
  },
  content: {
    width: "30%",
  },
  tabsContainer: {
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
    gap: 8,
    paddingTop: 16,
  },
  tabButton: {
    borderRadius: 16,
  },
});
