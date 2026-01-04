import React, { useEffect, useState } from "react";
import { View, Image as RNImage } from "react-native";
import {
  Canvas,
  Image,
  useImage,
  Blur,
  ColorMatrix,
  Group,
  rrect,
  rect,
  Mask,
  Rect,
  LinearGradient,
  RadialGradient,
  vec,
  Skia,
} from "@shopify/react-native-skia";

// Глобальний кеш для Skia зображень
const imageCache = new Map();

/**
 * Prefetch зображення для швидкого відображення
 * Викликайте цю функцію перед переходом на екран з BloomImage
 * @param {string} uri - URI зображення для prefetch
 * @returns {Promise<void>}
 */
export async function prefetchBloomImage(uri) {
  if (!uri || imageCache.has(uri)) return;

  try {
    // Prefetch через React Native Image (кешує на диск)
    await RNImage.prefetch(uri);

    // Завантажуємо в Skia кеш
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const skiaImage = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(data)
    );

    if (skiaImage) {
      imageCache.set(uri, skiaImage);
    }
  } catch (error) {
    console.warn("BloomImage prefetch failed:", error);
  }
}

/**
 * BloomImage - Компонент зображення з ефектом bloom (glow + blur) за допомогою Skia
 *
 * @param {string} uri - URI зображення
 * @param {number} width - Ширина зображення
 * @param {number} height - Висота зображення
 * @param {number} borderRadius - Радіус заокруглення (за замовчуванням: 16)
 * @param {number} blurBorderRadius - Радіус заокруглення для blur шару (за замовчуванням: borderRadius)
 * @param {number} blurRadius - Радіус розмиття для ефекту glow (за замовчуванням: 10)
 * @param {number} glowScale - Масштаб шару glow (за замовчуванням: 1.03)
 * @param {number} glowOpacity - Прозорість шару glow (за замовчуванням: 1)
 * @param {number} fadePercent - Відсоток градієнту від краю (0.2 = 20% градієнт, 80% повністю видиме)
 * @param {Object} style - Додаткові стилі для контейнера
 */
