import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../Global/useTheme";
import { H5, H7, useScaleFontSize } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import Header from "../Widgets/HeaderWidget";
import NotificationsStorage from "../Storage/NotificationsStorage";
import { EventBus } from "../Global/EventBus";
import NotificationCard from "../Components/NotificationCard";

/**
 * Порожній стан екрану сповіщень
 */
function EmptyNotifications({ colors, scaleFontSize }) {
  return (
    <View style={styles.emptyContainer}>
      <Icons.BellSlash size={64} color={colors.Text(0.3)} />
      <Text
        style={[
          styles.emptyTitle,
          { color: colors.Text(0.6), fontSize: scaleFontSize(H5.fontSize) },
        ]}
      >
        Немає сповіщень
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: colors.Text(0.4), fontSize: scaleFontSize(H7.fontSize) },
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
  const scaleFontSize = useScaleFontSize();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header navigation={navigation} title="Сповіщення" isArrow={true} />

      {notifications.length > 0 && (
        <Pressable
          style={[styles.clearButton, { backgroundColor: colors.Background(0.5) }]}
          onPress={handleClearAll}
        >
          <Icons.Trash size={18} color={colors.Text(0.6)} />
          <Text
            style={[
              styles.clearButtonText,
              { color: colors.Text(0.6), fontSize: scaleFontSize(H7.fontSize) },
            ]}
          >
            Очистити все
          </Text>
        </Pressable>
      )}

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
          notifications.length === 0 && styles.emptyList,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: "Nunito-SemiBold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  clearButton: {
    position: "absolute",
    top: 90,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  clearButtonText: {
    fontFamily: "Nunito-Regular",
    marginLeft: 6,
  },
});
