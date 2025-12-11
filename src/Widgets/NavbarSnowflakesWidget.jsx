import React, { useMemo, useEffect, useState } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { white } from "../Styles/Colors";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import { Snowflake as SnowflakeIcon } from "phosphor-react-native";

// Кількість сніжинок для navbar - менше, бо менший простір
const NAVBAR_SNOWFLAKE_COUNT = 8;

// Генеруємо статичні параметри сніжинок
const generateNavbarSnowflakes = () => {
  return Array.from({ length: NAVBAR_SNOWFLAKE_COUNT }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90, // відсоток від ширини (5-95%)
    size: 8 + Math.random() * 8, // 8-16px (менші для navbar)
    opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
    duration: 4000 + Math.random() * 3000, // 4-7 секунд (швидше)
    delay: Math.random() * 3000, // затримка 0-3 секунд
    swayAmount: 8 + Math.random() * 12, // менша амплітуда хитання
  }));
};

const AnimatedSnowflakeIcon = Animated.createAnimatedComponent(View);

const NavbarSnowflake = React.memo(({ config, containerHeight }) => {
  const animValue = useMemo(() => new Animated.Value(0), []);
  const rotateValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const startAnimation = () => {
      animValue.setValue(0);
      rotateValue.setValue(0);

      // Анімація падіння
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: config.duration,
          useNativeDriver: true,
          isInteraction: false,
        })
      ).start();

      // Повільне обертання
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: config.duration * 2,
          useNativeDriver: true,
          isInteraction: false,
        })
      ).start();
    };

    const timeout = setTimeout(startAnimation, config.delay);
    return () => clearTimeout(timeout);
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.size, containerHeight + config.size],
  });

  const translateX = animValue.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, config.swayAmount, 0, -config.swayAmount, 0],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <AnimatedSnowflakeIcon
      style={[
        styles.snowflake,
        {
          left: `${config.left}%`,
          opacity: config.opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
    >
      <SnowflakeIcon size={config.size} color={white} weight="thin" />
    </AnimatedSnowflakeIcon>
  );
});

export default function NavbarSnowflakesWidget({ containerHeight = 70 }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const snowflakes = useMemo(() => generateNavbarSnowflakes(), []);

  useEffect(() => {
    const userConfig = SettingsStorage.getParameter("userConfig");
    setIsEnabled(userConfig?.effects?.snowflakes ?? false);

    const unsubscribe = EventBus.on("userConfig", (config) => {
      setIsEnabled(config?.effects?.snowflakes ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (!isEnabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((config) => (
        <NavbarSnowflake
          key={config.id}
          config={config}
          containerHeight={containerHeight}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    overflow: "hidden",
  },
  snowflake: {
    position: "absolute",
    top: 0,
  },
});
