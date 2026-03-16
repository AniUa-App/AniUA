import React, { useState, useCallback } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "../../Global/useTheme";
import { useTVCardStyles } from "../../Styles/components/TV/TVCardStyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TVCard({ onPress, cardWidth, children, style }) {
  const themeColors = useThemeColors();
  const s = useTVCardStyles();
  const scale = useSharedValue(1);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    scale.value = withTiming(1.05, { duration: 150 });
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
    setIsFocused(false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={[
        s.card,
        cardWidth ? { width: cardWidth } : null,
        style,
        animatedStyle,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

