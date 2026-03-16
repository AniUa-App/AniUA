import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type MangaScreenStyles = {
  /** Вміст ScrollView (flexGrow) */
  scrollContent: ViewStyle;
  /** Зовнішній контейнер з центруванням */
  container: ViewStyle;
  /** Внутрішній контент з обмеженою шириною */
  content: ViewStyle;
  /** Контейнер круглої іконки */
  iconContainer: ViewStyle;
  /** Заголовок екрану */
  title: TextStyle;
  /** Бейдж статусу */
  statusBadge: ViewStyle;
  /** Текст статусу */
  statusText: TextStyle;
  /** Опис функціональності */
  description: TextStyle;
  /** Кнопка донату */
  donateButton: ViewStyle;
  /** Текст кнопки донату */
  donateButtonText: TextStyle;
  /** Підпис внизу */
  footnote: TextStyle;
};

export const useMangaScreenStyles = (): MangaScreenStyles => {
  const layout = useLayout();

  return {
    scrollContent: { flexGrow: 1 },
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: layout.s(40) },
    content: { alignItems: "center", paddingHorizontal: layout.s(24), maxWidth: 400, width: "100%" },
    iconContainer: {
      width: layout.s(140),
      height: layout.s(140),
      borderRadius: layout.s(70),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: layout.s(24),
    },
    title: { marginBottom: layout.s(12), textAlign: "center", fontSize: 28, fontFamily: "Nunito-Bold" },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(14),
      paddingVertical: layout.s(8),
      borderRadius: layout.s(20),
      marginBottom: layout.s(20),
      gap: layout.s(6),
    },
    statusText: { fontSize: 14, fontFamily: "Nunito-SemiBold" },
    description: { fontSize: 15, fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 22, marginBottom: layout.s(24) },
    donateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: layout.s(16),
      paddingHorizontal: layout.s(32),
      borderRadius: layout.s(16),
      width: "100%",
      gap: layout.s(10),
    },
    donateButtonText: { fontFamily: "Nunito-Bold" },
    footnote: { fontSize: 13, fontFamily: "Nunito-Regular", textAlign: "center", marginTop: layout.s(16) },
  };
};
