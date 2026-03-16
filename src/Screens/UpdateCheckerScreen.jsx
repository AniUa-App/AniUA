import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Linking,
} from "react-native";
import { useUpdateCheckerScreenStyles } from "../Styles/components/Screens/UpdateCheckerScreenStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5, H7, useScaleFontSize } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import UpdateCheckerService from "../Services/UpdateCheckerService";
import Logger from "../Logger/Logger";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import Markdown from "react-native-markdown-display";

/**
 * Екран для відображення інформації про обов'язкове оновлення
 */
export default function UpdateCheckerScreen({ route }) {
  const updateInfo = route?.params?.updateInfo || null;
  const colors = useThemeColors();
  const s = useUpdateCheckerScreenStyles();
  const scaleFontSize = useScaleFontSize();
  const insets = useSafeAreaInsets();

  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Забороняємо вихід назад з екрану
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  /**
   * Обробляє OTA оновлення
   */
  const handleUpdate = useCallback(async () => {
    if (!updateInfo) return;

    setIsUpdating(true);
    setError(null);

    try {
      await UpdateCheckerService.applyOTAUpdate();
    } catch (err) {
      Logger.error("UpdateCheckerScreen", "Помилка оновлення", err);
      setError(err.message || "Не вдалося застосувати оновлення");
      setIsUpdating(false);
    }
  }, [updateInfo]);

  useEffect(() => {
    if (updateInfo) {
      handleUpdate();
    }
  }, [updateInfo]);

  const isOTA = updateInfo?.type === "ota";

  if (!updateInfo) {
    return (
      <View
        style={[
          s.screen,
          { backgroundColor: colors.background, paddingTop: insets.top + 24 },
        ]}
      >
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text selectable={true} style={[H5, { color: colors.text }]}>
            Перевіряємо оновлення...
          </Text>
        </View>
      </View>
    );
  }

  // Форматуємо changelog - заміняємо чекбокси на красиві символи
  const formattedChangelog = updateInfo.changelog
    ? updateInfo.changelog.replaceAll("✅", "")
    : "";
  const versionText = updateInfo.version
    ? `${updateInfo.version}${
        updateInfo.gitShortHash ? ` (${updateInfo.gitShortHash})` : ""
      }`
    : "Нова версія";

  return (
    <DefaultScreenWidget>
      <View
        style={[
          s.screen,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ScrollView
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Центральний контент */}
          <View style={s.centerContent}>
            {/* Header */}
            <View style={s.header}>
              <View
                style={[
                  s.iconContainer,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Icons.ArrowUp size={44} color={colors.primary} weight="bold" />
              </View>
              <Text
                selectable={true}
                style={[
                  H4,
                  {
                    color: colors.text,
                    marginBottom: 4,
                  },
                ]}
              >
                Потрібне оновлення
              </Text>
              <Text
                selectable={true}
                style={[
                  H5,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {versionText}
              </Text>
            </View>

            {/* Changelog */}
            {updateInfo.changelog && (
              <View
                style={[
                  s.changelogContainer,
                  {
                    backgroundColor: colors.accent,
                  },
                ]}
              >
                <Markdown
                  style={{
                    body: {
                      color: colors.text,
                      fontFamily: "Nunito-Regular",
                      fontSize: 14,
                      lineHeight: 22,
                    },
                    heading1: {
                      color: colors.text,
                      fontFamily: "Nunito-Bold",
                      fontSize: 20,
                    },
                    heading2: {
                      color: colors.text,
                      fontFamily: "Nunito-Bold",
                      fontSize: 18,
                    },
                    heading3: {
                      color: colors.text,
                      fontFamily: "Nunito-SemiBold",
                      fontSize: 16,
                      marginBottom: 8,
                    },
                    paragraph: {
                      color: colors.text,
                      fontFamily: "Nunito-Regular",
                      fontSize: 14,
                      lineHeight: 22,
                      marginBottom: 8,
                    },
                    bullet_list: {
                      marginBottom: 8,
                    },
                    ordered_list: {
                      marginBottom: 8,
                    },
                    list_item: {
                      flexDirection: "row",
                      marginBottom: 6,
                    },
                    bullet_list_icon: {
                      color: colors.primary,
                      fontFamily: "Nunito-Bold",
                      fontSize: 14,
                      marginRight: 8,
                    },
                    ordered_list_icon: {
                      color: colors.primary,
                      fontFamily: "Nunito-SemiBold",
                      fontSize: 14,
                      marginRight: 8,
                    },
                    link: {
                      color: colors.primary,
                      fontFamily: "Nunito-Medium",
                      textDecorationLine: "underline",
                    },
                    strong: {
                      fontFamily: "Nunito-Bold",
                      color: colors.text,
                    },
                    em: {
                      fontFamily: "Nunito-Italic",
                      color: colors.text,
                    },
                    code_inline: {
                      backgroundColor: colors.Background
                        ? colors.Background(0.5)
                        : colors.background,
                      fontFamily: "monospace",
                      fontSize: 13,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                      color: colors.primary,
                    },
                    code_block: {
                      backgroundColor: colors.Background
                        ? colors.Background(0.5)
                        : colors.background,
                      fontFamily: "monospace",
                      fontSize: 13,
                      padding: 12,
                      borderRadius: 8,
                      marginVertical: 8,
                      color: colors.text,
                    },
                    fence: {
                      backgroundColor: colors.Background
                        ? colors.Background(0.5)
                        : colors.background,
                      fontFamily: "monospace",
                      fontSize: 13,
                      padding: 12,
                      borderRadius: 8,
                      marginVertical: 8,
                      color: colors.text,
                    },
                    blockquote: {
                      backgroundColor: colors.Background
                        ? colors.Background(0.3)
                        : colors.background,
                      borderLeftWidth: 3,
                      borderLeftColor: colors.primary,
                      paddingLeft: 12,
                      paddingVertical: 8,
                      marginVertical: 8,
                      borderRadius: 4,
                    },
                    hr: {
                      backgroundColor: colors.Text
                        ? colors.Text(0.2)
                        : colors.text,
                      height: 1,
                      marginVertical: 16,
                    },
                  }}
                  onLinkPress={(link) => {
                    Linking.openURL(link);
                    return true;
                  }}
                >
                  {formattedChangelog}
                </Markdown>
              </View>
            )}
            {/* Error message */}
            {error && (
              <View style={[s.errorContainer]}>
                <Text
                  selectable={true}
                  style={[s.errorText, { color: "red" }]}
                >
                  Помилка оновлення: {error}
                </Text>
              </View>
            )}

            {/* Loading indicator */}
            {isUpdating && (
              <View style={s.progressContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  selectable={true}
                  style={[
                    H7,
                    { textAlign: "center", color: colors.Text(0.7), marginTop: 8 },
                  ]}
                >
                  Застосування оновлення...
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Type indicator - внизу */}
        <View style={s.typeIndicator}>
          <Icons.Info size={14} color={colors.Text(0.4)} />
          <Text selectable={true} style={[H7, { color: colors.Text(0.4) }]}>
            OTA оновлення
          </Text>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}

