import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { useThemeColors } from "../Global/useTheme";
import Color from "color";

// fBM (Fractional Brownian Motion) шейдер
const fbmSource = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float scale;
  uniform float seed;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031 + seed * 0.01);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 6; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  half4 main(vec2 fragCoord) {
    vec2 uv = fragCoord / resolution;
    vec2 p = uv * scale;

    float f = fbm(p);

    vec3 col = mix(color1, color2, f * intensity);

    return half4(col, 1.0);
  }
`);

export default function FBMBackground({
  scale = 6,
  seed = 42,
  intensity = 0.2,
  primaryColor,
  secondaryColor,
}) {
  const { width, height } = useWindowDimensions();
  const themeColors = useThemeColors();

  const color1 = primaryColor || themeColors.background;
  const color2 = secondaryColor || themeColors.primary;

  const parseColor = (color, fallback) => {
    try {
      const c = Color(color);
      return [c.red() / 255, c.green() / 255, c.blue() / 255];
    } catch {
      return fallback;
    }
  };

  const color1Vec = useMemo(() => parseColor(color1, [0.09, 0.11, 0.08]), [color1]);
  const color2Vec = useMemo(() => parseColor(color2, [0.17, 0.49, 0.45]), [color2]);

  const uniforms = useMemo(() => ({
    resolution: vec(width, height),
    scale: scale,
    seed: seed,
    intensity: intensity,
    color1: color1Vec,
    color2: color2Vec,
  }), [width, height, scale, seed, intensity, color1Vec, color2Vec]);

  if (!fbmSource) {
    return <View style={StyleSheet.absoluteFill} />;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill>
        <Shader source={fbmSource} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
