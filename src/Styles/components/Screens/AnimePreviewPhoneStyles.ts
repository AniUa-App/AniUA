import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type AnimePreviewPhoneStyles = {
  /** Головний контейнер */
  container: ViewStyle;
  /** Іконка всередині рядка */
  icon: ViewStyle;
  /** Контейнер іконки */
  iconContainer: ViewStyle;
  /** Контейнер постеру */
  posterContainer: ViewStyle;
  /** Постер */
  poster: ViewStyle;
  /** Нижнє зображення (blur) */
  bottomImg: ImageStyle;
  /** Blur-ефект */
  blur: ViewStyle;
  /** Верхнє зображення */
  topImg: ImageStyle;
  /** Градієнт постеру */
  posterGradient: ViewStyle;
  /** Контейнер контенту */
  contentContainer: ViewStyle;
  /** Обгортка заголовку */
  titleWrapper: ViewStyle;
  /** Секція заголовку */
  titleSection: ViewStyle;
  /** Рядок підзаголовку */
  subtitleRow: ViewStyle;
  /** Підзаголовок */
  subtitle: TextStyle;
  /** Рядок основних дій */
  primaryActionsRow: ViewStyle;
  /** Кнопка перегляду */
  watchButton: ViewStyle;
  /** Текст кнопки перегляду */
  watchButtonText: TextStyle;
  /** Верхня кнопка (назад, меню) */
  topButton: ViewStyle;
  /** Кнопка-іконка */
  iconButton: ViewStyle;
  /** Контейнер жанрів */
  genresContainer: ViewStyle;
  /** Тег жанру */
  genreTag: ViewStyle;
  /** Секція інформації */
  infoSection: ViewStyle;
  /** Рядок інформації */
  infoRow: ViewStyle;
  /** Іконка в рядку */
  infoIcon: ViewStyle;
  /** Текст підпису рядка */
  infoLabel: TextStyle;
  /** Значення рядка */
  infoValue: TextStyle;
  /** Секція опису */
  descriptionSection: ViewStyle;
  /** Текст опису */
  descriptionText: TextStyle;
  /** Текст джерела */
  sourceText: TextStyle;
  /** Секція рейтингу */
  ratingSection: ViewStyle;
  /** Заголовок секції рейтингу */
  ratingSectionTitle: TextStyle;
  /** Контейнер зірочок */
  starsContainer: ViewStyle;
  /** Кнопка зірочки */
  starButton: ViewStyle;
  /** Обгортка секційних вкладок */
  sectionTabsWrapper: ViewStyle;
  /** Контейнер кнопок вкладок */
  sectionTabsContainer: ViewStyle;
  /** Кнопка вкладки */
  sectionTab: ViewStyle;
  /** Іконка вкладки */
  sectionTabIcon: ViewStyle;
  /** Вміст вкладки */
  sectionTabContent: ViewStyle;
  /** Вміст вкладки */
};

export const useAnimePreviewPhoneStyles = (): AnimePreviewPhoneStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    icon: {
      padding: layout.spacing.xs,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      width: "100%",
    },
    posterContainer: {
      position: "relative",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      paddingTop: layout.s(82),
    },
    poster: { alignItems: "center" },
    bottomImg: {
      width: layout.s(250),
      height: layout.s(375),
      position: "absolute",
      borderRadius: layout.radius.lg,
      top: -10,
      zIndex: 1,
    },
    blur: {
      width: layout.s(250),
      height: layout.s(375),
      position: "absolute",
      borderRadius: layout.radius.lg,
      zIndex: 1,
    },
    topImg: {
      width: layout.s(225),
      height: layout.s(350),
      borderRadius: layout.radius.lg,
      zIndex: 2,
    },
    posterGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentContainer: { alignItems: "center", width: "100%", top: -10 },
    titleWrapper: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      marginBottom: layout.spacing.lg,
    },
    titleSection: {
      flexDirection: "column",
      alignItems: "flex-start",
      maxWidth: "95%",
    },
    subtitleRow: { gap: layout.spacing.sm, marginTop: layout.spacing.xxs },
    subtitle: {},
    primaryActionsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      marginBottom: layout.spacing.lg,
    },
    watchButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: layout.spacing.md,
      borderRadius: layout.radius.md,
      gap: layout.spacing.sm,
    },
    watchButtonText: { fontWeight: "600" },
    topButton: {
      top: layout.spacing.xl5,
      borderRadius: layout.radius.lg,
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      width: layout.sizing.touch,
      height: layout.sizing.touch,
    },
    iconButton: {
      width: layout.sizing.touch,
      height: layout.sizing.touch,
      borderRadius: layout.radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    genresContainer: {
      flexWrap: "wrap",
      flex: 1,
      justifyContent: "center",
    },
    genreTag: {},
    infoSection: {
      padding: layout.spacing.lg,
      borderRadius: layout.radius.lg,
      width: "95%",
      alignItems: "flex-start",
      gap: layout.spacing.sm,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.sm,
    },
    infoIcon: { alignItems: "center" },
    infoLabel: {},
    infoValue: { fontWeight: "500", flex: 1 },
    descriptionSection: { marginVertical: layout.spacing.xmd, width: "88%" },
    descriptionText: { lineHeight: 22, opacity: 0.9 },
    sourceText: {
      marginTop: layout.spacing.md,
      opacity: 0.5,
      fontStyle: "italic",
    },
    ratingSection: {
      width: "95%",
      alignItems: "center",
      marginBottom: layout.spacing.xlg,
    },
    ratingSectionTitle: {
      marginBottom: layout.s(14),
      width: "100%",
      textAlign: "left",
    },
    starsContainer: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      width: "100%",
      padding: layout.spacing.lg,
      borderRadius: layout.radius.lg,
    },
    starButton: { padding: layout.spacing.xs },
    sectionTabsWrapper: { width: "95%", marginBottom: layout.spacing.xlg },
    sectionTabsContainer: {
      flexDirection: "row",
      borderRadius: layout.radius.lg,
      paddingVertical: layout.spacing.xsm,
      gap: layout.spacing.md,
    },
    sectionTab: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: layout.spacing.lg,
      borderRadius: layout.radius.lg,
      gap: layout.spacing.xsm,
    },
    sectionTabIcon: { alignItems: "center", justifyContent: "center" },
    sectionTabContent: {
      marginTop: layout.spacing.md,
      borderRadius: layout.radius.lg,
      overflow: "hidden",
    },
  };
};
