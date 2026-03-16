import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle } from "react-native";

type TVModalStyles = {
  /** Напівпрозорий фон модального вікна */
  backdrop: ViewStyle;
  /** Контейнер модального вікна */
  container: ViewStyle;
  /** Заголовок модального вікна */
  title: TextStyle;
  /** Область прокрутки вмісту */
  content: ViewStyle;
};

export const useTVModalStyles = (): TVModalStyles => {
  const layout = useLayout();

  return {
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      width: "50%",
      maxHeight: "80%",
      borderRadius: TV.button.borderRadius,
      padding: TV.padding.section,
      elevation: 10,
    },
    title: {
      fontFamily: "Nunito-SemiBold",
      marginBottom: layout.s(16),
      paddingBottom: layout.s(12),
      borderBottomWidth: 1,
    },
    content: {
      flex: 1,
    },
  };
};
