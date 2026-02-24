// Web version — no camera, only clipboard paste
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { TouchableOpacity } from "../Widgets/Button";
import { useThemeColors } from "../Global/useTheme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { H2, H5, H6 } from "../Styles/Fonts";
import { sendAuth, decompressFromBase64 } from "../Services/QRAuthTransferService";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import Logger from "../Logger/Logger";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import Icons from "../Styles/Icons";
import MainConfig from "../cfgs/MainConfig";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddDeviceScreen() {
  const themeColors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const [state, setState] = useState("input"); // input | debug_edit | authenticating | connecting | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [debugPayload, setDebugPayload] = useState(null);
  const [debugHost, setDebugHost] = useState("localhost");
  const scannedRef = useRef(false);
  const insets = useSafeAreaInsets();
  const deepLinkProcessed = useRef(false);

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

      setState("authenticating");
      Logger.info("AddDeviceScreen", "Starting OAuth for transfer...");

      const oauthResult = await HikkaAuthService.startOAuthForTransfer();

      if (!oauthResult.success) {
        scannedRef.current = false;
        setState("error");
        setErrorMessage(oauthResult.error || "Авторизація не вдалася");
        return;
      }

      setState("connecting");
      Logger.info("AddDeviceScreen", "OAuth done, sending to receiver...");

      const result = await sendAuth(payload, {
        hikka: oauthResult.hikka,
        aniua: oauthResult.aniua,
      });

      if (result.success) {
        setState("success");
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        setState("error");
        setErrorMessage(result.error || "Не вдалося передати авторизацію");
      }
    } catch (e) {
      Logger.error("AddDeviceScreen", "QR data error", e);
      setState("error");
      setErrorMessage("Невірні дані. Спробуйте ще раз.");
    }
  };

  const handleSubmitInput = async () => {
    if (!inputValue.trim()) return;
    let text = inputValue.trim();
    try {
      const prefixes = ["https://aniua.yuzka.site/login/", "aniua://login/"];
      const prefix = prefixes.find((p) => text.startsWith(p));
      if (prefix) {
        text = decompressFromBase64(text.slice(prefix.length));
      }
      await processQRData(text);
    } catch (e) {
      Logger.error("AddDeviceScreen", "Invalid input data", e);
      setState("error");
      setErrorMessage("Невірні дані. Спробуйте ще раз.");
    }
  };

  const handlePasteFromClipboard = async () => {
    let text = await Clipboard.getString();
    if (!text) return;
    setInputValue(text);
  };

  const handleRetry = () => {
    scannedRef.current = false;
    setState("input");
    setErrorMessage("");
    setInputValue("");
  };

  if (state !== "input") {
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
            setState("input");
          }}
        >
          <Icons.ArrowLeft size={32} color={themeColors.primary} />
        </TouchableOpacity>
        <View style={styles.centeredContainer}>
          {state === "debug_edit" && debugPayload && (
            <View style={styles.debugEditContainer}>
              <Text style={[H2, { color: themeColors.text, fontFamily: "Nunito-Bold", marginBottom: 16 }]}>
                DEV: Підключення
              </Text>
              <Text style={[H6, { color: themeColors.inActiveText, marginBottom: 4 }]}>
                Service: {debugPayload.service}
              </Text>
              <Text style={[H6, { color: themeColors.inActiveText, marginBottom: 4 }]}>
                Port: {debugPayload.port}
              </Text>
              <Text style={[H6, { color: themeColors.text, marginTop: 16, marginBottom: 8 }]}>
                Host IP:
              </Text>
              <TextInput
                style={[styles.debugInput, { color: themeColors.text, borderColor: themeColors.primary }]}
                value={debugHost}
                onChangeText={setDebugHost}
                placeholder="localhost"
                placeholderTextColor={themeColors.inActiveText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.primary }]}
                onPress={async () => {
                  const payload = { ...debugPayload, host: debugHost };
                  scannedRef.current = false;
                  await processQRData(JSON.stringify(payload));
                }}
              >
                <Text style={[H5, { color: "#fff" }]}>Підключитися</Text>
              </TouchableOpacity>
            </View>
          )}
          {state === "authenticating" && (
            <>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[H5, { color: themeColors.text, marginTop: 16 }]}>Авторизація...</Text>
              <Text style={[H6, { color: themeColors.inActiveText, marginTop: 8, textAlign: "center" }]}>
                Увійдіть в акаунт у вікні браузера
              </Text>
            </>
          )}
          {state === "connecting" && (
            <>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={[H5, { color: themeColors.text, marginTop: 16 }]}>Передача авторизації...</Text>
            </>
          )}
          {state === "success" && (
            <>
              <Icons.CheckCircle size={64} color={themeColors.primary} weight="fill" />
              <Text style={[H2, { color: themeColors.primary, marginTop: 16, fontFamily: "Nunito-Bold" }]}>
                Пристрій додано!
              </Text>
              <Text style={[H6, { color: themeColors.inActiveText, marginTop: 8, textAlign: "center" }]}>
                Авторизацію успішно передано на новий пристрій
              </Text>
            </>
          )}
          {state === "error" && (
            <>
              <Icons.WarningCircle size={64} color={themeColors.redBookmark || "#ff4444"} />
              <Text style={[H6, { color: themeColors.inActiveText, marginTop: 16, textAlign: "center", paddingHorizontal: 32 }]}>
                {errorMessage}
              </Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColors.primary }]}
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

  return (
    <DefaultScreenWidget isCheckInternet={false}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: themeColors.accent, borderRadius: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Icons.ArrowLeft size={32} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.centeredContainer}>
        <Icons.DeviceMobile size={64} color={themeColors.primary} weight="fill" />
        <Text style={[H2, { color: themeColors.text, fontFamily: "Nunito-Bold", marginTop: 16, textAlign: "center" }]}>
          Додати пристрій
        </Text>
        <Text style={[H6, { color: themeColors.inActiveText, marginTop: 8, textAlign: "center", paddingHorizontal: 32 }]}>
          Відкрийте AniUA на Android, перейдіть в налаштування та скопіюйте посилання для входу
        </Text>
        <View style={[styles.inputContainer, { borderColor: themeColors.accent }]}>
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Вставте посилання aniua://login/..."
            placeholderTextColor={themeColors.inActiveText}
            autoCapitalize="none"
            autoCorrect={false}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.pasteButton, { backgroundColor: themeColors.accent }]}
            onPress={handlePasteFromClipboard}
          >
            <Icons.ClipboardText size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: inputValue.trim() ? themeColors.primary : themeColors.accent, marginTop: 16 }]}
          onPress={handleSubmitInput}
          disabled={!inputValue.trim()}
        >
          <Text style={[H5, { color: inputValue.trim() ? "#fff" : themeColors.inActiveText }]}>
            Підключитися
          </Text>
        </TouchableOpacity>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 24,
    width: "100%",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "Nunito-SemiBold",
  },
  pasteButton: {
    padding: 14,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginTop: 12,
  },
  debugEditContainer: {
    alignItems: "center",
    width: "100%",
  },
  debugInput: {
    width: "80%",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Nunito-SemiBold",
  },
});