export default function BloomImage({
  uri,
  width,
  height,
  borderRadius = 16,
  blurBorderRadius,
  blurRadius = 10,
  glowScale = 1.03,
  glowOpacity = 2,
  fadePercent = 0.2,
  style,
}) {
  const effectiveBlurBorderRadius = blurBorderRadius ?? borderRadius;
  // Спробуємо отримати з кешу або завантажити через useImage
  const [cachedImage] = useState(() => imageCache.get(uri));
  const loadedImage = useImage(uri);

  // Якщо завантажилось через useImage - додаємо в кеш
  useEffect(() => {
    if (loadedImage && !imageCache.has(uri)) {
      imageCache.set(uri, loadedImage);
    }
  }, [loadedImage, uri]);

  // Використовуємо кешоване або завантажене зображення
  const image = cachedImage || loadedImage;

  if (!image) {
    return (
      <View style={[{ width, height }, style]}>
        <View
          style={{
            width,
            height,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        />
      </View>
    );
  }

  // Розрахунок відступу для glow (наскільки glow виходить за межі зображення)
  const glowPadding = Math.max(blurRadius * 1.5, (glowScale - 1) * width);

  // Розміри Canvas - розмір зображення плюс відступ для glow з усіх сторін
  const canvasWidth = width + glowPadding * 2;
  const canvasHeight = height + glowPadding * 2;

  // Позиція основного зображення (по центру Canvas)
  const imageX = glowPadding;
  const imageY = glowPadding;

  // Розміри шару glow (трохи більше за основне зображення)
  const glowWidth = width * glowScale;
  const glowHeight = height * glowScale;
  const glowX = imageX - (glowWidth - width) / 2;
  const glowY = imageY - (glowHeight - height) / 2;

  // Розмір градієнту - однаковий для всіх сторін (базується на меншому розмірі)
  const fadeSize = Math.min(glowWidth, glowHeight) * fadePercent;

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      {/* Шар glow - масштабований та розмитий, із заокругленнями та прямокутним градієнтом */}
      <Mask
        mask={
          <Group>
            {/* Центральна частина - повністю видима */}
            <Rect
              x={glowX + fadeSize}
              y={glowY + fadeSize}
              width={glowWidth - fadeSize * 2}
              height={glowHeight - fadeSize * 2}
              color="white"
            />
            {/* Верхній градієнт */}
            <Rect
              x={glowX + fadeSize}
              y={glowY}
              width={glowWidth - fadeSize * 2}
              height={fadeSize}
            >
              <LinearGradient
                start={vec(0, glowY)}
                end={vec(0, glowY + fadeSize)}
                colors={["transparent", "white"]}
              />
            </Rect>
            {/* Нижній градієнт */}
            <Rect
              x={glowX + fadeSize}
              y={glowY + glowHeight - fadeSize}
              width={glowWidth - fadeSize * 2}
              height={fadeSize}
            >
              <LinearGradient
                start={vec(0, glowY + glowHeight)}
                end={vec(0, glowY + glowHeight - fadeSize)}
                colors={["transparent", "white"]}
              />
            </Rect>
            {/* Лівий градієнт */}
            <Rect
              x={glowX}
              y={glowY + fadeSize}
              width={fadeSize}
              height={glowHeight - fadeSize * 2}
            >
              <LinearGradient
                start={vec(glowX, 0)}
                end={vec(glowX + fadeSize, 0)}
                colors={["transparent", "white"]}
              />
            </Rect>
            {/* Правий градієнт */}
            <Rect
              x={glowX + glowWidth - fadeSize}
              y={glowY + fadeSize}
              width={fadeSize}
              height={glowHeight - fadeSize * 2}
            >
              <LinearGradient
                start={vec(glowX + glowWidth, 0)}
                end={vec(glowX + glowWidth - fadeSize, 0)}
                colors={["transparent", "white"]}
              />
            </Rect>
            {/* Кути - радіальні градієнти */}
            {/* Верхній лівий кут */}
            <Rect x={glowX} y={glowY} width={fadeSize} height={fadeSize}>
              <RadialGradient
                c={vec(glowX + fadeSize, glowY + fadeSize)}
                r={fadeSize}
                colors={["white", "transparent"]}
              />
            </Rect>
            {/* Верхній правий кут */}
            <Rect
              x={glowX + glowWidth - fadeSize}
              y={glowY}
              width={fadeSize}
              height={fadeSize}
            >
              <RadialGradient
                c={vec(glowX + glowWidth - fadeSize, glowY + fadeSize)}
                r={fadeSize}
                colors={["white", "transparent"]}
              />
            </Rect>
            {/* Нижній лівий кут */}
            <Rect
              x={glowX}
              y={glowY + glowHeight - fadeSize}
              width={fadeSize}
              height={fadeSize}
            >
              <RadialGradient
                c={vec(glowX + fadeSize, glowY + glowHeight - fadeSize)}
                r={fadeSize}
                colors={["white", "transparent"]}
              />
            </Rect>
            {/* Нижній правий кут */}
            <Rect
              x={glowX + glowWidth - fadeSize}
              y={glowY + glowHeight - fadeSize}
              width={fadeSize}
              height={fadeSize}
            >
              <RadialGradient
                c={vec(
                  glowX + glowWidth - fadeSize,
                  glowY + glowHeight - fadeSize
                )}
                r={fadeSize}
                colors={["white", "transparent"]}
              />
            </Rect>
          </Group>
        }
      >
        <Group
          opacity={glowOpacity}
          clip={rrect(
            rect(glowX, glowY, glowWidth, glowHeight),
            effectiveBlurBorderRadius,
            effectiveBlurBorderRadius
          )}
        >
          <Image
            image={image}
            x={glowX}
            y={glowY}
            width={glowWidth}
            height={glowHeight}
            fit="cover"
          >
            <Blur blur={blurRadius} />
            {/* Підсилення інтенсивності кольорів */}
            <ColorMatrix
              matrix={[
                1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
              ]}
            />
          </Image>
        </Group>
      </Mask>

      {/* Основне зображення - чітке із заокругленими кутами */}
      <Group
        clip={rrect(
          rect(
            imageX + borderRadius,
            imageY + borderRadius,
            width - borderRadius * 2,
            height - borderRadius * 2
          ),
          borderRadius,
          borderRadius
        )}
      >
        <Image
          image={image}
          x={imageX}
          y={imageY}
          width={width}
          height={height}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
}

/**
 * BloomImageAdvanced - Розширений bloom з двошаровим glow
 */
export function BloomImageAdvanced({
  uri,
  width = 225,
  height = 350,
  borderRadius = 16,
  blurRadius = 20,
  glowScale = 1.08,
  glowOpacity = 0.7,
  style,
}) {
  const image = useImage(uri);

  if (!image) {
    return (
      <View style={[{ width, height }, style]}>
        <View
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: "rgba(255,255,255,0.1)",
          }}
        />
      </View>
    );
  }

  const canvasWidth = width * glowScale;
  const canvasHeight = height * glowScale;
  const imageX = (canvasWidth - width) / 2;
  const imageY = (canvasHeight - height) / 2;

  return (
    <View style={[{ width: canvasWidth, height: canvasHeight }, style]}>
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        {/* Зовнішній glow - сильне розмиття */}
        <Group opacity={glowOpacity * 0.5}>
          <Image
            image={image}
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fit="cover"
          >
            <Blur blur={blurRadius * 1.5} />
          </Image>
        </Group>

        {/* Внутрішній glow - середнє розмиття */}
        <Group opacity={glowOpacity}>
          <Image
            image={image}
            x={imageX / 2}
            y={imageY / 2}
            width={width * ((1 + glowScale) / 2)}
            height={height * ((1 + glowScale) / 2)}
            fit="cover"
          >
            <Blur blur={blurRadius * 0.7} />
            <ColorMatrix
              matrix={[
                1.3, 0, 0, 0, 0.05, 0, 1.3, 0, 0, 0.05, 0, 0, 1.3, 0, 0.05, 0,
                0, 0, 1, 0,
              ]}
            />
          </Image>
        </Group>

        {/* Основне чітке зображення */}
        <Group clip={rrect(rect(imageX, imageY, width, height), 0, 0)}>
          <Image
            image={image}
            x={imageX}
            y={imageY}
            width={width}
            height={height}
            fit="cover"
            style={{
              borderRadius: 16,
            }}
          />
        </Group>
      </Canvas>
    </View>
  );
}
