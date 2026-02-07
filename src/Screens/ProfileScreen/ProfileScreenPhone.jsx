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

import {
  AnimatedTabButton,
  ProfileAvatar,
  ProfileStats,
  FilterChips,
  AnimeGrid,
  NotAuthenticatedView,
  TABS,
  FILTERS,
  FAVORITES_FILTERS,
  SCREEN_WIDTH,
} from "../../Components/Profile";

export default function ProfileScreen({ navigation }) {
  const colors = useThemeColors();
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

  // Dynamic height for tabs
  const [listTabHeight, setListTabHeight] = useState(300);
  const [favoritesTabHeight, setFavoritesTabHeight] = useState(300);

  // Username edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeTabIndex = TABS.findIndex((tab) => tab.id === activeTab);
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
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -activeTabIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [activeTabIndex]);

  const { user, stats, favorites, isLoading, isAuthenticated, refetch } =
    useHikkaUser();

  const handleUpdateUsername = useCallback(async () => {
    const trimmedUsername = newUsername.trim();

    if (!trimmedUsername) {
      showSnackbar("Введіть нове ім'я користувача");
      return;
    }

    // Валідація за паттерном API: ^[A-Za-z][A-Za-z0-9_]{4,63}$
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

  // Перезавантаження даних при поверненні на екран
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAnimeList();
      fetchFavoritesList();
    });

    return unsubscribe;
  }, [navigation, fetchAnimeList, fetchFavoritesList]);

  // Завантаження списку аніме при зміні фільтра
  useEffect(() => {
    fetchAnimeList();
  }, [fetchAnimeList]);

  // Завантаження улюблених аніме при зміні фільтра
  useEffect(() => {
    fetchFavoritesList();
  }, [fetchFavoritesList]);

  const displayName = user?.username || "Користувач AniUa";
  const handle = user?.username ? `@${user.username}` : "@aniua_user";

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
        {/* Header */}
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
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
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
              { backgroundColor: colors.subtle, width: 48 },
            ]}
          >
            <Icons.Pencil size={18} color={colors.primary} weight="fill" />
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
          stats={stats}
          favorites={favorites}
          colors={colors}
          type={"phone"}
        />

        {/* Tabs */}
        <View
          style={[styles.tabsContainer, { borderBottomColor: colors.subtle }]}
        >
          {TABS.map((tab) => (
            <AnimatedTabButton
              orientation="horizontal"
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
          style={[
            styles.tabContentWrapper,
            {
              backgroundColor: colors.accent,
              height: Math.max(
                activeTab === "list" ? listTabHeight : favoritesTabHeight,
                300,
              ),
            },
          ]}
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
            <View
              style={{ width: SCREEN_WIDTH }}
              onLayout={(e) => setListTabHeight(e.nativeEvent.layout.height)}
            >
              <View>
                <FilterChips
                  filters={FILTERS}
                  activeFilter={activeFilter}
                  onFilterSelect={setActiveFilter}
                  colors={colors}
                />
              </View>
              <AnimeGrid
                data={animeList}
                isLoading={isLoadingAnime}
                emptyIcon="MonitorPlay"
                emptyText="Список порожній"
                colors={colors}
                navigation={navigation}
                showAnimeDetails={showAnimeDetails}
                getAnimeFromItem={(item) => item.anime}
              />
            </View>

            {/* Favorites Tab */}
            <View
              style={{ width: SCREEN_WIDTH }}
              onLayout={(e) =>
                setFavoritesTabHeight(e.nativeEvent.layout.height)
              }
            >
              <View>
                <FilterChips
                  filters={FAVORITES_FILTERS}
                  activeFilter={activeFavoriteFilter}
                  onFilterSelect={setActiveFavoriteFilter}
                  colors={colors}
                />
              </View>

              <AnimeGrid
                data={favoritesList}
                isLoading={isLoadingFavorites}
                emptyIcon="Heart"
                emptyText="Список порожній"
                colors={colors}
                navigation={navigation}
                showAnimeDetails={showAnimeDetails}
                getAnimeFromItem={(item) => item}
              />
            </View>
          </Animated.View>
        </View>
        <View style={{ width: "100%", paddingBottom: 45 }} />
      </ScrollView>

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
  displayName: {},
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
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
