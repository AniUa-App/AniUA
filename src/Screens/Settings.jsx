import { View, ScrollView, Linking, StatusBar } from "react-native";
import React, { useState } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import SettingsSection from "../Widgets/SettingsSectionWidget";
import Icons, { AppIcon } from "../Styles/Icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import ExpandableNotification from "../Widgets/ExpandableNotification";
import ConfirmationWidget from "../Widgets/ConfirmationWidget";
import MainConfig from "../cfgs/MainConfig";
import * as FileSystem from "expo-file-system";
import SettingsStorage from "../Storage/SettingsStorage";
import AnimeHashStorage from "../Storage/AnimeHashStorage";
import AnimeStorage from "../Storage/AnimeStorage";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import RatingWidget from "../Widgets/RatingWidget";
import Api from "../Api/api";
import * as Expo from "expo";
import Logger from "../Logger/Logger";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });
  const [confirmation, setConfirmation] = useState({
    visible: false,
    message: "",
    onConfirm: null,
  });
  const [isRatingVisible, setIsRatingVisible] = useState(false);

  const showNotification = (message) => {
    setNotification({ visible: true, message });
  };

  const hideNotification = () => {
    setNotification({ visible: false, message: "" });
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmation({ visible: true, message, onConfirm });
  };

  const hideConfirmation = () => {
    setConfirmation({ visible: false, message: "", onConfirm: null });
  };

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

      showNotification("Кеш успішно очищено");
    } catch (error) {
      Logger.warn("Settings", "Помилка очищення кешу", error);
      showNotification("Частково очищено кеш");
    }
  };

  const defaultPlayer = SettingsStorage.getParameter("defaultPlayer");

  return (
    <DefaultScreenWidget isCheckInternet={false} isNavBarPadding={true}>
      <ScrollView
        style={{ flex: 1, paddingTop: StatusBar.currentHeight }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16 }}
      >
        <ExpandableNotification
          visible={notification.visible}
          message={notification.message}
          onHide={hideNotification}
        />
        <ConfirmationWidget
          visible={confirmation.visible}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onDecline={hideConfirmation}
          onHide={hideConfirmation}
        />
        <RatingWidget
          visible={isRatingVisible}
          onClose={() => setIsRatingVisible(false)}
          onRatingSubmit={(rating, feedback) => {
            Logger.info("Settings", "Користувач поставив оцінку", { rating });
            Logger.info("Settings", "Користувач залишив відгук", { feedback });
            Api.sendFeedback(rating, feedback).then((saved) => {
              Logger.info("Settings", "Відгук відправлено", { saved });
              if (saved) {
                showNotification("Відгук успішно відправлено.");
              } else {
                showNotification("Помилка при відправці відгуку.");
              }
            });
            setIsRatingVisible(false);
          }}
        />

        {/* Загальні налаштування */}
        <SettingsSection title="Загальні">
          <SettingsItemWidget
            title="Плеєр за замовчуванням"
            subtitle={defaultPlayer || "Не вибрано"}
            icon={<Icons.Play />}
            showChevron
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "ButtonsScreen",
                params: {
                  title: "Виберіть плеєр за замовчуванням.",
                  Sbutton: true,
                  isGoBack: true,
                  value: defaultPlayer,
                  list: MainConfig.players.map((player) => ({
                    title: player.slice(0, 10),
                    onPress: () => {
                      SettingsStorage.setParameter("defaultPlayer", player);
                      showNotification(
                        `Плеєр ${player} за замовчуванням успішно вибрано.`
                      );
                    },
                  })),
                },
              });
            }}
          />
          <SettingsItemWidget
            title="Очистити кеш"
            subtitle="Завантажені серії та збережені аніме"
            icon={<Icons.Trash />}
            iconColor={themeColors.redBookmark}
            showChevron
            onPress={() => {
              showConfirmation(
                "Ви впевнені, що хочете видалити всі кешовані дані?",
                () => {
                  clearCache();
                  setTimeout(() => {
                    Expo.reloadAppAsync();
                  }, 3000);
                }
              );
            }}
          />
        </SettingsSection>

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
            onPress={() => {
              const partnersList = Object.values(MainConfig.partners).map(
                (partner) => ({
                  title: partner.name,
                  onPress: () => {
                    Linking.openURL(partner.url);
                  },
                })
              );

              const seenUrls = new Set();
              const partnerStudiosArray = MainConfig.partnerStudios || [];
              const studiosList = partnerStudiosArray
                .filter((team) => {
                  if (!team.telegram) return false;
                  if (seenUrls.has(team.telegram)) return false;
                  seenUrls.add(team.telegram);
                  return true;
                })
                .map((team) => ({
                  title: team.name,
                  onPress: () => {
                    Linking.openURL(team.telegram);
                  },
                }));

              navigation.navigate("HiddenStack", {
                screen: "ButtonsScreen",
                params: {
                  title: "Наші партнери.",
                  list: [...partnersList, ...studiosList],
                  buttonStyle: {
                    minWidth: "20%",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: themeColors.primary,
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 50,
                  },
                },
              });
            }}
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

        <View style={{ height: 130 }} />
      </ScrollView>
    </DefaultScreenWidget>
  );
}
