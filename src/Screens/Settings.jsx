import {
  View,
  ScrollView,
  Linking,
  Text,
  Switch,
  useWindowDimensions,
} from "react-native";
import React, { useState, useCallback, useRef, useMemo } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import SettingsSection from "../Widgets/SettingsSectionWidget";
import Icons from "../Styles/Icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import { useSnackbar } from "../Components/Snackbar";
import MainConfig from "../cfgs/MainConfig";
import * as FileSystem from "expo-file-system/legacy";
import SettingsStorage from "../Storage/SettingsStorage";
import AnimeHashStorage from "../Storage/AnimeHashStorage";
import AnimeStorage from "../Storage/AnimeStorage";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import RatingWidget from "../Widgets/RatingWidget";
import * as Expo from "expo";
import Logger from "../Logger/Logger";
import AniuaApi from "../Api/AniuaApi";
import HikkaAuthStorage from "../Storage/HikkaAuthStorage";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Widgets/Button";
import { H4, H6 } from "../Styles/Fonts";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {
  useIsTablet,
  maxContentWidth,
  horizontalPadding,
  useIsTabletLandscape,
  useIsTV,
} from "../Styles/Responsive";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const { snackbar, showSnackbar, showConfirmSnackbar } = useSnackbar();
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [useBuiltinPlayer, setUseBuiltinPlayer] = useState(
    !!SettingsStorage.getParameter("useBuiltinPlayer"),
  );
  const { width } = useWindowDimensions();
  const isTv = useIsTV();

  // Refs для BottomSheet
  const partnersSheetRef = useRef(null);

  // Перечитуємо налаштування при фокусі на екран
  useFocusEffect(
    useCallback(() => {
      setUseBuiltinPlayer(!!SettingsStorage.getParameter("useBuiltinPlayer"));
    }, []),
  );

  // Список партнерів
  const partnersList = useMemo(() => {
    const partners = Object.values(MainConfig.partners).map((partner) => ({
      title: partner.name,
      url: partner.url,
    }));

    const seenUrls = new Set();
    const partnerStudiosArray = MainConfig.partnerStudios || [];
    const studios = partnerStudiosArray
      .filter((team) => {
        if (!team.telegram) return false;
        if (seenUrls.has(team.telegram)) return false;
        seenUrls.add(team.telegram);
        return true;
      })
      .map((team) => ({
        title: team.name,
        url: team.telegram,
      }));

    return [...partners, ...studios];
  }, []);

  const clearCache = async () => {
    try {
      AnimeHashStorage.clearHash();
      AnimeStorage.clearStorage();
      PersonalRecListStorage.clearStorage();
      if (
        SettingsStorage.getParameter("userConfig.recommendations").length === 0
      ) {
        SettingsStorage.setParameter("userConfig.recommendations", {
          isEnabled: true,
          isDefaultBigBanner: true,
        });
      }
      SettingsStorage.setParameter("isNotFirstLaunch", false);

      const episodesPath = SettingsStorage.getParameter("pathToSaveEpisodes");
      const userConfig = SettingsStorage.getParameter("userConfig");
      const mainScreenConfig = SettingsStorage.getParameter("mainScreenConfig");

      if (episodesPath) {
        const pathExists = await FileSystem.getInfoAsync(episodesPath);
        if (pathExists.exists) {
          await FileSystem.deleteAsync(episodesPath, { idempotent: true });
        }
      }

      if (userConfig) {
        SettingsStorage.setParameter("userConfig", null);
      }

      if (mainScreenConfig) {
        SettingsStorage.setParameter("mainScreenConfig", null);
      }

      showSnackbar("Кеш успішно очищено");
    } catch (error) {
      Logger.warn("Settings", "Помилка очищення кешу", error);
      showSnackbar("Частково очищено кеш");
    }
  };

  const handleBuiltinPlayerToggle = (value) => {
    SettingsStorage.setParameter("useBuiltinPlayer", value);
    setUseBuiltinPlayer(value);
  };

  return (
    <DefaultScreenWidget isCheckInternet={false} isNavBarPadding={true}>
      <RatingWidget
        visible={isRatingVisible}
        onClose={() => setIsRatingVisible(false)}
        onRatingSubmit={async (rating, feedback) => {
          Logger.info("Settings", "Користувач поставив оцінку", { rating });
          Logger.info("Settings", "Користувач залишив відгук", { feedback });
          setIsRatingVisible(false);
          if (!AniuaApi.getAuthHeader()) {
            showSnackbar("Для відправки відгуку потрібно увійти в акаунт");
            return;
          }
          const text = feedback
            ? `Оцінка: ${rating}/5\n${feedback}`
            : `Оцінка: ${rating}/5`;
          const result = await AniuaApi.sendFeedback(text);
          if (result.success) {
            showSnackbar("Дякуємо за відгук!");
          } else {
            showSnackbar(result.error?.message || "Помилка при відправці відгуку");
          }
        }}
      />
      <ScrollView
        style={{ flex: 1, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          isTv
            ? {
                alignSelf: "center",
                width: "90%",
              }
            : useIsTabletLandscape()
              ? {
                  alignSelf: "center",
                  width: "97%",
                }
              : undefined
        }
      >
        {/* Загальні налаштування */}
        <SettingsSection title="Загальні">
          <SettingsItemWidget
            title="Вбудований плеєр"
            subtitle="Використовувати вбудований відеоплеєр"
            icon={<Icons.Play />}
            button={{
              Icon: (
                <Switch
                  value={useBuiltinPlayer}
                  onValueChange={handleBuiltinPlayerToggle}
                  thumbColor={themeColors.primary}
                  trackColor={{
                    false: themeColors.subtle,
                    true: themeColors.Background(0.4),
                  }}
                />
              ),
            }}
          />
          <SettingsItemWidget
            title="Очистити кеш"
            subtitle="Завантажені серії та збережені аніме"
            icon={<Icons.Trash />}
            iconColor={themeColors.redBookmark}
            showChevron
            onPress={() => {
              showConfirmSnackbar(
                "Ви впевнені, що хочете видалити всі кешовані дані?",
                {
                  onConfirm: () => {
                    clearCache();
                    setTimeout(() => {
                      Expo.reloadAppAsync();
                    }, 3000);
                  },
                },
              );
            }}
          />
        </SettingsSection>

        {/* Пристрої — тільки для авторизованих */}
        {HikkaAuthStorage.isAuthenticated() && (
          <SettingsSection title="Пристрої">
            <SettingsItemWidget
              title="Додати пристрій"
              subtitle="Передати авторизацію через QR-код"
              icon={<Icons.QrCode />}
              showChevron
              onPress={() => {
                navigation.navigate("HiddenStack", {
                  screen: "AddDeviceScreen",
                });
              }}
            />
          </SettingsSection>
        )}

        {/* Зовнішній вигляд */}
        <SettingsSection title="Зовнішній вигляд">
          <SettingsItemWidget
            title="Кастомізація"
            subtitle="Налаштування вигляду додатку"
            icon={<Icons.PaintBrush />}
            showChevron
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "CustomisationScreen",
                params: {
                  title: "Кастомізація",
                },
              });
            }}
          />
        </SettingsSection>

        {/* Про додаток */}
        <SettingsSection title="Про додаток">
          <SettingsItemWidget
            title="Інформація"
            subtitle="Версія, хеш та інше"
            icon={<Icons.Info />}
            showChevron
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "AppInfo",
                params: {
                  title: "Інформація про застосунок",
                },
              });
            }}
          />
          <SettingsItemWidget
            title="Партнери"
            subtitle="Студії озвучення та спонсори"
            icon={<Icons.Handshake />}
            showChevron
            onPress={() => partnersSheetRef.current?.present()}
          />
        </SettingsSection>

        {/* Зв'язок */}
        <SettingsSection title="Зв'язок">
          <SettingsItemWidget
            title="Новини"
            subtitle="Telegram канал з оновленнями"
            icon={<Icons.TelegramLogo />}
            iconColor="#0088cc"
            showChevron
            onPress={() => {
              Linking.openURL(MainConfig.urls.telegramChannelUrl);
            }}
          />
          <SettingsItemWidget
            title="Підтримка"
            subtitle="Зворотний зв'язок з розробниками"
            icon={<Icons.ChatCircle />}
            showChevron
            onPress={() => {
              Linking.openURL(MainConfig.urls.supportTelegramBotUrl);
            }}
          />
          <SettingsItemWidget
            title="Веб-сайт"
            subtitle="Офіційний сайт AniUA"
            icon={<Icons.Globe />}
            showChevron
            onPress={() => {
              Linking.openURL(MainConfig.urls.appUrl);
            }}
          />
        </SettingsSection>

        {/* Підтримати проєкт */}
        <SettingsSection title="Підтримати проєкт">
          <SettingsItemWidget
            title="Оцінити застосунок"
            subtitle="Допоможіть нам стати кращими"
            icon={<Icons.Star />}
            iconColor={themeColors.yellow}
            showChevron
            onPress={() => {
              setIsRatingVisible(true);
            }}
          />
          <SettingsItemWidget
            title="Донат"
            subtitle="Підтримати розробку фінансово"
            icon={<Icons.Heart />}
            iconColor={themeColors.redBookmark}
            showChevron
            onPress={() => {
              Linking.openURL(`${MainConfig.urls.donateUrl}?amount=40`);
            }}
          />
        </SettingsSection>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* BottomSheet для партнерів */}
      <BottomSheetModal
        ref={partnersSheetRef}
        snapPoints={["50%"]}
        enableDynamicSizing={false}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: themeColors.subtle }}
        handleIndicatorStyle={{ backgroundColor: themeColors.Background(0.6) }}
        backdropComponent={(props) => (
          <TouchableOpacity
            {...props}
            onPress={() => partnersSheetRef.current?.close()}
          />
        )}
      >
        <View style={{ padding: 16 }}>
          <Text
            selectable={true}
            style={[
              H4,
              {
                color: themeColors.text,
                textAlign: "center",
                marginBottom: 16,
              },
            ]}
          >
            Наші партнери
          </Text>
          <BottomSheetScrollView>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {partnersList.map((partner, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: themeColors.primary,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  }}
                  onPress={() => {
                    Linking.openURL(partner.url);
                    partnersSheetRef.current?.close();
                  }}
                >
                  <Text
                    selectable={true}
                    style={[H6, { color: themeColors.text }]}
                  >
                    {partner.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>

      {snackbar}
    </DefaultScreenWidget>
  );
}
