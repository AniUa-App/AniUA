import { useState, useCallback, useRef, useEffect } from "react";
import { StatusBar, Animated } from "react-native";
import SettingsStorage from "../../Storage/SettingsStorage";
import { useFocusEffect } from "@react-navigation/native";
import { useHikkaUser } from "../../Hooks/useHikkaUser";
import { HikkaApiComplete } from "../../Sources/HikkaApiComplete";
import { useSnackbar } from "../../Components/Snackbar";
import { TABS } from "../../Components/Profile";

export default function useProfileScreen(navigation) {
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

  const openEditModal = useCallback(() => {
    setNewUsername(user?.username || "");
    setIsEditModalVisible(true);
  }, [user?.username]);

  const closeEditModal = useCallback(() => {
    setIsEditModalVisible(false);
  }, []);

  const navigateToSettings = useCallback(() => {
    navigation.navigate("HiddenStack", { screen: "SettingsScreen" });
  }, [navigation]);

  return {
    // State
    activeTab,
    setActiveTab,
    activeFilter,
    setActiveFilter,
    activeFavoriteFilter,
    setActiveFavoriteFilter,
    animeList,
    favoritesList,
    isLoadingAnime,
    isLoadingFavorites,
    showAnimeDetails,
    listTabHeight,
    setListTabHeight,
    favoritesTabHeight,
    setFavoritesTabHeight,
    slideAnim,
    activeTabIndex,

    // Modal
    isEditModalVisible,
    newUsername,
    setNewUsername,
    isUpdatingUsername,
    handleUpdateUsername,
    openEditModal,
    closeEditModal,

    // User
    user,
    stats,
    favorites,
    isLoading,
    isAuthenticated,
    displayName,
    handle,

    // UI
    snackbar,
    navigateToSettings,
  };
}
