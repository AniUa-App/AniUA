import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
  TextInput,
  Pressable,
  useWindowDimensions,
} from "react-native";
import SettingsStorage from "../../Storage/SettingsStorage";
import { useFocusEffect } from "@react-navigation/native";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../../Global/useTheme";
import { H4, H6 } from "../../Styles/Fonts";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";
import { useHikkaUser } from "../../Hooks/useHikkaUser";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import { useSnackbar } from "../../Components/Snackbar";
import LoginScreen from "../LoginScreen";
import AnimeCard from "../../Components/AnimeCard";

import {
  AnimatedTabButton,
  ProfileAvatar,
  ProfileStats,
  FilterChips,
  TABS,
  FILTERS,
  FAVORITES_FILTERS,
} from "../../Components/Profile";
import { useIsTabletLandscape } from "../../Styles/Responsive";

export default function ProfileScreenTablet({ navigation }) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const { snackbar, showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("list");
  const [activeFilter, setActiveFilter] = useState("watching");
  const [animeList, setAnimeList] = useState([]);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [activeFavoriteFilter, setActiveFavoriteFilter] = useState("anime");
  const [favoritesList, setFavoritesList] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [showAnimeDetails, setShowAnimeDetails] = useState(
    SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
  );
  const isTabletLandscape = useIsTabletLandscape();

  // Username edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  try {
    useFocusEffect(
      useCallback(() => {
        setShowAnimeDetails(
          SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
        );
      }, []),
    );
  } catch {
    useEffect(() => {
      setShowAnimeDetails(
        SettingsStorage.getParameter("hideAnimeListDetails") !== "true",
      );
    }, []);
  }

  const { user, stats, favorites, isLoading, isAuthenticated, refetch } =
    useHikkaUser();

  const handleUpdateUsername = useCallback(async () => {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      showSnackbar("Введіть нове ім'я користувача");
      return;
    }

    const usernamePattern = /^[A-Za-z][A-Za-z0-9_]{4,63}$/;
    if (!usernamePattern.test(trimmedUsername)) {
      showSnackbar(
        "Нік має починатися з літери, містити 5-64 символи (літери, цифри, _)",
      );
      return;
    }

    if (trimmedUsername === user?.username) {
      setIsEditModalVisible(false);
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await HikkaApiComplete.updateUsername(trimmedUsername);
      await refetch();
      setIsEditModalVisible(false);
      setNewUsername("");
      showSnackbar("Ім'я користувача змінено");
    } catch (error) {
      console.error("Error updating username:", error?.response?.data || error);
      const data = error?.response?.data;
      let errorMessage = "Не вдалося змінити ім'я користувача";

      if (data?.code === "settings:username_cooldown") {
        errorMessage = "Змінювати нік можна раз на годину";
      } else if (data?.code === "settings:username_taken") {
        errorMessage = "Цей нік вже зайнятий";
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.message_en) {
        errorMessage = data.message_en;
      } else if (data?.detail) {
        errorMessage = data.detail;
      }

      showSnackbar(errorMessage);
    } finally {
      setIsUpdatingUsername(false);
    }
  }, [newUsername, user?.username, refetch, showSnackbar]);

  const fetchAnimeList = useCallback(async () => {
    if (!user?.username || !activeFilter) return;

    setIsLoadingAnime(true);
    try {
      const response = await HikkaApiComplete.getUserWatchList(user.username, {
        page: 1,
        size: 50,
        watch_status: activeFilter,
      });
      setAnimeList(response?.list || []);
    } catch (error) {
      console.error("Error fetching anime list:", error);
      setAnimeList([]);
    } finally {
      setIsLoadingAnime(false);
    }
  }, [user?.username, activeFilter]);

  const fetchFavoritesList = useCallback(async () => {
    if (!user?.username || !activeFavoriteFilter) return;

    setIsLoadingFavorites(true);
    try {
      const response = await HikkaApiComplete.getUserFavorites(
        activeFavoriteFilter,
        user.username,
        {
          page: 1,
          size: 50,
        },
      );
      setFavoritesList(response?.list || []);
    } catch (error) {
      console.error("Error fetching favorites list:", error);
      setFavoritesList([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [user?.username, activeFavoriteFilter]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor("transparent");
      StatusBar.setBarStyle("light-content");
    }, []),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAnimeList();
      fetchFavoritesList();
    });

    return unsubscribe;
  }, [navigation, fetchAnimeList, fetchFavoritesList]);

  useEffect(() => {
    fetchAnimeList();
  }, [fetchAnimeList]);

  useEffect(() => {
    fetchFavoritesList();
  }, [fetchFavoritesList]);

  const displayName = user?.username || "Користувач AniUa";
  const handle = user?.username ? `@${user.username}` : "@aniua_user";

  // Current data based on active tab
  const currentData = activeTab === "list" ? animeList : favoritesList;
  const currentLoading =
    activeTab === "list" ? isLoadingAnime : isLoadingFavorites;
  const getAnimeFromItem =
    activeTab === "list" ? (item) => item.anime : (item) => item;

  if (isLoading) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DefaultScreenWidget>
    );
  }

  if (!isAuthenticated) {
    return (
      <DefaultScreenWidget isNavBarPadding={true}>
        <View style={[styles.header, { zIndex: 1 }]}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("HiddenStack", {
                screen: "SettingsScreen",
              })
            }
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

  // Render anime grid content
  const renderAnimeGrid = () => {
    if (currentLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (currentData.length === 0) {
      const emptyIcon = activeTab === "list" ? "MonitorPlay" : "Heart";
      const EmptyIcon = Icons[emptyIcon];
      return (
        <View style={styles.emptyState}>
          <EmptyIcon size={48} color={colors.Text(0.3)} weight="regular" />
          <Text
            selectable={true}
            style={[H6, styles.emptyStateText, { color: colors.Text(0.5) }]}
          >
            Список порожній
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.animeGridContainer}>
        {currentData.map((item, index) => {
          const anime = getAnimeFromItem(item);
          return (
            <View key={anime?.slug || index} style={styles.animeGridItem}>
              <AnimeCard
                anime={anime}
                width={140}
                showDetails={showAnimeDetails}
                navigation={navigation}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View style={styles.container}>
        {/* Sidebar */}
        <View style={[styles.sidebar]}>
          {/* Settings button */}
          <View style={[styles.sidebarHeader]}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("HiddenStack", {
                  screen: "SettingsScreen",
                })
              }
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
            >
              <Icons.GearSix size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <ProfileAvatar avatarUrl={user?.avatar} colors={colors} />

          {/* Username */}
          <View style={styles.usernameContainer}>
            <Text selectable={true} style={[H4]}>
              {displayName}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setNewUsername(user?.username || "");
                setIsEditModalVisible(true);
              }}
              style={[
                styles.editButton,
                { backgroundColor: colors.background },
              ]}
            >
              <Icons.Pencil size={16} color={colors.primary} weight="fill" />
            </TouchableOpacity>
          </View>

          <Text
            selectable={true}
            style={[styles.handle, { color: colors.Text(0.5) }]}
          >
            {handle}
          </Text>

          {/* Stats */}
          <ProfileStats
            type={"tablet"}
            stats={stats}
            favorites={favorites}
            colors={colors}
          />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Filters */}
          <FilterChips
            filters={activeTab === "list" ? FILTERS : FAVORITES_FILTERS}
            activeFilter={
              activeTab === "list" ? activeFilter : activeFavoriteFilter
            }
            onFilterSelect={
              activeTab === "list" ? setActiveFilter : setActiveFavoriteFilter
            }
            colors={colors}
          />

          {/* Anime Grid */}
          {renderAnimeGrid()}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Username Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsEditModalVisible(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              selectable={true}
              style={[H4, styles.modalTitle, { color: colors.text }]}
            >
              Змінити ім'я користувача
            </Text>

            <View
              style={[
                styles.modalInputContainer,
                { backgroundColor: colors.accent },
              ]}
            >
              <TextInput
                style={[H4, styles.modalInput, { color: colors.text }]}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Нове ім'я користувача"
                placeholderTextColor={colors.inActiveText}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isUpdatingUsername}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
                disabled={isUpdatingUsername}
              >
                <Text selectable={true} style={[H4, { color: colors.text }]}>
                  Скасувати
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateUsername}
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                disabled={isUpdatingUsername}
              >
                {isUpdatingUsername ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text selectable={true} style={[H4, { color: "#fff" }]}>
                    Зберегти
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {snackbar}
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 8,
  },
  // Sidebar
  sidebar: {
    paddingTop: 40,
    paddingHorizontal: 16,
    width: "40%",
    paddingBottom: 100,
  },

  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
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
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    textAlign: "center",
    marginTop: 2,
  },
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 40,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
    marginHorizontal: 20,
  },
  // Anime Grid
  emptyState: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 8,
  },
  animeGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 12,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  animeGridItem: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  modalInputContainer: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  modalInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
