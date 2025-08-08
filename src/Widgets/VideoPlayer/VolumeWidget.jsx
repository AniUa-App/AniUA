import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Easing,
} from "react-native";
import { appColor, white, Black, Gray } from "../../Styles/Colors";
import Icons from "../../Styles/Icons";

// Vertical volume tooltip with auto-hide and icon arrow pointer
// Props:
// - visible | isVisible: boolean
// - value: number (0..1)
// - onChange: (v:number)=>void
// - onClose: ()=>void
// - autoHideMs?: number
export default function VolumeWidget(props) {
  const {
    visible: visibleProp,
    isVisible,
    value = 1,
    onChange,
    onClose,
    autoHideMs = 1800,
  } = props;

  const visible = visibleProp ?? isVisible ?? false;

  const [containerHeight, setContainerHeight] = useState(160);
  const [internalValue, setInternalValue] = useState(value);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const hideTimerRef = useRef(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 120,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        onClose && onClose();
      }, autoHideMs);
    } else {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [visible]);

  const valueToY = (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    return (1 - clamped) * containerHeight;
  };

  const yToValue = (y) => {
    const clampedY = Math.max(0, Math.min(containerHeight, y));
    const v = 1 - clampedY / containerHeight;
    return Math.max(0, Math.min(1, v));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gesture) => {
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          const y = evt.nativeEvent.locationY;
          const next = yToValue(y);
          setInternalValue(next);
          onChange && onChange(next);
        },
        onPanResponderMove: (evt, gesture) => {
          const y = evt.nativeEvent.locationY;
          const next = yToValue(y);
          setInternalValue(next);
          onChange && onChange(next);
        },
        onPanResponderRelease: () => {
          // restart auto-hide after interaction
          if (!hideTimerRef.current) {
            hideTimerRef.current = setTimeout(() => {
              onClose && onClose();
            }, autoHideMs);
          }
        },
      }),
    [containerHeight, onChange, onClose, autoHideMs]
  );

  if (!visible) return null;

  const fillHeight = internalValue * containerHeight;

  return (
    <View pointerEvents="box-none" style={styles.overlayContainer}>
      <Animated.View
        style={[styles.tooltip, { opacity, transform: [{ scale }] }]}
      >
        <Text style={styles.valueLabel}>
          {Math.round(internalValue * 100)}%
        </Text>
        <View
          style={styles.sliderContainer}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderTrack} />
          <View style={[styles.sliderFill, { height: fillHeight }]} />
        </View>
      </Animated.View>

      <View style={styles.arrowContainer}>
        <Icons.CaretDown size={20} color={Black(0.95)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    bottom: "100%",
    left: -10,
    right: -10,
    height: 220,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  tooltip: {
    width: 64,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Black(0.95),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  valueLabel: {
    color: white,
    fontFamily: "Nunito-SemiBold",
    fontSize: 12,
    marginBottom: 10,
  },
  sliderContainer: {
    width: 28,
    height: 160,
    borderRadius: 16,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  sliderTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    borderRadius: 16,
    backgroundColor: Gray(0.25),
  },
  sliderFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: appColor,
  },
  arrowContainer: {
    marginTop: 6,
  },
});
