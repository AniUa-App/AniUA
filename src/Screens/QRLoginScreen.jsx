import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { TouchableOpacity } from "../Widgets/Button";
import QRCodeStyled from "react-native-qrcode-styled";
import { useThemeColors } from "../Global/useTheme";
import { useNavigation } from "@react-navigation/native";
import { H2, H5, H6 } from "../Styles/Fonts";
import { startReceiver } from "../Services/QRAuthTransferService";
import SettingsStorage from "../Storage/SettingsStorage";
import PersonalRecListStorage from "../Storage/PersonalRecListStorage";
import Logger from "../Logger/Logger";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import Icons from "../Styles/Icons";
import * as Network from "expo-network";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MainConfig from "../cfgs/MainConfig";
import { isTV } from "../Styles/Responsive";

export default function QRLoginScreen() {
  const themeColors = useThemeColors();
  const navigation = useNavigation();
  const [state, setState] = useState("generating"); // generating | ready | connecting | success | error | timeout
  const [qrValue, setQrValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const receiverRef = useRef(null);
  const insets = useSafeAreaInsets();

  const startServer = async () => {
    setState("generating");
    setErrorMessage("");

    try {
      // Get local IP for QR payload
      const networkState = await Network.getIpAddressAsync();
      const localIp = networkState;

      const receiver = startReceiver({
        onConnecting: () => setState("connecting"),
        onSuccess: () => {
          setState("success");
          // Встановлюємо токен в API клієнт (інакше API не знає про новий токен до рестарту)
          HikkaAuthService.initialize();
          // Complete onboarding and navigate
          SettingsStorage.setParameter("hasCompletedOnboarding", true);
          PersonalRecListStorage.initializeDefaultLists();
          const userConfig = SettingsStorage.getParameter("userConfig") || {};
          SettingsStorage.setParameter("userConfig", {
            ...userConfig,
            recommendations: {
              ...userConfig.recommendations,
              isCustomedPersonalRecommendations: true,
              isDefaultBigBanner: true,
            },
          });
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          }, 1500);
        },
        onError: (msg) => {
          setState("error");
          setErrorMessage(msg);
        },
        onTimeout: () => setState("timeout"),
      });

      receiverRef.current = receiver;

      // Override host with actual local IP
      const payload = {
        ...receiver.qrPayload,
        host: localIp,
      };

      const jsonStr = JSON.stringify(payload);
      const base64 = btoa(jsonStr);
      setQrValue(`https://aniua.yuzka.site/login/${base64}`);
      setState("ready");
    } catch (e) {
      Logger.error("QRLoginScreen", "Failed to start receiver", e);
      setState("error");
      setErrorMessage("Не вдалося запустити сервер");
    }
  };

  useEffect(() => {
    startServer();
    return () => {
      receiverRef.current?.stop();
    };
  }, []);

  const handleRetry = () => {
    receiverRef.current?.stop();
    startServer();
  };

  return (
    <DefaultScreenWidget isCheckInternet={false} isNavBarPadding={!isTV()}>
      <View style={[styles.container, { marginTop: insets.top }]}>
        {/* Back button */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: themeColors.accent }]}
          onPress={() => navigation.goBack()}
        >
          <Icons.ArrowLeft size={32} color={themeColors.primary} />
        </TouchableOpacity>

        <Text style={[H2, styles.title, { color: themeColors.text }]}>
          Вхід по QR-коду
        </Text>

        <Text
          style={[H6, styles.subtitle, { color: themeColors.inActiveText }]}
        >
          {state === "ready" &&
            "Відскануйте цей QR-код з пристрою, на якому ви вже авторизовані."}
          {state === "generating" && "Підготовка..."}
          {state === "connecting" && "Пристрій підключається..."}
          {state === "success" && "Авторизацію передано!"}
          {state === "error" && (errorMessage || "Сталася помилка")}
          {state === "timeout" && "Час очікування вичерпано"}
        </Text>

        <View style={styles.qrContainer}>
          {state === "generating" && (
            <ActivityIndicator size="large" color={themeColors.primary} />
          )}

          {state === "ready" && qrValue && (
            <>
              <View
                style={[
                  styles.qrWrapper,
                  { backgroundColor: themeColors.accent },
                ]}
              >
                <QRCodeStyled
                  data={qrValue}
                  style={{ backgroundColor: themeColors.accent }}
                  padding={0}
                  pieceSize={6}
                  size={240}
                  color={themeColors.primary}
                  isPiecesGlued
                  pieceBorderRadius={3}
                  pieceCornerType="rounded"
                  outerEyesOptions={{
                    borderRadius: [12, 12, 12, 12],
                    color: themeColors.primary,
                  }}
                  innerEyesOptions={{
                    borderRadius: 6,
                    color: themeColors.primary,
                  }}
                  pieceLiquidRadius={12}
                />
              </View>
              {MainConfig.debug.isDebug && (
                <View style={styles.debugContainer}>
                  <TouchableOpacity
                    style={[
                      styles.debugCopyButton,
                      { borderColor: themeColors.primary },
                    ]}
                    onPress={() => {
                      Clipboard.setString(qrValue);
                      Logger.debug(
                        "QRLoginScreen",
                        "QR payload copied to clipboard",
                      );
                    }}
                  >
                    <Icons.Copy size={18} color={themeColors.primary} />
                    <Text
                      style={[
                        H6,
                        { color: themeColors.primary, marginLeft: 6 },
                      ]}
                    >
                      DEV: Копіювати
                    </Text>
                  </TouchableOpacity>
                  <Text
                    selectable={true}
                    style={[
                      {
                        color: themeColors.inActiveText,
                        fontSize: 11,
                        marginTop: 8,
                        textAlign: "center",
                      },
                    ]}
                  >
                    {`adb forward tcp:${receiverRef.current?.qrPayload?.port} tcp:${receiverRef.current?.qrPayload?.port}`}
                  </Text>
                </View>
              )}
            </>
          )}

          {state === "connecting" && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[H6, { color: themeColors.text, marginTop: 16 }]}>
                Отримання даних...
              </Text>
            </View>
          )}

          {state === "success" && (
            <View style={styles.statusContainer}>
              <Icons.CheckCircle
                size={64}
                color={themeColors.primary}
                weight="fill"
              />
              <Text style={[H5, { color: themeColors.primary, marginTop: 16 }]}>
                Успішно!
              </Text>
            </View>
          )}

          {(state === "error" || state === "timeout") && (
            <View style={styles.statusContainer}>
              <Icons.WarningCircle
                size={64}
                color={themeColors.redBookmark || "#ff4444"}
              />
              <Text
                style={[
                  H6,
                  {
                    color: themeColors.inActiveText,
                    marginTop: 16,
                    textAlign: "center",
                  },
                ]}
              >
                {state === "timeout"
                  ? "QR-код більше не дійсний"
                  : errorMessage}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleRetry}
              >
                <Text style={[H5, { color: "#fff" }]}>Спробувати ще раз</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {state === "ready" && (
          <>
            <Text
              style={[H6, styles.hint, { color: themeColors.inActiveText }]}
            >
              Налаштування {"\u2192"} Додати пристрій
            </Text>
          </>
        )}
      </View>
      <Text style={[H6, styles.hint, { color: themeColors.redBookmark }]}>
        Обидва пристрої мають бути в одній мережі (один WiFi)
      </Text>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8,
    width: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    height: 44,
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "white",
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  hint: {
    marginTop: 24,
    textAlign: "center",
  },
  debugContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  debugCopyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
