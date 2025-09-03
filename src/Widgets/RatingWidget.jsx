import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { H2, H3, H4, H5 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import Icons from "../Styles/Icons";

const RatingWidget = ({
  title = "Оцініть застосунок",
  onRatingSubmit,
  onClose,
  initialRating = 4,
  buttonText = "Ok",
  showTitle = true,
  style,
  visible = true,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [feedback, setFeedback] = useState("");
  const themeColors = useThemeColors();

  // Анімація появи
  const fade = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const backdrop = useSharedValue(0);
  const slide = useSharedValue(50);

  // Масштаби зірок
  const starScale0 = useSharedValue(1);
  const starScale1 = useSharedValue(1);
  const starScale2 = useSharedValue(1);
  const starScale3 = useSharedValue(1);
  const starScale4 = useSharedValue(1);
  const starScales = [
    starScale0,
    starScale1,
    starScale2,
    starScale3,
    starScale4,
  ];

  // Стилі анімацій
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -188.5 },
      { translateY: -102 + slide.value },
      { scale: scale.value },
    ],
    opacity: fade.value,
  }));

  // Відкласти перший показ до наступного кадру, щоб уникнути insertion-ефекту
  const [didMount, setDidMount] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDidMount(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!visible || !didMount) return;

    // Скидаємо значення, щоб уникнути артефактів
    fade.value = 0;
    scale.value = 0.3;
    backdrop.value = 0;
    slide.value = 50;

    // Відкладаємо запуск анімацій на наступні кадри,
    // щоб уникнути оновлень під час вставки стилів (useInsertionEffect warning)
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        backdrop.value = withTiming(1, { duration: 150 });
        fade.value = withDelay(
          20,
          withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })
        );
        scale.value = withDelay(
          40,
          withSpring(1, { stiffness: 600, damping: 22, mass: 1 })
        );
        slide.value = withDelay(
          60,
          withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) })
        );
      });
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [visible, didMount]);

  const handleClose = () => {
    // Анімація зникнення
    fade.value = withTiming(0, { duration: 120 }, (finished) => {
      if (finished && onClose) {
        runOnJS(onClose)(rating);
      }
    });
    scale.value = withTiming(0.8, { duration: 120 });
    backdrop.value = withTiming(0, { duration: 150 });
  };

  const handleStarPress = (starIndex) => {
    const newRating = starIndex + 1;
    setRating(newRating);

    // Анімація натискання
    const sv = starScales[starIndex];
    sv.value = withSequence(
      withTiming(1.1, { duration: 70 }),
      withTiming(1, { duration: 70 })
    );
  };

  const handleSubmit = () => {
    if (onRatingSubmit) {
      onRatingSubmit(rating, feedback);
    }
    handleClose();
  };

  const StarItem = ({ index, isFilled, onPress, scaleSV, themeColors }) => {
    const starStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scaleSV.value }],
    }));
    return (
      <TouchableOpacity
        key={index}
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          marginHorizontal: 16,
        }}
      >
        <Animated.View style={starStyle}>
          <Icons.Star
            width={28}
            height={28}
            color={isFilled ? themeColors.appColor : themeColors.white}
            weight={isFilled ? "fill" : "regular"}
            strokeWidth={2}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return (
        <StarItem
          key={index}
          index={index}
          isFilled={isFilled}
          onPress={() => handleStarPress(index)}
          scaleSV={starScales[index]}
          themeColors={themeColors}
        />
      );
    });
  };

  if (!visible || !didMount) return null;

  return (
    <>
      {/* Анімований backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: themeColors.Black(0.6),
            zIndex: 10,
          },
          backdropStyle,
        ]}
      >
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Анімований контейнер віджета */}
      <Animated.View
        style={[
          {
            backgroundColor: themeColors.black_1,
            position: "absolute",
            top: "50%",
            left: "50%",
            borderRadius: 8,
            alignItems: "center",
            width: 377,
            height: 204,
            alignSelf: "center",
            justifyContent: "center",
            zIndex: 11,
          },
          containerStyle,
          style,
        ]}
      >
        {showTitle && (
          <Text
            style={[
              H3,
              {
                color: themeColors.gray,
                marginBottom: 8,
                textAlign: "center",
              },
            ]}
          >
            {title}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {renderStars()}
        </View>

        <TextInput
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Напишіть ваші побажання"
          placeholderTextColor={
            themeColors.Gray ? themeColors.Gray(0.6) : themeColors.white
          }
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{
            width: 329,
            height: 72,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: themeColors.black,
            color: themeColors.white,
            marginBottom: 10,
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: themeColors.appColor,
            borderRadius: 8,
            height: 31,
            width: 74,
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              H5,
              {
                color: themeColors.white,
                fontWeight: "600",
              },
            ]}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default RatingWidget;
