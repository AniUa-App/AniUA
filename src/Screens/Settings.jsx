import {View, Text, ScrollView, Linking, StatusBar} from 'react-native';
import React, {useState, useEffect} from 'react';
import DefaultScreenWidget from '../Widgets/DefaultScreenWidget';
import SettingsItemWidget from '../Widgets/SettingsItemWidget';
import { AppIcon, TelegramIcon } from '../Styles/Icons';
import Icon from '../Styles/Icons';
import {useNavigation} from '@react-navigation/native';
import {appColor, Black, black, Black_1, white} from '../Styles/Colors';
import ExpandableNotification from '../Widgets/ExpandableNotification';
import ConfirmationWidget from '../Widgets/ConfirmationWidget';
import MainConfig from '../cfgs/MainConfig';
import * as FileSystem from 'expo-file-system';
import SettingsStorage from '../Storage/SettingsStorage';
import AnimeHashStorage from '../Storage/AnimeHashStorage';
import AnimeStorage from '../Storage/AnimeStorage';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
  });
  const [confirmation, setConfirmation] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  const showNotification = message => {
    setNotification({visible: true, message});
  };

  const hideNotification = () => {
    setNotification({visible: false, message: ''});
  };

  const showConfirmation = (message, onConfirm) => {
    setConfirmation({visible: true, message, onConfirm});
  };

  const hideConfirmation = () => {
    setConfirmation({visible: false, message: '', onConfirm: null});
  };

  const clearCache = async () => {
    try {
      // Очищаємо MMKV storage
      AnimeHashStorage.clearHash();
      AnimeStorage.clearStorage();


      // Очищаємо файли епізодів
      const episodesPath = SettingsStorage.getParameter('pathToSaveEpisodes');

      if (episodesPath) {
        const pathExists = await FileSystem.getInfoAsync(episodesPath);
        if (pathExists.exists) {
          await FileSystem.deleteAsync(episodesPath, { idempotent: true });
        }
      }
      
      showNotification('Кеш успішно очищено');
    } catch (error) {
      console.warn('Помилка очищення кешу:', error);
      showNotification('Частково очищено кеш');
    }
  };

  const SETTINGS_ITEMS = [
    {
      title: 'Кешовані данні',
      subtitle: 'Завантажені серії та збережені аніме.',
      button: {
        Text: 'Видалити',
      },
      onPress: () => {
        showConfirmation(
          'Ви впевнені, що хочете видалити всі кешовані дані?',
          clearCache,
        );
      },
    },
    {
      title: 'Підтримка',
      subtitle: "Телеграм бот для зв'язку з розробниками.",
      button: {
        Text: 'Відкрити',
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.supportBotUrl);
      },
    },

    {
      title: 'Оцінити додаток',
      subtitle: 'Допоможіть нам стати кращими.',
      button: {
        Text: 'Оцінити',
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.googlePlayUrl);
      },
    },
    {
      title: 'Партнери',
      subtitle: 'Всі партнери додатку (дуже вдячний).',
      button: {
        Text: 'Дивитись',
      },
      onPress: () => {
        navigation.navigate('HiddenStack', {
          screen: 'ButtonsScreen',
          params: {
            title: 'Наші партнери.',
            list: Object.values(MainConfig.partners).map(partner => ({
              title: partner.name,
              onPress: () => {
                Linking.openURL(partner.url);
              },
            })),
            buttonStyle: {
              minWidth: '20%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: appColor,
              borderRadius: 8,
              padding: 10,
              minHeight: 50,
            },
          },
        });
      },
    },
    {
      title: 'Посилання на сайт',
      subtitle: 'Інша інформація про додаток.',
      button: {
        Icon: <AppIcon styles={{width: 46, height: 46}} />,
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.appUrl);
      },
    },
    {
      title: 'Новини',
      subtitle: 'У телеграм каналі ви знайдете новини.',
      button: {
        Icon: <Icon.TelegramLogo size={45} color={Black(0.8)} />
      },
      onPress: () => {
        Linking.openURL(MainConfig.urls.telegramChannelUrl);
      },
    },
  ];

  if (MainConfig.debug.isDebug) {
    SETTINGS_ITEMS.push({
      title: 'Продвинуті функції',
      subtitle: 'Ввімкнути режим розробника.',
      button: {
        Text: MainConfig.debug.isErrorBoundary === true ? 'Вимкнути' : 'Ввімкнути',
      },
      onPress: () => {
        MainConfig.debug.isErrorBoundary = !MainConfig.debug.isErrorBoundary;
        SettingsStorage.setParameter(
          'isErrorBoundary',
          MainConfig.debug.isErrorBoundary,
        );

        // Оновлюємо стан в App.jsx
        if (MainConfig.updateErrorBoundaryState) {
          MainConfig.updateErrorBoundaryState(MainConfig.debug.isErrorBoundary);
        }

        showNotification(
          MainConfig.debug.isErrorBoundary
            ? 'Режим розробника успішно ввімкнуто'
            : 'Режим розробника успішно вимкнуто',
        );
      },
    });
  }

  return (
    <DefaultScreenWidget isCheckInternet={false}>
      <ScrollView style={{flex: 1, paddingTop: StatusBar.currentHeight}}>
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
        {SETTINGS_ITEMS.map((item, index) => (
          <SettingsItemWidget
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            button={item.button}
            onPress={item.onPress}
          />
        ))}
      </ScrollView>
    </DefaultScreenWidget>
  );
}
