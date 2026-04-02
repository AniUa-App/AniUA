import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useAddDeviceScreenStyles } from "../Styles/components/Screens/AddDeviceScreenStyles";
import Clipboard from "@react-native-clipboard/clipboard";
import { TouchableOpacity } from "../Widgets/Button";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera";
import { useThemeColors } from "../Global/useTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { H2, H5, H6 } from "../Styles/Fonts";
import {
  sendAuth,
  decompressFromBase64,
} from "../Services/QRAuthTransferService";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import Logger from "../Logger/Logger";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import Icons from "../Styles/Icons";
import MainConfig from "../cfgs/MainConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.65;

export default function AddDeviceScreen() {
  const s = useAddDeviceScreenStyles(SCAN_AREA_SIZE);
  const themeColors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [state, setState] = useState("scanning"); // scanning | debug_edit | authenticating | connecting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [debugPayload, setDebugPayload] = useState(null);
  const [debugHost, setDebugHost] = useState("10.0.2.2");
  const scannedRef = useRef(false);
  const insets = useSafeAreaInsets();
  const deepLinkProcessed = useRef(false);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        handleBarCodeScanned({ data: codes[0].value });
      }
    },
  });

  // Обробка deep link: aniua://login/BASE64_DATA
  useEffect(() => {
    const qrData = route.params?.qrData;
    if (qrData && !deepLinkProcessed.current) {
      deepLinkProcessed.current = true;
      try {
        const json = decompressFromBase64(qrData);
        processQRData(json);
      } catch (e) {
        Logger.error("AddDeviceScreen", "Invalid base64 from deep link", e);
        setState("error");
        setErrorMessage("Невірне посилання для входу");
      }
    }
  }, [route.params?.qrData]);

  const processQRData = async (data) => {
    if (scannedRef.current) return;
    scannedRef.current = true;

    try {
      const payload = JSON.parse(data);
      if (payload.v !== 1 || !payload.secret || !payload.port) {
        throw new Error("Invalid QR payload");
      }

      // Крок 1: Авторизація через OAuth для отримання свіжих токенів
      setState("authenticating");
      Logger.info("AddDeviceScreen", "Starting OAuth for transfer...");

      const oauthResult = await HikkaAuthService.startOAuthForTransfer();

      if (!oauthResult.success) {
        scannedRef.current = false;
        setState("error");
        setErrorMessage(oauthResult.error || "Авторизація не вдалася");
        return;
      }

      // Крок 2: Надсилання свіжих токенів на Device B
      setState("connecting");
      Logger.info("AddDeviceScreen", "OAuth done, sending to receiver...", {
        service: payload.service,
      });

      const result = await sendAuth(payload, {
        hikka: oauthResult.hikka,
        aniua: oauthResult.aniua,
      });

      if (result.success) {
        setState("success");
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        setState("error");
        setErrorMessage(result.error || "Не вдалося передати авторизацію");
      }
    } catch (e) {
      Logger.error("AddDeviceScreen", "QR scan error", e);
      setState("error");
      setErrorMessage("Невірний QR-код. Спробуйте ще раз.");
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    // Підтримка aniua://login/BASE64 та https://aniua.app/login/BASE64 форматів
    const prefixes = ["https://aniua.app/login/", "aniua://login/"];
    const prefix = prefixes.find((p) => data.startsWith(p));
    if (prefix) {
      try {
        const json = decompressFromBase64(data.slice(prefix.length));
        await processQRData(json);
        return;
      } catch (e) {
        Logger.error("AddDeviceScreen", "Invalid base64 in QR", e);
      }
    }
    // Fallback: спроба розпарсити як прямий JSON
    await processQRData(data);
  };

  const handlePasteFromClipboard = async () => {
    let text = await Clipboard.getString();
    if (!text) return;
    try {
      // Підтримка aniua://login/BASE64 та https://aniua.app/login/BASE64 форматів
      const prefixes = ["https://aniua.app/login/", "aniua://login/"];
      const prefix = prefixes.find((p) => text.startsWith(p));
      if (prefix) {
        text = decompressFromBase64(text.slice(prefix.length));
      }
      const payload = JSON.parse(text);
      if (payload.v !== 1 || !payload.secret || !payload.port) {
        throw new Error("Invalid QR payload");
      }
      setDebugPayload(payload);
      setDebugHost("10.0.2.2");
      setState("debug_edit");
    } catch (e) {
      Logger.error("AddDeviceScreen", "Invalid clipboard data", e);
      setState("error");
      setErrorMessage("Невірні дані в буфері обміну");
    }
  };

  const handleDebugConnect = async () => {
    if (!debugPayload) return;
    const payload = { ...debugPayload, host: debugHost };
    scannedRef.current = false;
    await processQRData(JSON.stringify(payload));
  };

  const handleRetry = () => {
    scannedRef.current = false;
    setState("scanning");
    setErrorMessage("");
  };

  // Permission denied
  if (!hasPermission) {
    return (
      <DefaultScreenWidget isCheckInternet={false}>
        <View style={s.centeredContainer}>
          <Icons.Camera size={64} color={themeColors.inActiveText} />
          <Text
            style={[
              H5,
              {
                color: themeColors.text,
                marginTop: insets.top + 16,
                textAlign: "center",
              },
            ]}
          >
            Потрібен доступ до камери
          </Text>
          <Text
            style={[
              H6,
              {
                color: themeColors.inActiveText,
                marginTop: 8,
                textAlign: "center",
                paddingHorizontal: 32,
              },
            ]}
          >
            Для сканування QR-коду потрібен дозвіл на використання камери
          </Text>
          <TouchableOpacity
            style={[
              s.permissionButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={requestPermission}
          >
            <Text style={[H5, { color: "#fff" }]}>Надати доступ</Text>
          </TouchableOpacity>
        </View>
      </DefaultScreenWidget>
    );
  }

  // Connecting / Success / Error / Debug edit states
  if (state !== "scanning") {
    return (
      <DefaultScreenWidget isCheckInternet={false}>
        <TouchableOpacity
          style={{
            marginTop: insets.top + 8,
            marginLeft: insets.left + 16,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: themeColors.accent,
            borderRadius: 16,
          }}
          onPress={() => {
            scannedRef.current = false;
            setState("scanning");
          }}
        >
          <Icons.ArrowLeft size={32} color={themeColors.primary} />
        </TouchableOpacity>
        <View style={s.centeredContainer}>
          {state === "debug_edit" && debugPayload && (
            <View style={s.debugEditContainer}>
              <Text
                style={[
                  H2,
                  {
                    color: themeColors.text,
                    fontFamily: "Nunito-Bold",
                    marginBottom: 16,
                  },
                ]}
              >
                DEV: Підключення
              </Text>
              <Text
                style={[
                  H6,
                  { color: themeColors.inActiveText, marginBottom: 4 },
                ]}
              >
                Service: {debugPayload.service}
              </Text>
              <Text
                style={[
                  H6,
                  { color: themeColors.inActiveText, marginBottom: 4 },
                ]}
              >
                Port: {debugPayload.port}
              </Text>
              <Text
                style={[
                  H6,
                  { color: themeColors.inActiveText, marginBottom: 4 },
                ]}
              >
                Original host: {debugPayload.host}
              </Text>
              <Text
                style={[
                  H6,
                  { color: themeColors.text, marginTop: 16, marginBottom: 8 },
                ]}
              >
                Host IP:
              </Text>
              <TextInput
                style={[
                  s.debugInput,
                  { color: themeColors.text, borderColor: themeColors.primary },
                ]}
                value={debugHost}
                onChangeText={setDebugHost}
                placeholder="10.0.2.2"
                placeholderTextColor={themeColors.inActiveText}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
              />
              <Text
                style={[
                  {
                    color: themeColors.inActiveText,
                    fontSize: 11,
                    marginTop: 4,
                    textAlign: "center",
                  },
                ]}
              >
                10.0.2.2 = host machine (emulator){"\n"}
                Для емуляторів: adb forward tcp:{debugPayload.port} tcp:
                {debugPayload.port}
              </Text>
              <TouchableOpacity
                style={[
                  s.debugConnectButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleDebugConnect}
              >
                <Text style={[H5, { color: "#fff" }]}>Підключитися</Text>
              </TouchableOpacity>
            </View>
          )}

          {state === "authenticating" && (
            <>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[H5, { color: themeColors.text, marginTop: 16 }]}>
                Авторизація...
              </Text>
              <Text
                style={[
                  H6,
                  {
                    color: themeColors.inActiveText,
                    marginTop: 8,
                    textAlign: "center",
                  },
                ]}
              >
                Увійдіть в акаунт у вікні браузера
              </Text>
            </>
          )}

          {state === "connecting" && (
            <>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[H5, { color: themeColors.text, marginTop: 16 }]}>
                Передача авторизації...
              </Text>
            </>
          )}

          {state === "success" && (
            <>
              <Icons.CheckCircle
                size={64}
                color={themeColors.primary}
                weight="fill"
              />
              <Text
                style={[
                  H2,
                  {
                    color: themeColors.primary,
                    marginTop: 16,
                    fontFamily: "Nunito-Bold",
                  },
                ]}
              >
                Пристрій додано!
              </Text>
              <Text
                style={[
                  H6,
                  {
                    color: themeColors.inActiveText,
                    marginTop: 8,
                    textAlign: "center",
                  },
                ]}
              >
                Авторизацію успішно передано на новий пристрій
              </Text>
            </>
          )}

          {state === "error" && (
            <>
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
                    paddingHorizontal: 32,
                  },
                ]}
              >
                {errorMessage}
              </Text>
              <TouchableOpacity
                style={[
                  s.retryButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleRetry}
              >
                <Text style={[H5, { color: "#fff" }]}>Спробувати ще раз</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </DefaultScreenWidget>
    );
  }

  // Scanning state — camera
  return (
    <View style={s.fullScreen}>
      {device && (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={state === "scanning"}
          codeScanner={codeScanner}
        />
      )}

      {/* Dark overlay with transparent scanning window */}
      <View style={s.overlayContainer}>
        {/* Top */}
        <View style={[s.overlayPart, { flex: 1 }]} />

        {/* Middle row */}
        <View style={s.middleRow}>
          <View style={[s.overlayPart, { flex: 1 }]} />
          <View style={s.scanWindow}>
            {/* Corner markers */}
            <View
              style={[
                s.corner,
                s.cornerTL,
                { borderColor: themeColors.primary },
              ]}
            />
            <View
              style={[
                s.corner,
                s.cornerTR,
                { borderColor: themeColors.primary },
              ]}
            />
            <View
              style={[
                s.corner,
                s.cornerBL,
                { borderColor: themeColors.primary },
              ]}
            />
            <View
              style={[
                s.corner,
                s.cornerBR,
                { borderColor: themeColors.primary },
              ]}
            />
          </View>
          <View style={[s.overlayPart, { flex: 1 }]} />
        </View>

        {/* Bottom */}
        <View style={[s.overlayPart, { flex: 1 }]} />
      </View>

      {/* Title */}
      <View style={s.topContent}>
        <TouchableOpacity
          style={[s.backButton, { backgroundColor: themeColors.accent }]}
          onPress={() => navigation.goBack()}
        >
          <Icons.ArrowLeft size={32} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[H2, s.scanTitle]}>Сканування QR-коду</Text>
        <Text style={[H6, s.scanSubtitle]}>
          Наведіть камеру на QR-код на екрані нового пристрою
        </Text>
      </View>

      {/* DEV: Paste from clipboard */}
      {MainConfig.debug.isDebug && (
        <View style={s.debugBottomContent}>
          <TouchableOpacity
            style={s.debugPasteButton}
            onPress={handlePasteFromClipboard}
          >
            <Icons.ClipboardText size={18} color="#fff" />
            <Text style={[H6, { color: "#fff", marginLeft: 6 }]}>
              DEV: Вставити з буферу
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
