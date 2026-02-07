import { useRef, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";

interface Tab {
  id: string;
  icon: string;
}

interface AnimatedTabButtonProps {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  colors: {
    accent: string;
    activeIcon: string;
    icon: string;
  };
  orientation?: "horizontal" | "vertical";
}

export default function AnimatedTabButton({
  tab,
  isActive,
  onPress,
  colors,
  orientation = "vertical",
}: AnimatedTabButtonProps) {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 10,
    }).start();
  }, [isActive]);

  const Icon = Icons[tab.icon];

  const animatedSize = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 46],
  });

  const animatedBorderRadius = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });

  const animatedTopBorderRadius = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 16],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.tabItem,
          {
            backgroundColor: colors.accent,
            width: animatedSize,
            height: animatedSize,
          },
          orientation === "horizontal" && {
            borderTopLeftRadius: animatedTopBorderRadius,
            borderTopRightRadius: animatedTopBorderRadius,
            borderBottomLeftRadius: animatedBorderRadius,
            borderBottomRightRadius: animatedBorderRadius,
          },
          orientation === "vertical" && {
            borderTopLeftRadius: animatedTopBorderRadius,
            borderTopRightRadius: animatedBorderRadius,
            borderBottomLeftRadius: animatedTopBorderRadius,
            borderBottomRightRadius: animatedBorderRadius,
          },
        ]}
      >
        <Icon size={28} color={isActive ? colors.activeIcon : colors.icon} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
