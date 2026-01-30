import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { useThemeColors } from "../Global/useTheme";
import { H2, H5, H6 } from "../Styles/Fonts";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { useNavigation } from "@react-navigation/native";
import Logger from "../Logger/Logger";
import SettingsStorage from "../Storage/SettingsStorage";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { themes } from "../Styles/Colors";
import { EventBus } from "../Global/EventBus";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";

export default function LoginScreen({ isCanSkip = true }) {
  const themeColors = useThemeColors();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [selectedTheme, setSelectedTheme] = React.useState("greenApple");

  const themeOptions = [
    { key: "greenApple", label: "Зелене яблуко", colors: themes.greenApple },
    { key: "orange_dark", label: "Помаранч темна", colors: themes.orange_dark },
    {
      key: "orange_white",
      label: "Помаранч світла",
      colors: themes.orange_white,
    },
  ];

  const handleThemeSelect = (themeKey) => {
    setSelectedTheme(themeKey);
    const selectedColors = themes[themeKey];
    const userConfig = SettingsStorage.getParameter("userConfig") || {};
    SettingsStorage.setParameter("userConfig", {
      ...userConfig,
      colors: {
        ...selectedColors,
        isCustomisation: true,
        themeName: themeKey,
      },
    });
    EventBus.emit("userConfig");
  };
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      Logger.debug("LoginScreen", "Початок авторизації");

      const result = await HikkaAuthService.startOAuth();

      Logger.debug("LoginScreen", "OAuth результат", result);

      if (result.success) {
        Logger.info("LoginScreen", "Авторизація успішна");
        // Зберігаємо, що користувач пройшов онбордінг
        SettingsStorage.setParameter("hasCompletedOnboarding", true);
        // Ініціалізуємо дефолтні списки та вмикаємо персональні рекомендації
        PersonalRecListStorage.initializeDefaultLists();
        const userConfig = SettingsStorage.getParameter("userConfig") || {};
        SettingsStorage.setParameter("userConfig", {
          ...userConfig,
          recommendations: {
            ...userConfig.recommendations,
            isCustomedPersonalRecommendations: true,
            isDefaultBigBanner: true,
          },
        });
        // Переходимо на головний екран
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      } else {
        Logger.warn("LoginScreen", "Авторизація не вдалася", result.error);
        setErrorMessage(
          result.error || "Помилка авторизації. Спробуйте ще раз."
        );
      }
    } catch (error) {
      Logger.error("LoginScreen", "Помилка при авторізації", error);
      setErrorMessage("Помилка з'єднання. Перевірте налаштування.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Logger.debug("LoginScreen", "Користувач пропустив авторизацію");
    // Зберігаємо, що користувач пройшов онбордінг
    SettingsStorage.setParameter("hasCompletedOnboarding", true);
    // Ініціалізуємо дефолтні списки та вмикаємо персональні рекомендації
    PersonalRecListStorage.initializeDefaultLists();
    const userConfig = SettingsStorage.getParameter("userConfig") || {};
    SettingsStorage.setParameter("userConfig", {
      ...userConfig,
      recommendations: {
        ...userConfig.recommendations,
        isCustomedPersonalRecommendations: true,
        isDefaultBigBanner: true,
      },
    });
    // Переходимо на головний екран
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  return (
    <DefaultScreenWidget>
      <View style={[styles.container, {}]}>
        {/* Логотип */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/AniUA-Logo-Icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View
          style={{
            position: "absolute",
            bottom: isCanSkip ? "5%" : "28%",
            gap: 8,
          }}
        >
          {/* Заголовок */}
          <Text
            selectable={true}
            style={[H2, styles.title, { color: themeColors.text }]}
          >
            Вітаємо в AniUA
          </Text>

          {/* Підзаголовок */}
          <Text
            selectable={true}
            style={[H6, styles.subtitle, { color: themeColors.inActiveText }]}
          >
            Увійдіть в аккаунт, щоб зберігати та синхронізувати ваш прогрес.
          </Text>

          {/* Кнопки */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text selectable={true} style={[H5, styles.loginButtonText]}>
                {isLoading ? "Завантаження..." : "Увійти"}
              </Text>
            </TouchableOpacity>
            {isCanSkip && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.skipButton]}
                  onPress={handleSkip}
                  disabled={isLoading}
                >
                  <Text
                    selectable={true}
                    style={[
                      H5,
                      styles.skipButtonText,
                      { color: themeColors.inActiveText },
                    ]}
                  >
                    Пропустити
                  </Text>
                </TouchableOpacity>
                {/* Вибір теми */}
                <View style={styles.themeOptionsContainer}>
                  {themeOptions.map((theme) => (
                    <TouchableOpacity
                      key={theme.key}
                      style={[
                        styles.themeOption,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor:
                            selectedTheme === theme.key
                              ? theme.colors.primary
                              : theme.colors.subtle,
                          borderWidth: selectedTheme === theme.key ? 3 : 1,
                        },
                      ]}
                      onPress={() => handleThemeSelect(theme.key)}
                    >
                      <View
                        style={[
                          styles.themePrimaryDot,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    position: "absolute",
    top: "20%",
  },
  logo: {
    width: 280,
    height: 280,
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: 32,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 24,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
    paddingTop: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {},
  loginButtonText: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  skipButtonText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 18,
  },
  themeSection: {
    marginTop: 16,
    alignItems: "center",
  },
  themeLabel: {
    marginBottom: 12,
    textAlign: "center",
  },
  themeOptionsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  themeOption: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  themePrimaryDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
