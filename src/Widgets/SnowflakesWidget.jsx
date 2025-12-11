import React, { useMemo, useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { white } from "../Styles/Colors";
import SettingsStorage from "../Storage/SettingsStorage";
import { EventBus } from "../Global/EventBus";
import { Snowflake as SnowflakeIcon } from "phosphor-react-native";
import { navigationRef } from "../Global/NavigationService";

// Екрани, на яких сніжинки не показуються
const HIDDEN_SCREENS = ["WebVideoPlayer", "LocalVideoPlayer"];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Кількість сніжинок
const SNOWFLAKE_COUNT = 100;

// Генеруємо статичні параметри сніжинок один раз
const generateSnowflakes = () => {
  return Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => {
    // Менші сніжинки падають повільніше (ефект глибини)
    const size = 8 + Math.random() * 20; // 8-28px
    const depthFactor = size / 28; // 0.28-1.0 - чим більша, тим швидша

    return {
      id: i,
      left: Math.random() * 100,
      size,
      opacity: 0.3 + depthFactor * 0.5, // менші - прозоріші (далі)
      // Швидкість залежить від розміру - більші падають швидше
      duration: 12000 + (1 - depthFactor) * 10000 + Math.random() * 4000,
      delay: Math.random() * 8000, // розкидуємо старт більше
      // Параметри хитання
      swayAmount: 20 + Math.random() * 40, // амплітуда
      swaySpeed: 0.3 + Math.random() * 0.4, // швидкість хитання відносно падіння
      swayOffset: Math.random() * Math.PI * 2, // початкова фаза
      // Напрямок обертання
      rotateDirection: Math.random() > 0.5 ? 1 : -1,
      rotateSpeed: 0.5 + Math.random() * 1.5, // швидкість обертання
    };
  });
};

const AnimatedSnowflakeIcon = Animated.createAnimatedComponent(View);

const Snowflake = React.memo(({ config }) => {
  const fallValue = useMemo(() => new Animated.Value(0), []);
  const swayValue = useMemo(() => new Animated.Value(0), []);
  const rotateValue = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    let fallAnimation;
    let swayAnimation;
    let rotateAnimation;

    const runFallCycle = () => {
      fallValue.setValue(0);
      fallAnimation = Animated.timing(fallValue, {
        toValue: 1,
        duration: config.duration,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      });
      fallAnimation.start(({ finished }) => {
        if (finished) {
          runFallCycle();
        }
      });
    };

    const startAnimation = () => {
      // Падіння вниз
      runFallCycle();

      // Хитання вбік - незалежна синусоїдна анімація
      swayAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(swayValue, {
            toValue: 1,
            duration: config.duration * config.swaySpeed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(swayValue, {
            toValue: -1,
            duration: config.duration * config.swaySpeed * 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            isInteraction: false,
          }),
          Animated.timing(swayValue, {
            toValue: 0,
            duration: config.duration * config.swaySpeed,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
            isInteraction: false,
          }),
        ])
      );
      swayAnimation.start();

      // Повільне обертання в випадковому напрямку
      rotateAnimation = Animated.loop(
        Animated.timing(rotateValue, {
          toValue: config.rotateDirection,
          duration: config.duration * config.rotateSpeed,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        })
      );
      rotateAnimation.start();
    };

    const timeout = setTimeout(startAnimation, config.delay);
    return () => {
      clearTimeout(timeout);
      if (fallAnimation) fallAnimation.stop();
      if (swayAnimation) swayAnimation.stop();
      if (rotateAnimation) rotateAnimation.stop();
    };
  }, []);

  const translateY = fallValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-config.size, SCREEN_HEIGHT + config.size],
  });

  const translateX = swayValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-config.swayAmount, 0, config.swayAmount],
  });

  const rotate = rotateValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-360deg", "0deg", "360deg"],
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
      <SnowflakeIcon size={config.size} color={white} weight="regular" />
    </AnimatedSnowflakeIcon>
  );
});

export default function SnowflakesWidget() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHiddenScreen, setIsHiddenScreen] = useState(false);
  const snowflakes = useMemo(() => generateSnowflakes(), []);

  useEffect(() => {
    const userConfig = SettingsStorage.getParameter("userConfig");
    setIsEnabled(userConfig?.effects?.snowflakes ?? false);

    const unsubscribe = EventBus.on("userConfig", (config) => {
      setIsEnabled(config?.effects?.snowflakes ?? false);
    });

    return () => unsubscribe();
  }, []);

  // Відстежуємо зміни навігації для приховування на екранах плеєрів
  useEffect(() => {
    const checkCurrentScreen = () => {
      if (navigationRef.isReady()) {
        const currentRoute = navigationRef.getCurrentRoute()?.name;
        setIsHiddenScreen(HIDDEN_SCREENS.includes(currentRoute));
      }
    };

    // Перевіряємо початковий екран
    checkCurrentScreen();

    // Підписуємось на зміни навігації
    const unsubscribe = navigationRef.addListener?.("state", checkCurrentScreen);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!isEnabled || isHiddenScreen) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {snowflakes.map((config) => (
        <Snowflake key={config.id} config={config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    overflow: "hidden",
  },
  snowflake: {
    position: "absolute",
    top: 0,
  },
});
