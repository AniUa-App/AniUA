import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { BlurView } from "expo-blur";

interface GradientShadowProps {
  children: ReactNode;
  width: number;
  height: number;
  shadowSize?: number;
  borderRadius?: number;
  startColor?: string;
  endColor?: string;
  opacity?: number;
  blur?: number;
  style?: ViewStyle;
}

export default function GradientShadow({
  children,
  width,
  height,
  shadowSize = 20,
  borderRadius = 18,
  startColor = "#ffffff",
  endColor = "#000000",
  opacity = 0.3,
  blur = 0,
  style,
}: GradientShadowProps) {
  const wrapperWidth = width + shadowSize * 2;
  const wrapperHeight = height + shadowSize * 2;
  const cornerRadius = borderRadius + shadowSize;

  const renderShadowLayer = (
    colors: string[],
    gradientStyle: object,
    start: { x: number; y: number },
    end: { x: number; y: number },
    blurRadius: number
  ) => {
    const gradient = (
      <LinearGradient
        colors={colors}
        style={[gradientStyle, { opacity }]}
        start={start}
        end={end}
      />
    );

    if (blur > 0) {
      return (
        <BlurView
          intensity={blur}
          tint="dark"
          style={[gradientStyle, { overflow: "hidden" }]}
        >
          {gradient}
        </BlurView>
      );
    }

    return gradient;
  };

  return (
    <View
      style={[
        styles.wrapper,
        { width: wrapperWidth, height: wrapperHeight },
        style,
      ]}
    >
      {/* Top (without corners) */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          ...styles.shadowTop,
          width: width,
          height: shadowSize,
          left: shadowSize,
        },
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
        blur
      )}
      {/* Bottom (without corners) */}
      {renderShadowLayer(
        [endColor, startColor],
        {
          ...styles.shadowBottom,
          width: width,
          height: shadowSize,
          left: shadowSize,
        },
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
        blur
      )}
      {/* Left (without corners) */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          ...styles.shadowLeft,
          height: height,
          width: shadowSize,
          top: shadowSize,
        },
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
        blur
      )}
      {/* Right (without corners) */}
      {renderShadowLayer(
        [endColor, startColor],
        {
          ...styles.shadowRight,
          height: height,
          width: shadowSize,
          top: shadowSize,
        },
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
        blur
      )}

      {/* Corner: Top-Left */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          position: "absolute",
          top: 0,
          left: 0,
          width: shadowSize,
          height: shadowSize,
          borderTopLeftRadius: cornerRadius,
        },
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        blur
      )}
      {/* Corner: Top-Right */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          position: "absolute",
          top: 0,
          right: 0,
          width: shadowSize,
          height: shadowSize,
          borderTopRightRadius: cornerRadius,
        },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        blur
      )}
      {/* Corner: Bottom-Left */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          width: shadowSize,
          height: shadowSize,
          borderBottomLeftRadius: cornerRadius,
        },
        { x: 0, y: 1 },
        { x: 1, y: 0 },
        blur
      )}
      {/* Corner: Bottom-Right */}
      {renderShadowLayer(
        [startColor, endColor],
        {
          position: "absolute",
          bottom: 0,
          right: 0,
          width: shadowSize,
          height: shadowSize,
          borderBottomRightRadius: cornerRadius,
        },
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        blur
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  shadowTop: {
    position: "absolute",
    top: 0,
  },
  shadowBottom: {
    position: "absolute",
    bottom: 0,
  },
  shadowLeft: {
    position: "absolute",
    left: 0,
  },
  shadowRight: {
    position: "absolute",
    right: 0,
  },
});
