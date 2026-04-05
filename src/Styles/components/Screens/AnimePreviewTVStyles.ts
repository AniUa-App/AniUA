import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type AnimePreviewTVStyles = {
  /** Центрований контейнер (для error/loading станів) */
  centered: ViewStyle;

  // InfoRow
  /** Рядок інформації */
  infoRow: ViewStyle;
  /** Контейнер іконки в рядку */
  infoIconContainer: ViewStyle;

  // StarRating
  /** Контейнер зірочок */
  starsContainer: ViewStyle;

  // SectionTabs
  /** Обгортка секційних вкладок */
  sectionTabsWrapper: ViewStyle;
  /** Рядок кнопок вкладок */
  sectionTabsRow: ViewStyle;
  /** Кнопка вкладки */
  sectionTab: ViewStyle;

  // Main layout
  /** TVFocusGuideView — кореневий контейнер */
  focusGuide: ViewStyle;
  /** Лівий ScrollView */
  leftPanel: ViewStyle;
  /** contentContainerStyle лівого ScrollView */
  leftPanelContent: ViewStyle;
  /** Обгортка верхньої секції (постер + заголовок) */
  topSection: ViewStyle;
  /** Фонове зображення (blur-background) */
  backgroundImage: ImageStyle;
  /** Контейнер постеру */
  posterWrapper: ViewStyle;
  /** Кнопка назад */
  backButton: ViewStyle;
  /** Рядок заголовку */
  titleRow: ViewStyle;
  /** Секція заголовку */
  titleSection: ViewStyle;
  /** Обгортка підзаголовку */
  subtitleWrapper: ViewStyle;
  /** Рядок основних дій */
  primaryActionsRow: ViewStyle;
  /** Кнопка перегляду */
  watchButton: ViewStyle;
  /** Кнопка обраного */
  favoriteButton: ViewStyle;
  /** Секція інформації */
  infoSection: ViewStyle;
  /** Рядок жанрів */
  genreRow: ViewStyle;
  /** Контейнер іконки жанру */
  genreIconContainer: ViewStyle;
  /** Контейнер тексту жанрів */
  genreTextContainer: ViewStyle;
  /** Контейнер жанрів (список) */
  genresContainer: ViewStyle;

  // Right panel
  /** Правий панель */
  rightPanel: ViewStyle;
  /** Секція опису */
  descriptionSection: ViewStyle;
  /** Секція рейтингу */
  ratingSection: ViewStyle;
  /** Заголовок секції рейтингу */
  ratingSectionTitle: TextStyle;
};

export const useAnimePreviewTVStyles = (): AnimePreviewTVStyles => {
  return {
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    // InfoRow
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    infoIconContainer: {
      padding: 4,
      borderRadius: 16,
      marginRight: 8,
    },

    // StarRating
    starsContainer: {
      flexDirection: "row",
      padding: 12,
      borderRadius: 16,
      flex: 1,
      gap: 10,
      justifyContent: "space-between",
      width: "100%",
    },

    // SectionTabs
    sectionTabsWrapper: {
      marginTop: 16,
    },
    sectionTabsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 16,
    },
    sectionTab: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 16,
    },

    // Main layout
    focusGuide: {
      flex: 1,
      flexDirection: "row",
      paddingHorizontal: 8,
    },
    leftPanel: {
      flex: 1,
    },
    leftPanelContent: {
      flexGrow: 1,
    },
    topSection: {
      overflow: "hidden",
    },
    backgroundImage: {
      opacity: 0.45,
    },
    posterWrapper: {
      position: "relative",
      width: "100%",
      alignItems: "center",
      marginTop: 16,
    },
    backButton: {
      position: "absolute",
      top: 16,
      left: 16,
      padding: 8,
      width: 38,
      height: 38,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      top: -16,
    },
    titleSection: {
      flexDirection: "column",
      alignItems: "flex-start",
      maxWidth: "95%",
    },
    subtitleWrapper: {
      marginTop: 2,
    },
    primaryActionsRow: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 16,
      flex: 1,
    },
    watchButton: {
      width: "80%",
      height: 42,
    },
    favoriteButton: {
      width: 42,
      height: 42,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
    },
    infoSection: {
      padding: 16,
      margin: 16,
      borderRadius: 16,
    },
    genreRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    genreIconContainer: {
      padding: 4,
      borderRadius: 16,
      marginRight: 8,
    },
    genreTextContainer: {
      flex: 1,
    },
    genresContainer: {
      flexWrap: "wrap",
      flex: 1,
      justifyContent: "center",
    },

    // Right panel
    rightPanel: {
      width: "60%",
      padding: 24,
    },
    descriptionSection: {
      marginVertical: 16,
    },
    ratingSection: {
      width: "100%",
      alignItems: "center",
    },
    ratingSectionTitle: {
      marginBottom: 14,
      width: "100%",
      textAlign: "left",
    },
  };
};
