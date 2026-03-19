import { useLayout } from "../../Layout";
import { useThemeColors } from "../../../Global/useTheme";
import { Background } from "../../Colors";
import type { ViewStyle, TextStyle } from "react-native";

type WebVideoPlayerStyles = {
  /** Повноекранний контейнер */
  container: ViewStyle;
  /** Відео-компонент */
  video: ViewStyle;
  /** Кнопка "назад" (застаріла) */
  backButton: ViewStyle;
  /** Заголовок відео (застарілий) */
  title: TextStyle;
};

export const useWebVideoPlayerStyles = (): WebVideoPlayerStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, backgroundColor: Background(1) },
    video: { flex: 1 },
    backButton: {
      position: "absolute",
      top: layout.spacing.xl3,
      left: layout.spacing.xlg,
      backgroundColor: Background(0.7),
      borderRadius: layout.radius.sm,
      padding: layout.spacing.xmd,
      flexDirection: "row",
      alignItems: "center",
      zIndex: 999,
    },
    title: { color: "text", marginLeft: layout.spacing.xmd, maxWidth: "80%" },
  };
};
