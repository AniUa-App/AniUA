import React from "react";
import { View, Text, ScrollView, Linking } from "react-native";
import { useThemeColors } from "../Global/useTheme";
import { useMangaScreenStyles } from "../Styles/components/Screens/MangaScreenStyles";
import {
  BookOpen,
  Timer,
  CloudArrowUp,
  Browsers,
  HeartStraight,
} from "phosphor-react-native";
import { H3, H4 } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Config from "../cfgs/MainConfig";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";

export default function MangaScreen() {
  const themeColors = useThemeColors();
  const s = useMangaScreenStyles();

  const handleDonate = () => {
    const url = Config.urls.donateUrl;
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <DefaultScreenWidget>
      <ScrollView
        style={{ flex: 1, backgroundColor: "transparent" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.container}>
          <View style={s.content}>
            {/* Іконка */}
            <View
              style={[
                s.iconContainer,
                { backgroundColor: themeColors.primary + "20" },
              ]}
            >
              <BookOpen size={72} color={themeColors.accent} weight="duotone" />
            </View>

            {/* Заголовок */}
            <Text
              selectable={true}
              style={[H3, s.title, { color: themeColors.text }]}
            >
              Манґа
            </Text>

            {/* Статус */}
            <View
              style={[
                s.statusBadge,
                { backgroundColor: themeColors.accent + "30" },
              ]}
            >
              <Timer size={16} color={themeColors.primary} weight="bold" />
              <Text
                selectable={true}
                style={[s.statusText, { color: themeColors.primary }]}
              >
                Йде збір коштів
              </Text>
            </View>

            {/* Опис */}
            <Text
              selectable={true}
              style={[s.description, { color: themeColors.text, opacity: 0.7 }]}
            >
              Для запуску розділу манґи нам потрібно оновити сервер. Як тільки
              збір буде закрито — розпочнеться активна розробка!
            </Text>

            {/* Кнопка донату */}
            <TouchableOpacity
              style={[s.donateButton, { backgroundColor: themeColors.primary }]}
              onPress={handleDonate}
              activeOpacity={0.8}
            >
              <HeartStraight size={22} color={themeColors.text} weight="fill" />
              <Text
                selectable={true}
                style={[H4, s.donateButtonText, { color: themeColors.text }]}
              >
                Підтримати проєкт
              </Text>
            </TouchableOpacity>

            {/* Додаткова інформація */}
            <Text
              selectable={true}
              style={[s.footnote, { color: themeColors.text, opacity: 0.5 }]}
            >
              Кожен донат наближає запуск розділу манґи
            </Text>
          </View>
        </View>
      </ScrollView>
    </DefaultScreenWidget>
  );
}
