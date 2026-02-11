import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  AppState,
  Linking,
} from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import { H4, H3, H5, H6, H7, useScaleFontSize } from "../Styles/Fonts";
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
  const scaleFontSize = useScaleFontSize();
  const insets = useSafeAreaInsets();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState(null);
  const appState = useRef(AppState.currentState);

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

  // Перевіряємо чи є завантажений APK при запуску
  useEffect(() => {
    const checkPendingAPK = async () => {
      const pendingPath = await UpdateCheckerService.getPendingAPK();
      if (pendingPath) {
        setDownloadComplete(true);
        setDownloadProgress(100);
      }
    };
    checkPendingAPK();
  }, []);

  // Слухаємо повернення з інсталятора щоб показати кнопку повторно
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        // Коли користувач повертається в додаток після відмови від встановлення
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          downloadComplete
        ) {
          // Перевіряємо чи APK ще існує
          const pendingPath = await UpdateCheckerService.getPendingAPK();
          if (pendingPath) {
            setDownloadComplete(true);
            setIsDownloading(false);
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => subscription.remove();
  }, [downloadComplete]);

  // Скидаємо стан при зміні інформації про оновлення
  useEffect(() => {
    const initState = async () => {
      if (updateInfo) {
        // Перевіряємо чи вже є завантажений APK
        const pendingPath = await UpdateCheckerService.getPendingAPK();
        if (pendingPath && updateInfo.type === "apk") {
          setDownloadComplete(true);
          setDownloadProgress(100);
          setIsDownloading(false);
        } else {
          setIsDownloading(false);
          setDownloadProgress(0);
          setDownloadComplete(false);
        }
        setError(null);
      }
    };
    initState();
  }, [updateInfo]);

  /**
   * Обробляє завантаження та встановлення оновлення
   */
  const handleUpdate = useCallback(async () => {
    if (!updateInfo) return;

    setIsDownloading(true);
    setError(null);

    try {
      if (updateInfo.type === "ota") {
        await UpdateCheckerService.applyOTAUpdate();
      } else if (updateInfo.type === "apk" && updateInfo.downloadUrl) {
        // Завантажуємо APK
        await UpdateCheckerService.downloadAPK(
          updateInfo.downloadUrl,
          (progress) => {
            setDownloadProgress(progress.percent);
          }
        );
        setDownloadComplete(true);
        // Намагаємося відкрити для встановлення
        await UpdateCheckerService.installPendingAPK();
      }
    } catch (err) {
      Logger.error("UpdateCheckerScreen", "Помилка оновлення", err);
      // Якщо помилка під час встановлення (а не завантаження), APK вже завантажено
      const pendingPath = await UpdateCheckerService.getPendingAPK();
      if (pendingPath) {
        setDownloadComplete(true);
      } else {
        setError(err.message || "Не вдалося завантажити оновлення");
      }
      setIsDownloading(false);
    }
  }, [updateInfo]);

  /**
   * Встановлює вже завантажений APK
   */
  const handleInstallPending = useCallback(async () => {
    try {
      setError(null);
      await UpdateCheckerService.installPendingAPK();
    } catch (err) {
      Logger.error("UpdateCheckerScreen", "Помилка встановлення", err);
      setError(err.message || "Не вдалося відкрити інсталятор");
    }
  }, []);

  useEffect(() => {
    const startUpdate = async () => {
      if (updateInfo) {
        // Перевіряємо чи вже є завантажений APK
        const pendingPath = await UpdateCheckerService.getPendingAPK();
        if (!pendingPath) {
          handleUpdate();
        }
      }
    };
    startUpdate();
  }, [updateInfo]);

  /**
   * Відкриває URL у браузері (резервний спосіб)
   */
  const handleOpenInBrowser = useCallback(async () => {
    if (updateInfo?.downloadUrl) {
      try {
        await UpdateCheckerService.openDownloadUrl(updateInfo.downloadUrl);
      } catch (err) {
        Logger.error("UpdateCheckerScreen", "Помилка відкриття URL", err);
      }
    }
  }, [updateInfo]);

  if (!updateInfo) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, paddingTop: insets.top + 24 },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text selectable={true} style={[H5, { color: colors.text }]}>
            Перевіряємо оновлення...
          </Text>
        </View>
      </View>
    );
  }

  const isOTA = updateInfo.type === "ota";

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
          styles.screen,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Центральний контент */}
          <View style={styles.centerContent}>
            {/* Header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconContainer,
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
                  styles.changelogContainer,
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
              <View style={[styles.errorContainer]}>
                <Text
                  selectable={true}
                  style={[styles.errorText, { color: "red" }]}
                >
                  Помилка оновлення: {error}
                </Text>
              </View>
            )}

            {/* Progress bar */}
            {isDownloading &&
              updateInfo.type === "apk" &&
              !downloadComplete && (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${downloadProgress}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    selectable={true}
                    style={[
                      H7,
                      { textAlign: "center", color: colors.Text(0.7) },
                    ]}
                  >
                    Завантаження: {downloadProgress}%
                  </Text>
                </View>
              )}

            {/* Install button - показується коли APK завантажено */}
            {downloadComplete && updateInfo.type === "apk" && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.installContainer}
              >
                <View style={styles.downloadedInfo}>
                  <Icons.CheckCircle
                    size={20}
                    color={colors.primary}
                    weight="fill"
                  />
                  <Text
                    selectable={true}
                    style={[
                      H7,
                      {
                        color: colors.Text(0.7),
                      },
                    ]}
                  >
                    APK завантажено в папку Downloads
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.installButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleInstallPending}
                >
                  <Icons.Download size={20} color="#fff" weight="bold" />
                  <Text selectable={true} style={[H5]}>
                    Встановити оновлення
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Fallback link */}
            {error && updateInfo.type === "apk" && updateInfo.downloadUrl && (
              <TouchableOpacity
                style={styles.fallbackLink}
                onPress={handleOpenInBrowser}
              >
                <Text selectable={true} style={[H5, { color: colors.primary }]}>
                  Завантажити через браузер
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Type indicator - внизу */}
        <View style={styles.typeIndicator}>
          <Icons.Info size={14} color={colors.Text(0.4)} />
          <Text selectable={true} style={[H7, { color: colors.Text(0.4) }]}>
            {isOTA ? "OTA оновлення (швидке)" : "APK оновлення"}
          </Text>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  centerContent: {
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  changelogContainer: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
  },

  changelogBox: {
    borderRadius: 12,
    padding: 12,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    width: "100%",
  },
  errorText: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    width: "100%",
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {},
  buttonsContainer: {
    marginTop: 4,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  updateButton: {},
  buttonDisabled: {
    opacity: 0.7,
  },

  fallbackLink: {
    alignItems: "center",
  },
  installContainer: {
    width: "100%",
  },
  downloadedInfo: {
    flexDirection: "row",
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  installButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },

  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
