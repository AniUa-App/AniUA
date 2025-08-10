import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
} from "react-native";
import { appColor, white, Black, Gray, black } from "../../Styles/Colors";
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
  const [internalValue, setInternalValue] = useState(
    Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)))
  ); // у %
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;
  const hideTimerRef = useRef(null);
  const trackHeightRef = useRef(140);
  const [trackHeight, setTrackHeight] = useState(140);
  const isDraggingRef = useRef(false);
  const startPageYRef = useRef(0);
  const startValueRef = useRef(0);

  useEffect(() => {
    // Синхронізуємо з пропом value, але не під час перетягування
    if (isDraggingRef.current) return;
    const next = Math.max(0, Math.min(100, Math.round((value ?? 0) * 100)));
    setInternalValue(next);
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

  const rescheduleAutoHide = () => {
    if (!visible) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      onClose && onClose();
    }, autoHideMs);
  };

  const applyValue = (percent) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    setInternalValue(clamped);
    const normalized = clamped / 100;
    onChange && onChange(normalized);
  };

  const handleGestureAt = (locationY) => {
    const height = trackHeightRef.current || trackHeight || 140;
    const ratio = 1 - locationY / height; // нижній край = 0, верхній край = 1
    applyValue(ratio * 100);
    rescheduleAutoHide();
  };

  const handleDragMoveByDelta = (pageY) => {
    const height = trackHeightRef.current || trackHeight || 140;
    if (height <= 0) return;
    const deltaPx = startPageYRef.current - pageY; // рух вгору -> +
    const deltaPercent = (deltaPx / height) * 100;
    const next = Math.max(
      0,
      Math.min(100, Math.round(startValueRef.current + deltaPercent))
    );
    applyValue(next);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        startPageYRef.current = evt.nativeEvent.pageY;
        startValueRef.current = internalValue;
        // Миттєво позиціонувати при першому тапі за локальною Y
        handleGestureAt(evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt, gesture) => {
        handleDragMoveByDelta(evt.nativeEvent.pageY);
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
        rescheduleAutoHide();
      },
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
        rescheduleAutoHide();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.overlayContainer}>
      <Animated.View
        style={[styles.tooltip, { opacity, transform: [{ scale }] }]}
      >
        <View
          style={styles.sliderVerticalContainer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height || 140;
            trackHeightRef.current = h;
            setTrackHeight(h);
          }}
          pointerEvents="box-only"
          {...panResponder.panHandlers}
        >
          <View style={[styles.sliderTrack]} pointerEvents="none">
            <View
              style={[
                styles.sliderFill,
                { height: (internalValue / 100) * (trackHeight || 140) },
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.sliderThumb,
                { bottom: (internalValue / 100) * (trackHeight || 140) - 8 },
              ]}
              pointerEvents="none"
            />
          </View>
        </View>

        <View style={styles.arrowContainer}>
          <View style={styles.arrow} />
        </View>
      </Animated.View>
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
    width: 32,
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
  sliderVerticalContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 140,
    width: 16,
  },
  sliderTrack: {
    position: "relative",
    height: "100%",
    width: 6,
    borderRadius: 3,
    backgroundColor: Gray(0.3),
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sliderFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: appColor,
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: appColor,
    left: -3,
    elevation: 3,
  },
  arrowContainer: {
    marginTop: 6,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Black(0.95),
  },
});
