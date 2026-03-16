import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useNotificationsScreenStyles } from "../Styles/components/Screens/NotificationsScreenStyles";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4, H5, H6, H7, useScaleFontSize } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import Header from "../Widgets/HeaderWidget";
import NotificationsStorage from "../Storage/NotificationsStorage";
import { EventBus } from "../Global/EventBus";
import NotificationCard from "../Components/NotificationCard";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SearchCategoryTabsComponent from "../Components/SearchCategoryTabsComponent";

const NOTIFICATION_CATEGORIES = [
  { id: "anime", label: "Аніме", icon: "MonitorPlay" },
];

/**
 * Порожній стан екрану сповіщень
 */
function EmptyNotifications({ colors, scaleFontSize }) {
  const s = useNotificationsScreenStyles();
  return (
    <View style={s.emptyContainer}>
      <Icons.BellSlash size={64} color={colors.Text(0.3)} />
      <Text selectable={true} style={H3}>
        Немає сповіщень
      </Text>
      <Text
        selectable={true}
        style={[
          H5,
          {
            textAlign: "center",
            paddingHorizontal: 40,
            opacity: 0.7,
          },
        ]}
      >
        Сповіщення про нові епізоди з&apos;являтимуться тут
      </Text>
    </View>
  );
}

/**
 * Екран сповіщень
 * Відображає список push-сповіщень з можливістю навігації до аніме
 */
export default function NotificationsScreen({ navigation }) {
  const colors = useThemeColors();
  const s = useNotificationsScreenStyles();
  const scaleFontSize = useScaleFontSize();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("anime");

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  // Фільтруємо сповіщення за категорією (поки всі - аніме)
  const filteredNotifications = useMemo(() => {
    if (activeCategory === "anime") {
      return notifications.filter((n) => n.data?.slug);
    }
    return notifications;
  }, [notifications, activeCategory]);

  /**
   * Завантажує сповіщення зі сховища
   */
  const loadNotifications = useCallback(() => {
    const stored = NotificationsStorage.getNotifications();
    setNotifications(stored);
  }, []);

  // Завантажуємо при фокусі на екран
  useFocusEffect(
    useCallback(() => {
      loadNotifications();

      // Позначаємо всі як прочитані при виході з екрану
      return () => {
        NotificationsStorage.markAllAsRead();
        EventBus.emit("notificationRead");
      };
    }, [loadNotifications])
  );

  // Слухаємо нові сповіщення
  useEffect(() => {
    const unsubscribe = EventBus.on("notificationReceived", () => {
      loadNotifications();
    });
    return unsubscribe;
  }, [loadNotifications]);

  /**
   * Обробляє натискання на сповіщення
   */
  const handleNotificationPress = useCallback(
    (item) => {
      // Позначаємо як прочитане
      NotificationsStorage.markAsRead(item.id);

      // Оновлюємо локальний стан
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );

      // Навігація до аніме якщо є slug
      if (item.data?.slug) {
        navigation.navigate("HiddenStack", {
          screen: "AnimePreview",
          params: { slug: item.data.slug },
        });
      }
    },
    [navigation]
  );

  /**
   * Видаляє сповіщення
   */
  const handleDelete = useCallback((id) => {
    NotificationsStorage.removeNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Оновлює список (pull-to-refresh)
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadNotifications();
    setIsRefreshing(false);
  }, [loadNotifications]);

  /**
   * Очищує всі сповіщення
   */
  const handleClearAll = useCallback(() => {
    NotificationsStorage.clearAll();
    setNotifications([]);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <NotificationCard
        item={item}
        onPress={handleNotificationPress}
        onDelete={handleDelete}
        navigation={navigation}
      />
    ),
    [handleNotificationPress, handleDelete, navigation]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <DefaultScreenWidget style={[s.container]}>
      <Header navigation={navigation} title="Сповіщення" isArrow={true} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <SearchCategoryTabsComponent
          categories={NOTIFICATION_CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {filteredNotifications.length > 0 && (
          <TouchableOpacity
            style={[s.clearButton, { backgroundColor: colors.accent }]}
            onPress={handleClearAll}
          >
            <Icons.Trash size={28} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          s.listContent,
          {
            paddingBottom: insets.bottom + 20,
            backgroundColor: colors.accent,
            height: "100%",
          },
          filteredNotifications.length === 0 && s.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyNotifications colors={colors} scaleFontSize={scaleFontSize} />
        }
      />
    </DefaultScreenWidget>
  );
}

