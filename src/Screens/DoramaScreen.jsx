import React from "react";
import { View, StyleSheet, Text, ScrollView, Linking } from "react-native";
import { useThemeColors } from "../Global/useTheme";
import {
  FilmReel,
  Timer,
  Globe,
  HeartStraight,
  CloudArrowUp,
} from "phosphor-react-native";
import { H3, H4 } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Config from "../cfgs/MainConfig";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";

export default function DoramaScreen() {
  const themeColors = useThemeColors();

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
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Іконка */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: themeColors.primary },
              ]}
            >
              <FilmReel size={72} color={themeColors.accent} weight="duotone" />
            </View>

            {/* Заголовок */}
            <Text style={[H3, styles.title, { color: themeColors.text }]}>
              Дорами
            </Text>

            {/* Статус */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: themeColors.accent },
              ]}
            >
              <Timer size={16} color={themeColors.primary} weight="bold" />
              <Text style={[styles.statusText, { color: themeColors.primary }]}>
                Йде збір коштів
              </Text>
            </View>

            {/* Опис */}
            <Text
              style={[
                styles.description,
                { color: themeColors.text, opacity: 0.7 },
              ]}
            >
              Для запуску розділу дорам нам потрібен окремий сервер. Як тільки
              збір буде закрито — розпочнеться активна розробка!
            </Text>

            {/* Інфо картка */}
            <View
              style={[styles.infoCard, { backgroundColor: themeColors.subtle }]}
            >
              <View style={styles.infoRow}>
                <CloudArrowUp
                  size={20}
                  color={themeColors.text}
                  weight="duotone"
                  style={{ opacity: 0.7 }}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: themeColors.text, opacity: 0.8 },
                  ]}
                >
                  Сервер для зберігання та стрімінгу дорам з українською
                  озвучкою
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: themeColors.text + "15" },
                ]}
              />
              <View style={styles.infoRow}>
                <Globe
                  size={20}
                  color={themeColors.text}
                  weight="duotone"
                  style={{ opacity: 0.7 }}
                />
                <Text
                  style={[
                    styles.infoText,
                    { color: themeColors.text, opacity: 0.8 },
                  ]}
                >
                  Корейські, японські та китайські дорами українською
                </Text>
              </View>
            </View>

            {/* Кнопка донату */}
            <TouchableOpacity
              style={[
                styles.donateButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={handleDonate}
              activeOpacity={0.8}
            >
              <HeartStraight size={22} color={themeColors.text} weight="fill" />
              <Text
                style={[
                  H4,
                  styles.donateButtonText,
                  { color: themeColors.text },
                ]}
              >
                Підтримати проєкт
              </Text>
            </TouchableOpacity>

            {/* Додаткова інформація */}
            <Text
              style={[
                styles.footnote,
                { color: themeColors.text, opacity: 0.5 },
              ]}
            >
              Кожен донат наближає запуск розділу дорам
            </Text>
          </View>
        </View>
      </ScrollView>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    maxWidth: 400,
    width: "100%",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Nunito-Bold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
  },
  description: {
    fontSize: 15,
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  donateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    gap: 10,
  },
  donateButtonText: {
    fontFamily: "Nunito-Bold",
  },
  footnote: {
    fontSize: 13,
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    marginTop: 16,
  },
});
