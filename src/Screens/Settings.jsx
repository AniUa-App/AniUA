import { View, Text, ScrollView, Linking, StatusBar } from "react-native";
import React, { useState, useEffect } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import SettingsItemWidget from "../Widgets/SettingsItemWidget";
import Icons, { AppIcon, TelegramIcon } from "../Styles/Icons";
import Icon from "../Styles/Icons";
import { useNavigation } from "@react-navigation/native";
import { appColor, Black, black, Black_1, white } from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import ExpandableNotification from "../Widgets/ExpandableNotification";
import ConfirmationWidget from "../Widgets/ConfirmationWidget";
import MainConfig from "../cfgs/MainConfig";
import * as FileSystem from "expo-file-system";
import SettingsStorage from "../Storage/SettingsStorage";
import AnimeHashStorage from "../Storage/AnimeHashStorage";
import AnimeStorage from "../Storage/AnimeStorage";
import { playersIcons } from "../Widgets/DubbingBottomSheetWidget";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import RatingWidget from "../Widgets/RatingWidget";
import Api from "../Api/api";

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
      // Очищаємо MMKV storage
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

      // Очищаємо файли епізодів
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
      console.warn("Помилка очищення кешу:", error);
      showNotification("Частково очищено кеш");
    }
  };

  const SETTINGS_ITEMS = [
    {
      title: "Кешовані данні",
      subtitle: "Завантажені серії та збережені аніме.",
      button: {
        Text: "Видалити",
      },
      onPress: () => {
        showConfirmation(
          "Ви впевнені, що хочете видалити всі кешовані дані?",
          clearCache
        );
      },
    },
    {
      title: "Плеєр за замовчуванням",
      subtitle: `Виберіть плеєр за замовчуванням, зараз ${
        SettingsStorage.getParameter("defaultPlayer")
          ? SettingsStorage.getParameter("defaultPlayer")
          : "не вибрано"
      }`,
      button: {
        Text: "Вибрати",
      },
      onPress: () => {
        navigation.navigate("HiddenStack", {
          screen: "ButtonsScreen",
          params: {
            title: "Виберіть плеєр за замовчуванням.",
            Sbutton: true,
            isGoBack: true,
            list: MainConfig.players.map((player) => ({
              title: player,

              onPress: () => {
                SettingsStorage.setParameter("defaultPlayer", player);
                showNotification(
                  `Плеєр ${player} за замовчуванням успішно вибрано.`
                );
              },
            })),
          },
        });
      },
    },
    {
      title: "Підтримка",
      subtitle: "Зворотній зв'язок з розробниками.",
      button: {
        Text: "Відкрити",
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.telegramChannelUrl);
      },
    },

    {
      title: "Оцінити застосунок",
      subtitle: "Допоможіть нам стати кращими.",
      button: {
        Text: "Оцінити",
      },
      onPress: () => {
        setIsRatingVisible(true);
      },
    },
    {
      title: "Партнери",
      subtitle: "Всі партнери додатку (дуже вдячний).",
      button: {
        Text: "Дивитись",
      },
      onPress: () => {
        navigation.navigate("HiddenStack", {
          screen: "ButtonsScreen",
          params: {
            title: "Наші партнери.",
            list: Object.values(MainConfig.partners).map((partner) => ({
              title: partner.name,
              onPress: () => {
                Linking.openURL(partner.url);
              },
            })),
            buttonStyle: {
              minWidth: "20%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: themeColors.appColor,
              borderRadius: 8,
              padding: 10,
              minHeight: 50,
            },
          },
        });
      },
    },
    {
      title: "Донат",
      subtitle: "Ви можете зробити добровольне пожертвування.",
      button: {
        Text: "Відкрити",
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.donateUrl);
      },
    },
    {
      title: "Посилання на сайт",
      subtitle: "Інша інформація про додаток.",
      button: {
        Icon: <AppIcon styles={{ width: 46, height: 46 }} />,
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.appUrl);
      },
    },
    {
      title: "Новини",
      subtitle: "У телеграм каналі ви знайдете новини.",
      button: {
        Icon: <Icon.TelegramLogo size={45} color={Black(0.8)} />,
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.telegramChannelUrl);
      },
    },
    {
      title: "Кастомізація",
      subtitle: "Налаштування вигляду додатку.",
      button: {
        Icon: <Icons.PaintBrushBroad size={44} color={themeColors.white} />,
      },
      onPress: () => {
        navigation.navigate("HiddenStack", {
          screen: "CustomisationScreen",
          params: {
            title: "Кастомізація",
          },
        });
      },
    },
    {
      title: "Інформація про застосунок",
      subtitle: "Версія, хеш та ін.",
      button: {
        Icon: <Icons.Info size={42} color={Black(0.8)} />,
      },
      onPress: () => {
        navigation.navigate("HiddenStack", {
          screen: "AppInfo",
          params: {
            title: "Інформація про застосунок",
          },
        });
      },
    },
  ];

  return (
    <DefaultScreenWidget isCheckInternet={false}>
      <ScrollView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
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
            console.log("Користувач поставив оцінку:", rating);
            console.log("Користувач залишив відгук:", feedback);
            Api.sendFeedback(rating, feedback).then((success) => {
              if (success) {
                showNotification("Відгук успішно відправлено.");
              } else {
                showNotification("Помилка при відправці відгуку.");
              }
            });
            setIsRatingVisible(false);
          }}
        />
        {SETTINGS_ITEMS.map((item, index) => (
          <SettingsItemWidget
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            button={item.button}
            onPress={item.onPress}
          />
        ))}
        <View style={{ height: 130 }} />
      </ScrollView>
    </DefaultScreenWidget>
  );
}
