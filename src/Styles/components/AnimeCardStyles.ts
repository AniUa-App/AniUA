import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H6, H7 } from "../Fonts.jsx";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type AnimeCardStyles = {
  /** Зображення постеру (aspect ratio 0.75) */
  image: ImageStyle;
  /** Зображення постеру компактне (aspect ratio 0.7) */
  imageCompact: ImageStyle;
  /** Зовнішній контейнер картки */
  container: ViewStyle;
  /** Додатковий padding для телефону */
  containerPhone: ViewStyle;
  /** Блок з деталями під постером */
  details: ViewStyle;
  /** Назва аніме (H7) */
  title: TextStyle;
  /** Рядок з жанром та епізодами */
  infoRow: ViewStyle;
  /** Жанр (H6, primary color) */
  genre: TextStyle;
  /** Кількість епізодів (H6, primary color) */
  episodes: TextStyle;
  /** Стиль при фокусі на TV */
  tvFocused: ViewStyle;
};

export const useAnimeCardStyles = (): AnimeCardStyles => {
  const layout = useLayout();
  const theme = useThemeColors();

  return {
    image: { width: "100%", aspectRatio: 0.75, borderRadius: layout.s(21) },
    imageCompact: { width: "100%", aspectRatio: 0.7, borderRadius: layout.s(21) },
    container: { borderRadius: layout.radius.xlg, padding: layout.spacing.xs, paddingBottom: layout.spacing.xsm },
    containerPhone: { paddingHorizontal: layout.spacing.sm },
    details: { marginTop: layout.spacing.xsm, paddingHorizontal: layout.spacing.xxs },
    title: { ...H7, lineHeight: layout.spacing.lg, color: theme.text },
    infoRow: { flexDirection: "row", gap: layout.s(3) },
    genre: { ...H6, marginTop: layout.spacing.xxs, color: theme.primary },
    episodes: { ...H6, marginTop: layout.spacing.xxs, color: theme.primary },
    tvFocused: { borderWidth: 1, zIndex: 100, borderColor: theme.primary, backgroundColor: theme.accent, transform: [{ scale: 1.09 }] },
  };
};
