import React from "react";
import { View, Text, StyleSheet, Dimensions, Linking } from "react-native";
import { background, Subtle, text, Primary } from "../Styles/Colors";
import { H2, H3, H4 } from "../Styles/Fonts";
import { TouchableOpacity } from "./Button";
import Icon, { WiFiIcon } from "../Styles/Icons";
import MainConfig from "../cfgs/MainConfig";

export const ErrorWidget = ({ title = "Помилка", message, onRetry }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.errorIcon}>
          <Text selectable={true} style={H3}>
            😕
          </Text>
        </View>
        <Text selectable={true} style={[H2, styles.title]}>
          Щось пішло не так...
        </Text>
        <Text selectable={true} style={[H4, styles.subtitle]}>
          {message}
        </Text>

        {onRetry && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() =>
                Linking.openURL(
                  `${MainConfig.urls.supportBotUrl}?startapp=${MainConfig.telegramBotArgs.reportBug}`
                )
              }
            >
              <Text selectable={true} style={[H4, styles.secondaryButtonText]}>
                Надіслати помилку
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onRetry}
            >
              <Text selectable={true} style={[H4, styles.primaryButtonText]}>
                Спробувати знову
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: background,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorIcon: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 50,
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
    textAlign: "center",
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "80%",
    maxWidth: 280,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: Subtle(1),
  },
  primaryButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: Primary(0.9),
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "500",
    fontSize: 16,
  },
});

export function InternetError({ onPress }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.errorIcon}>
          <WiFiIcon color={text} width={48} height={48} />
        </View>
        <Text selectable={true} style={[H2, styles.title]}>
          Проблеми з мережею
        </Text>
        <Text selectable={true} style={[H4, styles.subtitle]}>
          Перевірте підключення до інтернету
        </Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onPress}
        >
          <View style={styles.refreshButtonContent}>
            <Icon.ArrowClockwise size={20} color={text} />
            <Text
              selectable={true}
              style={[H4, styles.primaryButtonText, { marginLeft: 8 }]}
            >
              Спробувати знову
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Додаємо стиль для кнопки з іконкою
const refreshButtonContentStyle = StyleSheet.create({
  refreshButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Додаємо стиль до основних стилів
styles.refreshButtonContent = refreshButtonContentStyle.refreshButtonContent;
