import React, { useEffect, useRef, useCallback } from "react";
import { Animated, StyleSheet } from "react-native";
import { useThemeColors } from "../Global/useTheme";

const NOTIFICATION_HEIGHT = 300;
const ANIMATION_DURATION = 250;
const DISPLAY_TIME = 2000;

function ExpandableNotification({
  message,
  visible,
  onHide,
  style,
  textStyle,
}) {
  const themeColors = useThemeColors();
  const heightAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const animate = useCallback(
    (toValue) => {
      Animated.sequence([
        Animated.timing(heightAnim, {
          toValue: toValue ? NOTIFICATION_HEIGHT : 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: toValue ? 1 : 0,
          duration: ANIMATION_DURATION / 2,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [heightAnim, textOpacity]
  );

  const hideNotification = useCallback(() => {
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION / 2,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  }, [heightAnim, textOpacity, onHide]);

  useEffect(() => {
    if (visible) {
      animate(true);
      const timer = setTimeout(hideNotification, DISPLAY_TIME);
      return () => clearTimeout(timer);
    }
  }, [visible, animate, hideNotification]);

  if (!visible && heightAnim._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.appColor,
          maxHeight: heightAnim,
          opacity: heightAnim.interpolate({
            inputRange: [0, NOTIFICATION_HEIGHT],
            outputRange: [0, 1],
          }),
          ...style,
        },
      ]}
    >
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            opacity: textOpacity,
            color: themeColors.white,
          },
          textStyle,
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default ExpandableNotification;
