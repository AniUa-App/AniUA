import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useThemeColors } from "../Global/useTheme";
import { H3, H5, H6, H7, useScaleFontSize } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import UpdateCheckerService from "../Services/UpdateCheckerService";
import Logger from "../Logger/Logger";

/**
 * Modal для відображення інформації про оновлення
 *
 * @param {Object} props
 * @param {boolean} props.visible - Чи показувати modal
 * @param {Function} props.onClose - Callback при закритті
 * @param {Object} props.updateInfo - Інформація про оновлення
 * @param {string} props.updateInfo.type - Тип оновлення ('ota' | 'apk')
 * @param {string} props.updateInfo.version - Версія
 * @param {string} props.updateInfo.gitShortHash - Короткий git hash
 * @param {string} props.updateInfo.changelog - Опис змін
 * @param {string} props.updateInfo.downloadUrl - URL для завантаження (для APK)
 */
export default function UpdateCheckerModal({
  visible,
  onClose,
  updateInfo,
}) {
  const colors = useThemeColors();
  const scaleFontSize = useScaleFontSize();
  const insets = useSafeAreaInsets();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Скидаємо стан при відкритті
  useEffect(() => {
    if (visible) {
      setIsDownloading(false);
      setDownloadProgress(0);
      setError(null);
    }
  }, [visible]);

  /**
   * Обробляє натискання кнопки "Оновити"
   */
  const handleUpdate = useCallback(async () => {
    if (!updateInfo) return;

    setIsDownloading(true);
    setError(null);

    try {
      if (updateInfo.type === "ota") {
        await UpdateCheckerService.applyOTAUpdate();
        // Після OTA застосунок перезапуститься
      } else if (updateInfo.type === "apk" && updateInfo.downloadUrl) {
        await UpdateCheckerService.downloadAndInstallAPK(
          updateInfo.downloadUrl,
          (progress) => {
            setDownloadProgress(progress.percent);
          }
        );
        onClose?.();
      }
    } catch (err) {
      Logger.error("UpdateCheckerModal", "Помилка оновлення", err);
      setError(err.message || "Не вдалося завантажити оновлення");
      setIsDownloading(false);
    }
  }, [updateInfo, onClose]);

  /**
   * Відкриває URL у браузері (резервний спосіб)
   */
  const handleOpenInBrowser = useCallback(async () => {
    if (updateInfo?.downloadUrl) {
      try {
        await UpdateCheckerService.openDownloadUrl(updateInfo.downloadUrl);
        onClose?.();
      } catch (err) {
        Logger.error("UpdateCheckerModal", "Помилка відкриття URL", err);
      }
    }
  }, [updateInfo, onClose]);

  if (!updateInfo) return null;

  const isOTA = updateInfo.type === "ota";
  const versionText = updateInfo.version
    ? `${updateInfo.version}${updateInfo.gitShortHash ? ` (${updateInfo.gitShortHash})` : ""}`
    : "Нова версія";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[styles.iconContainer, { backgroundColor: colors.Primary(0.15) }]}
            >
              <Icons.ArrowsClockwise
                size={32}
                color={colors.primary}
                weight="bold"
              />
            </View>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontSize: scaleFontSize(H3.fontSize) },
              ]}
            >
              Доступне оновлення
            </Text>
            <Text
              style={[
                styles.version,
                { color: colors.primary, fontSize: scaleFontSize(H5.fontSize) },
              ]}
            >
              {versionText}
            </Text>
          </View>

          {/* Changelog */}
          {updateInfo.changelog && (
            <View style={styles.changelogContainer}>
              <Text
                style={[
                  styles.changelogTitle,
                  { color: colors.Text(0.7), fontSize: scaleFontSize(H6.fontSize) },
                ]}
              >
                Що нового:
              </Text>
              <ScrollView
                style={[styles.changelogScroll, { backgroundColor: colors.Background(0.3) }]}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={[
                    styles.changelogText,
                    { color: colors.text, fontSize: scaleFontSize(H7.fontSize) },
                  ]}
                >
                  {updateInfo.changelog}
                </Text>
              </ScrollView>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.Red(0.1) }]}>
              <Icons.Warning size={20} color={colors.red} />
              <Text style={[styles.errorText, { color: colors.red }]}>{error}</Text>
            </View>
          )}

          {/* Progress bar */}
          {isDownloading && updateInfo.type === "apk" && (
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.Background(0.3) }]}
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
                style={[
                  styles.progressText,
                  { color: colors.Text(0.7), fontSize: scaleFontSize(H7.fontSize) },
                ]}
              >
                Завантаження: {downloadProgress}%
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {!isDownloading && (
              <Pressable
                style={[styles.button, styles.laterButton, { backgroundColor: colors.Background(0.5) }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: colors.Text(0.7) }]}>
                  Пізніше
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.button,
                styles.updateButton,
                { backgroundColor: colors.primary },
                isDownloading && styles.buttonDisabled,
              ]}
              onPress={handleUpdate}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icons.Download size={20} color="#fff" weight="bold" />
                  <Text style={[styles.buttonText, { color: "#fff", marginLeft: 8 }]}>
                    {isOTA ? "Застосувати" : "Оновити"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Fallback link */}
          {error && updateInfo.type === "apk" && updateInfo.downloadUrl && (
            <Pressable style={styles.fallbackLink} onPress={handleOpenInBrowser}>
              <Text style={[styles.fallbackText, { color: colors.primary }]}>
                Завантажити через браузер
              </Text>
            </Pressable>
          )}

          {/* Type indicator */}
          <View style={styles.typeIndicator}>
            <Icons.Info size={14} color={colors.Text(0.4)} />
            <Text style={[styles.typeText, { color: colors.Text(0.4) }]}>
              {isOTA ? "OTA оновлення (швидке)" : "APK оновлення"}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Nunito-Bold",
    marginBottom: 4,
  },
  version: {
    fontFamily: "Nunito-SemiBold",
  },
  changelogContainer: {
    marginBottom: 20,
  },
  changelogTitle: {
    fontFamily: "Nunito-SemiBold",
    marginBottom: 8,
  },
  changelogScroll: {
    maxHeight: 150,
    borderRadius: 12,
    padding: 12,
  },
  changelogText: {
    fontFamily: "Nunito-Regular",
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
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
  progressText: {
    fontFamily: "Nunito-Regular",
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  laterButton: {},
  updateButton: {},
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 15,
  },
  fallbackLink: {
    alignItems: "center",
    marginTop: 16,
  },
  fallbackText: {
    fontFamily: "Nunito-Regular",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  typeText: {
    fontFamily: "Nunito-Regular",
    fontSize: 12,
  },
});
