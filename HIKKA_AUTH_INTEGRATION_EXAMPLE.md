# Приклад інтеграції Hikka Auth у Settings Screen

## Варіант 1: Додавання кнопки авторизації в Settings

```jsx
// src/Screens/Settings.jsx

import { HikkaAuthButton } from "../Components/HikkaAuthButton";
import { HikkaAuthService } from "../Services/HikkaAuthService";

export default function SettingsScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Завантажуємо дані користувача при відкритті екрану
    const userData = HikkaAuthService.getCurrentUser();
    setUser(userData);
  }, []);

  // Додайте цей item до SETTINGS_ITEMS масиву
  const SETTINGS_ITEMS = [
    // ... інші items ...
    {
      title: "Акаунт Hikka",
      subtitle: user
        ? `Увійшли як @${user.username}`
        : "Увійдіть для синхронізації",
      iconType: "materialCommunity",
      iconName: user ? "account-check" : "account-plus",
      onPress: () => {
        // Кнопка сама обробляє логіку входу/виходу
        // Просто оновлюємо стан після авторизації
      },
      customComponent: (
        <HikkaAuthButton
          style={{ marginTop: 10 }}
          onAuthSuccess={(user) => {
            setUser(user);
            showNotification(`Вітаємо, ${user.username}!`);
          }}
          onAuthError={(error) => {
            showNotification(`Помилка: ${error}`);
          }}
        />
      )
    },
    // ... інші items ...
  ];

  // Рест коду...
}
```

## Варіант 2: Окремий екран профілю Hikka

Створіть новий екран `/src/Screens/HikkaProfile.jsx`:

```jsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthButton } from "../Components/HikkaAuthButton";
import { useThemeColors } from "../Global/useTheme";
import Header from "../Widgets/HeaderWidget";
import { H3, H5, H6 } from "../Styles/Fonts";

export default function HikkaProfile() {
  const navigation = useNavigation();
  const theme = useThemeColors();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = HikkaAuthService.getCurrentUser();

      if (userData) {
        setUser(userData);

        // Завантажуємо статистику
        const watchStats = await HikkaApiComplete.getWatchStats(userData.username);
        setStats(watchStats);
      }
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!HikkaAuthService.isAuthenticated()) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header title="Профіль Hikka" onBackPress={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={[H3, { color: theme.text, marginBottom: 20, textAlign: "center" }]}>
            Увійдіть в акаунт Hikka
          </Text>
          <Text style={[H6, { color: theme.textSecondary, marginBottom: 30, textAlign: "center" }]}>
            Для доступу до списків, коментарів та інших функцій
          </Text>
          <HikkaAuthButton
            onAuthSuccess={(user) => {
              setUser(user);
              loadUserData();
            }}
          />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Header title="Профіль Hikka" onBackPress={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Профіль Hikka" onBackPress={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Інформація про користувача */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[H3, { color: theme.text, marginBottom: 5 }]}>
            {user?.username}
          </Text>
          <Text style={[H6, { color: theme.textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        {/* Статистика перегляду */}
        {stats && (
          <View style={{ marginBottom: 30 }}>
            <Text style={[H5, { color: theme.text, marginBottom: 15 }]}>
              Статистика
            </Text>

            <View style={{ backgroundColor: theme.card, borderRadius: 12, padding: 15 }}>
              <StatItem
                label="Переглядаю"
                value={stats.watching || 0}
                theme={theme}
              />
              <StatItem
                label="Завершено"
                value={stats.completed || 0}
                theme={theme}
              />
              <StatItem
                label="Заплановано"
                value={stats.planned || 0}
                theme={theme}
              />
              <StatItem
                label="Відкладено"
                value={stats.on_hold || 0}
                theme={theme}
              />
            </View>
          </View>
        )}

        {/* Швидкі дії */}
        <View style={{ marginBottom: 30 }}>
          <Text style={[H5, { color: theme.text, marginBottom: 15 }]}>
            Швидкі дії
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
            }}
            onPress={() => {
              navigation.navigate("WebView", {
                url: `https://hikka.io/u/${user?.username}`,
                title: "Мій профіль на Hikka"
              });
            }}
          >
            <Text style={[H6, { color: theme.text }]}>
              Відкрити профіль на Hikka.io
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
            }}
            onPress={async () => {
              await HikkaAuthService.refreshUserData();
              loadUserData();
            }}
          >
            <Text style={[H6, { color: theme.text }]}>
              Оновити дані профілю
            </Text>
          </TouchableOpacity>
        </View>

        {/* Кнопка виходу */}
        <HikkaAuthButton
          onAuthSuccess={() => {}}
        />
      </ScrollView>
    </View>
  );
}

