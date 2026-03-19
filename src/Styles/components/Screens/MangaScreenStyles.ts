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
    container: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: layout.spacing.xl3 },
    content: { alignItems: "center", paddingHorizontal: layout.spacing.xl, maxWidth: 400, width: "100%" },
    iconContainer: {
      width: layout.sizing.xxl,
      height: layout.sizing.xxl,
      borderRadius: layout.s(70),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: layout.spacing.xl,
    },
    title: { marginBottom: layout.spacing.md, textAlign: "center", fontSize: 28, fontFamily: "Nunito-Bold" },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(14),
      paddingVertical: layout.spacing.sm,
      borderRadius: layout.radius.xxlg,
      marginBottom: layout.spacing.xlg,
      gap: layout.spacing.xsm,
    },
    statusText: { fontSize: 14, fontFamily: "Nunito-SemiBold" },
    description: { fontSize: 15, fontFamily: "Nunito-Regular", textAlign: "center", lineHeight: 22, marginBottom: layout.spacing.xl },
    donateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: layout.spacing.lg,
      paddingHorizontal: layout.spacing.xxl,
      borderRadius: layout.radius.lg,
      width: "100%",
      gap: layout.spacing.xmd,
    },
    donateButtonText: { fontFamily: "Nunito-Bold" },
    footnote: { fontSize: 13, fontFamily: "Nunito-Regular", textAlign: "center", marginTop: layout.spacing.lg },
  };
};
