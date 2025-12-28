import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { TouchableOpacity } from "./Button";
import FastImage from "react-native-fast-image";
import { Skeleton } from "@rneui/themed";
import { background, primary } from "../Styles/Colors";
import LinearGradient from "react-native-linear-gradient";
import { Text as RNText } from "react-native";
import { text } from "../Styles/Colors";
import { H3 } from "../Styles/Fonts";
import Icon from "../Styles/Icons";
const CustomLinearGradient = (props) => {
  return (
    <LinearGradient
      {...props}
      colors={[background, primary, background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 8, y: 1 }}
      style={{ flex: 1 }}
    />
  );
};

export function Image({ uri, style, onLoad, resizeMode }) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={style}>
      {/* Показуємо Skeleton, поки завантажується зображення */}
      {loading && (
        <Skeleton
          LinearGradientComponent={CustomLinearGradient}
          animation="wave"
          width="100%"
          height="100%"
          style={{ backgroundColor: background }}
        />
      )}

      {/* Загружаем картинку через FastImage */}
      <FastImage
        style={[
          style,
          {
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
          },
        ]}
        source={{ uri }}
        onLoadEnd={() => {
          setLoading(false);
          onLoad && onLoad();
        }}
        resizeMode={resizeMode || FastImage.resizeMode.cover}
      />
    </View>
  );
}

const TextSkeleton = (props) => {
  return (
    <View style={props.style}>
      <Skeleton
        LinearGradientComponent={CustomLinearGradient}
        animation="wave"
        width="100%"
        height={20}
        style={{ backgroundColor: background }}
      />
      <Skeleton
        LinearGradientComponent={CustomLinearGradient}
        animation="wave"
        width="90%"
        height={20}
        style={{ backgroundColor: background }}
      />
      <Skeleton
        LinearGradientComponent={CustomLinearGradient}
        animation="wave"
        width="80%"
        height={20}
        style={{ backgroundColor: background }}
      />
    </View>
  );
};

export function TextS({
  children,
  style,
  onLoad,
  numberOfLines,
  ellipsizeMode = "tail",
  ...props
}) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");

  useEffect(() => {
    // Імітуємо завантаження тексту
    if (children) {
      setContent(children);
      setLoading(false);
      onLoad && onLoad();
    }
  }, [children]);

  return (
    <View style={style}>
      {loading ? (
        <TextSkeleton />
      ) : (
        <RNText
          style={style}
          numberOfLines={numberOfLines}
          ellipsizeMode={ellipsizeMode}
          {...props}
        >
          {content}
        </RNText>
      )}
    </View>
  );
}

const ButtonSkeleton = (props) => {
  return (
    <Skeleton
      LinearGradientComponent={CustomLinearGradient}
      animation="wave"
      width="100%"
      height="100%"
      style={{ backgroundColor: background }}
    />
  );
};
