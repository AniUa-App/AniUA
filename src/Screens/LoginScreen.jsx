import React from "react";
import { View, Text, Image } from "react-native";
import { useLoginScreenStyles } from "../Styles/components/Screens/LoginScreenStyles";
import { TouchableOpacity } from "../Widgets/Button";
import { useThemeColors } from "../Global/useTheme";
import { H2, H5, H6 } from "../Styles/Fonts";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { useNavigation } from "@react-navigation/native";
import Logger from "../Logger/Logger";
import Icons from "../Styles/Icons";
import SettingsStorage from "../Storage/SettingsStorage";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import { themes } from "../Styles/Colors";
import { EventBus } from "../Global/EventBus";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { isTV, isTablet, isTabletLandscape } from "../Styles/Responsive";

export default function LoginScreen({ isCanSkip = true }) {
  const isWideLayout = isTV() || isTabletLandscape();
  const themeColors = useThemeColors();
  const s = useLoginScreenStyles();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [selectedTheme, setSelectedTheme] = React.useState("greenApple");

  const themeOptions = [
    { key: "greenApple", label: "Зелене яблуко", colors: themes.greenApple },
    { key: "orange_dark", label: "Помаранч темна", colors: themes.orange_dark },
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
          result.error || "Помилка авторизації. Спробуйте ще раз.",
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
    <DefaultScreenWidget isNavBarPadding={!isTV()}>
      <View style={[s.container, isWideLayout && s.containerWide]}>
        {/* Верхня частина: логотип зліва + контент справа (wide) або стовпчик (phone) */}
        <View
          style={[s.mainContent, isWideLayout && s.mainContentWide]}
        >
          {/* Логотип */}
          {(isCanSkip && (isTV() || isTablet())) || !isTV() ? (
            <View
              style={[
                s.logoContainer,
                { top: isCanSkip && (!isTV() || !isTablet()) ? "25%" : "15%" },
                isWideLayout && s.logoContainerWide,
              ]}
            >
              <Image
                source={require("../../assets/AniUA-Logo-Icon.png")}
                style={[s.logo, isWideLayout && s.logoWide]}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={{ width: "30%" }} />
          )}
          {/* Контент: заголовок + кнопки */}
          <View
            style={[
              { gap: 8 },
              !isWideLayout && {
                position: "absolute",
                bottom: isCanSkip ? "5%" : "28%",
              },
              isWideLayout && s.contentWide,
            ]}
          >
            {/* Заголовок */}
            <Text
              selectable={true}
              style={[H2, s.title, { color: themeColors.text }]}
            >
              Вітаємо в AniUA
            </Text>

            {/* Підзаголовок */}
            <Text
              selectable={true}
              style={[H6, s.subtitle, { color: themeColors.inActiveText }]}
            >
              Увійдіть в аккаунт, щоб зберігати та синхронізувати ваш прогрес.
            </Text>

            {/* Кнопки */}
            <View style={s.buttonsContainer}>
              <TouchableOpacity
                style={[
                  s.button,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text selectable={true} style={[H5, s.loginButtonText]}>
                  {isLoading ? "Завантаження..." : "Увійти"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.button,
                  s.qrButton,
                  { borderColor: themeColors.primary },
                ]}
                onPress={() => navigation.navigate("QRLogin")}
                disabled={isLoading}
              >
                <View style={s.qrButtonContent}>
                  <Icons.QrCode size={22} color={themeColors.primary} />
                  <Text
                    selectable={true}
                    style={[
                      H5,
                      s.qrButtonText,
                      { color: themeColors.primary },
                    ]}
                  >
                    Увійти по QR-коду
                  </Text>
                </View>
              </TouchableOpacity>
              {isCanSkip && (
                <TouchableOpacity
                  style={[s.button, s.skipButton]}
                  onPress={handleSkip}
                  disabled={isLoading}
                >
                  <Text
                    selectable={true}
                    style={[
                      H5,
                      s.skipButtonText,
                      { color: themeColors.inActiveText },
                    ]}
                  >
                    Пропустити
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Вибір теми — завжди внизу */}
        {isCanSkip && (
          <View
            style={[
              s.themeOptionsContainer,
              isWideLayout && s.themeOptionsContainerWide,
            ]}
          >
            {themeOptions.map((theme) => (
              <TouchableOpacity
                key={theme.key}
                style={[
                  s.themeOption,
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
                    s.themePrimaryDot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </DefaultScreenWidget>
  );
}

