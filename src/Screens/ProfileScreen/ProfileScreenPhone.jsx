import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
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
} from "../../Components/Profile";
import { isTablet } from "../../Styles/Responsive";
import { useProfileScreenPhoneStyles } from "../../Styles/components/Screens/ProfileScreenPhoneStyles";

export default function ProfileScreen({ navigation }) {
  const s = useProfileScreenPhoneStyles();
  const colors = useThemeColors();
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
        <View style={s.header}>
          <TouchableOpacity
            onPress={profile.navigateToSettings}
            style={[s.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={s.loginContainer}>
          <LoginScreen isCanSkip={false} />
        </View>
      </DefaultScreenWidget>
    );
  }

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={profile.navigateToSettings}
            style={[s.iconButton, { backgroundColor: colors.subtle }]}
          >
            <Icons.GearSix size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <ProfileAvatar avatarUrl={profile.user?.avatar} colors={colors} />

        {/* Username */}
        <View style={s.usernameContainer}>
          <Text selectable={true} style={[H4]}>
            {profile.displayName}
          </Text>
          <TouchableOpacity
            onPress={profile.openEditModal}
            style={[
              s.editButton,
              { backgroundColor: colors.subtle, width: 44 },
            ]}
          >
            <Icons.Pencil size={18} color={colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        <Text
          selectable={true}
          style={[s.handle, { color: colors.Text(0.5) }]}
        >
          {profile.handle}
        </Text>

        <View style={s.statsWrapper}>
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
          style={[s.tabsContainer, { borderBottomColor: colors.subtle }]}
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

        {/* Tab Content */}
        <View style={[s.tabContentWrapper, { backgroundColor: colors.accent }]}>
          {/* List Tab */}
          <View style={{ display: profile.activeTab === "list" ? "flex" : "none" }}>
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
              cardWidth={isTablet() ? SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.35}
              numColumns={isTablet() ? 5 : 3}
            />
          </View>

          {/* Favorites Tab */}
          <View style={{ display: profile.activeTab === "favorites" ? "flex" : "none" }}>
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
              cardWidth={isTablet() ? SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.35}
              numColumns={isTablet() ? 5 : 3}
            />
          </View>
        </View>
        <View style={s.bottomSpacer} />
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
