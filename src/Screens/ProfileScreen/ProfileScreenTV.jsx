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
import { useProfileScreenTVStyles } from "../../Styles/components/Screens/ProfileScreenTVStyles";

export default function ProfileScreenTV({ navigation }) {
  const s = useProfileScreenTVStyles();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const profile = useProfileScreen(navigation);

  if (profile.isLoading) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={s.loadingContainer}>
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
      <TVFocusGuideView style={s.container} autoFocus>
        {/* Sidebar - Profile info */}
        <View style={s.sidebar} focusable={false}>
          <View style={{ left: 16, paddingTop: "20%" }} focusable={false}>
            {/* Avatar */}
            <ProfileAvatar avatarUrl={profile.user?.avatar} colors={colors} />

            {/* Username */}
            <View style={s.usernameContainer} focusable={false}>
              <Text style={[H4, { fontSize: 16 }]}>{profile.displayName}</Text>
              <TVButton
                onPress={profile.openEditModal}
                style={[s.editButton, { backgroundColor: colors.accent }]}
              >
                <Icons.Pencil size={14} color={colors.primary} weight="fill" />
              </TVButton>
            </View>

            <Text
              style={[s.handle, { color: colors.Text(0.5), fontSize: 12 }]}
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
        <TVFocusGuideView style={s.tabsContainer} autoFocus>
          {TABS.map((tab) => (
            <TVButton
              key={tab.id}
              style={[s.tabButton, profile.activeTab === tab.id && {}]}
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
          style={[s.content, { backgroundColor: colors.accent }]}
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
