import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  AppState,
  Linking,
} from "react-native";
import { TouchableOpacity } from "../Widgets/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import { H4, H5, H6, H7 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import UpdateCheckerService from "../Services/UpdateCheckerService";
import Logger from "../Logger/Logger";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=aniua.yuzka.site";

/**
 * Екран для відображення інформації про обов'язкове оновлення
 */
export default function UpdateCheckerScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [apkInfo, setApkInfo] = useState(null);
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

  // Завантажуємо інформацію про APK при запуску
  useEffect(() => {
    const loadApkInfo = async () => {
      try {
        const result = await UpdateCheckerService.checkAPKUpdate();
        if (result.available && result.downloadUrl) {
          setApkInfo(result);
        }
      } catch (err) {
        Logger.warn("UpdateCheckerScreen", "Не вдалося отримати APK info", err);
      }

      // Перевіряємо чи є вже завантажений APK
      const pendingPath = await UpdateCheckerService.getPendingAPK();
      if (pendingPath) {
        setDownloadComplete(true);
        setDownloadProgress(100);
      }
    };
    loadApkInfo();
  }, []);

  // Слухаємо повернення з інсталятора
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          downloadComplete
        ) {
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

  const handleDownloadAPK = useCallback(async () => {
    if (!apkInfo?.downloadUrl) return;

    setIsDownloading(true);
    setError(null);

    try {
      await UpdateCheckerService.downloadAPK(apkInfo.downloadUrl, (progress) => {
        setDownloadProgress(progress.percent);
      });
      setDownloadComplete(true);
      await UpdateCheckerService.installPendingAPK();
    } catch (err) {
      Logger.error("UpdateCheckerScreen", "Помилка завантаження APK", err);
      const pendingPath = await UpdateCheckerService.getPendingAPK();
      if (pendingPath) {
        setDownloadComplete(true);
      } else {
        setError(err.message || "Не вдалося завантажити оновлення");
      }
      setIsDownloading(false);
    }
  }, [apkInfo]);

  const handleInstallPending = useCallback(async () => {
    try {
      setError(null);
      await UpdateCheckerService.installPendingAPK();
    } catch (err) {
      Logger.error("UpdateCheckerScreen", "Помилка встановлення", err);
      setError(err.message || "Не вдалося відкрити інсталятор");
    }
  }, []);

  const handleOpenGooglePlay = useCallback(() => {
    Linking.openURL(GOOGLE_PLAY_URL);
  }, []);

  const handleOpenInBrowser = useCallback(async () => {
    if (apkInfo?.downloadUrl) {
      try {
        await UpdateCheckerService.openDownloadUrl(apkInfo.downloadUrl);
      } catch (err) {
        Logger.error("UpdateCheckerScreen", "Помилка відкриття URL", err);
      }
    }
  }, [apkInfo]);

  return (
    <DefaultScreenWidget>
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContent}>
          <View
            style={[styles.iconContainer, { backgroundColor: colors.accent }]}
          >
            <Icons.ArrowCircleUp
              size={44}
              color={colors.primary}
              weight="bold"
            />
          </View>
          <Text style={[H4, { color: colors.text, marginBottom: 8 }]}>
            Потрібне оновлення
          </Text>
          {apkInfo?.version && (
            <Text style={[H6, { color: colors.primary }]}>
              {apkInfo.version}
              {apkInfo.gitShortHash ? ` (${apkInfo.gitShortHash})` : ""}
            </Text>
          )}

          {/* Відступ між текстом і кнопками */}
          <View style={{ height: 80 }} />

          {/* Google Play */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleOpenGooglePlay}
          >
            <Icons.GooglePlayLogo size={22} color="#fff" weight="fill" />
            <Text style={[H5, { color: "#fff" }]}>
              Оновитись в Google Play
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.accent }]}
            />
            <Text style={[H7, { color: colors.inActiveText, paddingHorizontal: 12 }]}>
              або
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.accent }]}
            />
          </View>

          {/* APK Download */}
          {error && (
            <Text style={[H7, { color: "red", marginBottom: 12, textAlign: "center" }]}>
              {error}
            </Text>
          )}

          {isDownloading && !downloadComplete && (
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.accent }]}
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
              <Text style={[H7, { textAlign: "center", color: colors.inActiveText }]}>
                Завантаження: {downloadProgress}%
              </Text>
            </View>
          )}

          {downloadComplete ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.fullWidth}>
              <View style={styles.downloadedInfo}>
                <Icons.CheckCircle size={18} color={colors.primary} weight="fill" />
                <Text style={[H7, { color: colors.inActiveText }]}>
                  APK завантажено в папку Downloads
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline, { borderColor: colors.primary }]}
                onPress={handleInstallPending}
              >
                <Icons.Download size={20} color={colors.primary} weight="bold" />
                <Text style={[H5, { color: colors.primary }]}>
                  Встановити APK
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonOutline,
                {
                  borderColor: apkInfo?.downloadUrl ? colors.primary : colors.accent,
                  opacity: apkInfo?.downloadUrl && !isDownloading ? 1 : 0.5,
                },
              ]}
              onPress={handleDownloadAPK}
              disabled={!apkInfo?.downloadUrl || isDownloading}
            >
              <Icons.Download
                size={20}
                color={apkInfo?.downloadUrl ? colors.primary : colors.inActiveText}
                weight="bold"
              />
              <Text
                style={[
                  H5,
                  {
                    color: apkInfo?.downloadUrl
                      ? colors.primary
                      : colors.inActiveText,
                  },
                ]}
              >
                {apkInfo?.downloadUrl ? "Завантажити APK" : "APK недоступний"}
              </Text>
            </TouchableOpacity>
          )}

          {error && apkInfo?.downloadUrl && (
            <TouchableOpacity style={{ marginTop: 8 }} onPress={handleOpenInBrowser}>
              <Text style={[H7, { color: colors.primary }]}>
                Завантажити через браузер
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.typeIndicator}>
          <Icons.Info size={14} color={colors.inActiveText} />
          <Text style={[H7, { color: colors.inActiveText }]}>
            Оновлення обов'язкове
          </Text>
        </View>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "space-between",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 10,
    width: "100%",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 12,
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
  fullWidth: {
    width: "100%",
  },
  downloadedInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
});
