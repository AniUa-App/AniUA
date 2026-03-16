import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type MusicOSTStyles = {
  /** Контейнер картки треку */
  cardContainer: ViewStyle;
  /** Фоновий градієнт (absoluteFillObject) */
  gradient: ViewStyle;
  /** Бейдж типу треку (OP/ED) */
  badge: ViewStyle;
  /** Центрований контейнер іконки Spotify */
  iconContainer: ViewStyle;
  /** Нижній градієнт з назвою та автором */
  bottomGradient: ViewStyle;
  /** Назва треку */
  title: TextStyle;
  /** Автор треку */
  author: TextStyle;
  /** Відступ між елементами списку */
  separator: ViewStyle;
};

export const useMusicOSTStyles = (): MusicOSTStyles => {
  const layout = useLayout();

  return {
    cardContainer: {
      borderRadius: layout.s(12),
      overflow: "hidden",
      position: "relative",
    },
    gradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    badge: {
      position: "absolute",
      top: layout.s(10),
      left: layout.s(10),
      paddingHorizontal: layout.s(10),
      paddingVertical: layout.s(4),
      borderRadius: layout.s(6),
      zIndex: 2,
    },
    iconContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    bottomGradient: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: layout.s(12),
      paddingVertical: layout.s(10),
      paddingTop: layout.s(24),
    },
    title: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    author: {
      color: "rgba(255,255,255,0.7)",
      marginTop: layout.s(2),
    },
    separator: {
      width: layout.s(12),
    },
  };
};
