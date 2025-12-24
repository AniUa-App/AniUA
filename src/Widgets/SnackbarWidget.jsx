import React, { useEffect } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  View,
  Linking,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeInUp,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useThemeColors } from "../Global/useTheme";
import { H6 } from "../Styles/Fonts";
import Icons from "../Styles/Icons";
import Logger from "../Logger/Logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DISMISS_THRESHOLD = SCREEN_WIDTH * 0.3;

/**
 * Material Design 3 Snackbar Component
 *
 * @param {Object} props
 * @param {string|React.ReactNode} props.message - Текст повідомлення або React компонент
 * @param {string} props.actionLabel - Текст кнопки action (опціонально)
 * @param {Function} props.onActionPress - Callback при натисканні на action
 * @param {number} props.duration - Тривалість показу в мс (за замовчуванням 4000)
 * @param {Function} props.onDismiss - Callback при закритті
 * @param {boolean} props.visible - Видимість snackbar
 * @param {string} props.position - Позиція snackbar: "bottom" або "top" (за замовчуванням "bottom")
 */
export default function Snackbar({
  message,
  actionLabel,
  onActionPress,
  duration = 4000,
  onDismiss,
  visible = false,
  position = "bottom",
}) {
  const themeColors = useThemeColors();
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  // Рендер повідомлення (підтримка як строк, так і React компонентів)
  const renderMessage = () => {
    if (typeof message === "string" || typeof message === "number") {
      return (
        <Text style={[H6, styles.message, { color: themeColors.text }]}>
          {String(message)}
        </Text>
      );
    }

    if (message == null || typeof message === "boolean") {
      return null;
    }

    return <View style={styles.message}>{message}</View>;
  };

  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleActionPress = () => {
    opacity.value = withTiming(0.5, { duration: 100 }, () => {
      opacity.value = withTiming(1, { duration: 100 });
    });
    onActionPress?.();
    // Закриваємо snackbar після виконання action
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  const handleClose = () => {
    onDismiss?.();
  };

  // Swipe gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onEnd((event) => {
      const shouldDismiss =
        Math.abs(translateX.value) > DISMISS_THRESHOLD ||
        Math.abs(event.velocityX) > 1000;

      if (shouldDismiss) {
        // Анімація вильоту в бік свайпу
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(
          direction * SCREEN_WIDTH,
          {
            damping: 20,
            stiffness: 90,
          },
          () => {
            runOnJS(handleClose)();
          }
        );
      } else {
        // Повернення на місце
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  const animatedSwipeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: withTiming(1 - Math.abs(translateX.value) / SCREEN_WIDTH, {
        duration: 100,
      }),
    };
  });

  if (!visible) return null;

  const isTop = position === "top";
  const backgroundColor = isTop ? themeColors.primary : themeColors.subtle;

  return (
    <Animated.View
      entering={
        isTop
          ? FadeInUp.duration(400).easing(Easing.out(Easing.cubic))
          : FadeInDown.duration(400).easing(Easing.out(Easing.cubic))
      }
      exiting={
        isTop
          ? FadeOutUp.duration(300).easing(Easing.in(Easing.cubic))
          : FadeOutDown.duration(300).easing(Easing.in(Easing.cubic))
      }
      style={[
        styles.container,
        isTop ? styles.containerTop : styles.containerBottom,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.snackbar, { backgroundColor }, animatedSwipeStyle]}
        >
          {renderMessage()}

          <View style={styles.actionsContainer}>
            {actionLabel ? (
              <Pressable onPress={handleActionPress}>
                <Animated.View
                  style={[styles.actionButton, animatedButtonStyle]}
                >
                  <Text
                    style={[
                      H6,
                      styles.actionText,
                      {
                        color: isTop ? themeColors.text : themeColors.primary,
                      },
                    ]}
                  >
                    {actionLabel}
                  </Text>
                </Animated.View>
              </Pressable>
            ) : (
              <Pressable onPress={handleClose} style={styles.closeButton}>
                <Icons.X
                  size={24}
                  color={isTop ? themeColors.text : themeColors.primary}
                />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/**
 * Helper компонент для створення посилання в snackbar
 */
export function SnackbarLink({ children, url, color }) {
  Logger.debug("SnackbarLink", "URL", { url });
  const handlePress = () => {
    Logger.debug("SnackbarLink", "Link pressed");
    Linking.openURL(url).catch((err) =>
      Logger.error("SnackbarLink", "Failed to open URL", err)
    );
  };

  return (
    <Text
      onPress={handlePress}
      suppressHighlighting={false}
      style={[styles.link, { color }]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  containerBottom: {
    bottom: 100,
  },
  containerTop: {
    top: 24,
  },
  snackbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 12,
    borderRadius: 12,
  },
  message: {
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontFamily: "Nunito-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 13,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    textDecorationLine: "underline",
    fontFamily: "Nunito-Bold",
  },
});
