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
};

export const useAnimePreviewPhoneStyles = (): AnimePreviewPhoneStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    icon: { padding: layout.s(4), borderRadius: layout.s(16) },
    iconContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
    posterContainer: { position: "relative", overflow: "hidden", justifyContent: "center", alignItems: "center", paddingTop: layout.s(82) },
    poster: { alignItems: "center" },
    bottomImg: { width: layout.s(250), height: layout.s(375), position: "absolute", borderRadius: layout.s(16), top: -10, zIndex: 1 },
    blur: { width: layout.s(250), height: layout.s(375), position: "absolute", borderRadius: layout.s(16), zIndex: 1 },
    topImg: { width: layout.s(225), height: layout.s(350), borderRadius: layout.s(16), zIndex: 2 },
    posterGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    contentContainer: { alignItems: "center", width: "100%", top: -10 },
    titleWrapper: { flexDirection: "row", justifyContent: "center", width: "100%", marginBottom: layout.s(16) },
    titleSection: { flexDirection: "column", alignItems: "flex-start", maxWidth: "95%" },
    subtitleRow: { gap: layout.s(8), marginTop: layout.s(2) },
    subtitle: {},
    primaryActionsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", width: "100%", marginBottom: layout.s(16) },
    watchButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: layout.s(12), borderRadius: layout.s(12), gap: layout.s(8) },
    watchButtonText: { fontWeight: "600" },
    topButton: { top: layout.s(50), borderRadius: layout.s(16), position: "absolute", justifyContent: "center", alignItems: "center", width: layout.s(44), height: layout.s(44) },
    iconButton: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(12), alignItems: "center", justifyContent: "center" },
    genresContainer: { flexDirection: "row", flexWrap: "wrap" },
    genreTag: {},
    infoSection: { padding: layout.s(16), borderRadius: layout.s(16), width: "95%", alignItems: "flex-start", gap: layout.s(8) },
    infoRow: { flexDirection: "row", alignItems: "center", gap: layout.s(8) },
    infoIcon: { alignItems: "center" },
    infoLabel: {},
    infoValue: { fontWeight: "500", flex: 1 },
    descriptionSection: { marginVertical: layout.s(10), width: "88%" },
    descriptionText: { lineHeight: 22, opacity: 0.9 },
    sourceText: { marginTop: layout.s(12), opacity: 0.5, fontStyle: "italic" },
    ratingSection: { width: "95%", alignItems: "center", marginBottom: layout.s(20) },
    ratingSectionTitle: { marginBottom: layout.s(14), width: "100%", textAlign: "left" },
    starsContainer: { flexDirection: "row", justifyContent: "space-evenly", width: "100%", padding: layout.s(16), borderRadius: layout.s(16) },
    starButton: { padding: layout.s(4) },
    sectionTabsWrapper: { alignItems: "flex-start", width: "95%", marginBottom: layout.s(20) },
    sectionTabsContainer: { flexDirection: "row", borderRadius: layout.s(16), paddingVertical: layout.s(6), gap: layout.s(12) },
    sectionTab: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: layout.s(16), borderRadius: layout.s(12), gap: layout.s(6) },
    sectionTabIcon: { alignItems: "center", justifyContent: "center" },
    sectionTabContent: { marginTop: layout.s(12), borderRadius: layout.s(16), overflow: "hidden" },
  };
};
