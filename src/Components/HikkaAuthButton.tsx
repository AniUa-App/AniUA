import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { useThemeColors } from "../Global/useTheme";
import { useHikkaAuthButtonStyles } from "../Styles/components/HikkaAuthButtonStyles";

interface HikkaAuthButtonProps {
  onAuthSuccess?: (user: any) => void;
  onAuthError?: (error: string) => void;
  style?: any;
  scopes?: string[];
}

/**
 * Компонент кнопки авторизації через Hikka OAuth
 * Відображає різні стани: авторизований/неавторизований/завантаження
 */
export const HikkaAuthButton: React.FC<HikkaAuthButtonProps> = ({
  onAuthSuccess,
  onAuthError,
  style,
  scopes,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const theme = useThemeColors();
  const s = useHikkaAuthButtonStyles(isAuthenticated);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authenticated = HikkaAuthService.isAuthenticated();
    const userData = HikkaAuthService.getCurrentUser();
    setIsAuthenticated(authenticated);
    setUser(userData);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      const result = await HikkaAuthService.startOAuth(scopes);

      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user);
        onAuthSuccess?.(result.user);

        Alert.alert(
          "Успішна авторизація",
          `Вітаємо, ${result.user?.username || "користувач"}!`,
          [{ text: "OK" }],
        );
      } else {
        onAuthError?.(result.error || "Помилка авторизації");
        Alert.alert("Помилка", result.error || "Не вдалося авторизуватися", [
          { text: "OK" },
        ]);
      }
    } catch (error: any) {
      onAuthError?.(error.message);
      Alert.alert("Помилка", error.message || "Невідома помилка", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Вихід", "Ви впевнені що хочете вийти з акаунту Hikka?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Вийти",
        style: "destructive",
        onPress: () => {
          HikkaAuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[s.button, s.buttonDisabled, style]}>
        <ActivityIndicator color={theme.text} size="small" />
        <Text selectable={true} style={[s.buttonText, { marginLeft: 8 }]}>
          Авторизація...
        </Text>
      </View>
    );
  }

  if (isAuthenticated && user) {
    return (
      <TouchableOpacity
        style={[s.button, style]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={s.userInfo}>
          <Text selectable={true} style={s.username}>
            @{user.username}
          </Text>
          <Text selectable={true} style={s.buttonText}>
            Вийти
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[s.button, style]}
      onPress={handleLogin}
      activeOpacity={0.7}
    >
      <Text selectable={true} style={s.buttonText}>
        Увійти через Hikka
      </Text>
    </TouchableOpacity>
  );
};
