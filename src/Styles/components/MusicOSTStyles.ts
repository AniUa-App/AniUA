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
      borderRadius: layout.radius.md,
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
      top: layout.spacing.xmd,
      left: layout.spacing.xmd,
      paddingHorizontal: layout.spacing.xmd,
      paddingVertical: layout.spacing.xs,
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
      paddingHorizontal: layout.spacing.md,
      paddingVertical: layout.spacing.xmd,
      paddingTop: layout.spacing.xl,
    },
    title: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    author: {
      color: "rgba(255,255,255,0.7)",
      marginTop: layout.spacing.xxs,
    },
    separator: {
      width: layout.s(12),
    },
  };
};