// Компонент для відображення статистики
function StatItem({ label, value, theme }) {
  return (
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    }}>
      <Text style={[H6, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[H6, { color: theme.text, fontWeight: "bold" }]}>
        {value}
      </Text>
    </View>
  );
}
```

## Варіант 3: Інтеграція в AnimePreview екран

Додайте можливість додавання аніме до списку перегляду з екрану AnimePreview:

```jsx
// src/Screens/AnimePreview.jsx

import { HikkaAuthService } from "../Services/HikkaAuthService";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";

export default function AnimePreview({ route }) {
  const { slug } = route.params;
  const [watchStatus, setWatchStatus] = useState(null);

  useEffect(() => {
    loadWatchStatus();
  }, []);

  const loadWatchStatus = async () => {
    if (!HikkaAuthService.isAuthenticated()) return;

    try {
      const status = await HikkaApiComplete.getWatchEntry(slug);
      setWatchStatus(status);
    } catch (error) {
      console.error("Помилка завантаження статусу:", error);
    }
  };

  const addToWatchList = async (status) => {
    if (!HikkaAuthService.isAuthenticated()) {
      Alert.alert(
        "Потрібна авторизація",
        "Увійдіть в акаунт Hikka для додавання аніме до списку",
        [
          { text: "Скасувати", style: "cancel" },
          {
            text: "Увійти",
            onPress: () => navigation.navigate("HikkaProfile")
          }
        ]
      );
      return;
    }

    try {
      await HikkaApiComplete.addToWatchList(slug, {
        status: status,
        episodes: 0,
      });

      Alert.alert("Успіх", "Додано до списку перегляду");
      loadWatchStatus();
    } catch (error) {
      Alert.alert("Помилка", error.message);
    }
  };

  return (
    <View>
      {/* ... інший контент ... */}

      {/* Кнопки додавання до списку */}
      <View style={{ flexDirection: "row", padding: 15, gap: 10 }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: theme.green, padding: 12, borderRadius: 8 }}
          onPress={() => addToWatchList("watching")}
        >
          <Text style={{ color: theme.text, textAlign: "center" }}>
            Переглядаю
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, backgroundColor: theme.blue, padding: 12, borderRadius: 8 }}
          onPress={() => addToWatchList("planned")}
        >
          <Text style={{ color: theme.text, textAlign: "center" }}>
            Заплановано
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1, backgroundColor: theme.purple, padding: 12, borderRadius: 8 }}
          onPress={() => addToWatchList("completed")}
        >
          <Text style={{ color: theme.text, textAlign: "center" }}>
            Завершено
          </Text>
        </TouchableOpacity>
      </View>

      {watchStatus && (
        <Text style={{ padding: 15, color: theme.textSecondary }}>
          Поточний статус: {watchStatus.status}
        </Text>
      )}
    </View>
  );
}
```

## Варіант 4: Додавання навігації до HikkaProfile

У `ScreenController.jsx` додайте новий екран:

```jsx
// src/Screens/ScreenController/ScreenController.jsx

import HikkaProfile from "../HikkaProfile";

// У HiddenStack додайте:
<Stack.Screen
  name="HikkaProfile"
  component={HikkaProfile}
  options={{
    headerShown: false,
    presentation: "modal",
  }}
/>
```

У Settings екрані додайте навігацію:

```jsx
{
  title: "Акаунт Hikka",
  subtitle: "Синхронізація зі списками Hikka",
  iconType: "materialCommunity",
  iconName: "cloud-sync",
  onPress: () => navigation.navigate("HikkaProfile"),
}
```

---

Оберіть варіант що найкраще підходить для вашого UX!
