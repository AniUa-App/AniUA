import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type CharacterScreenStyles = {
  /** Головний контейнер */
  container: ViewStyle;
  /** Рядок заголовку */
  header: ViewStyle;
  /** Кнопка "назад" */
  backButton: ViewStyle;
  /** Розпірка в заголовку */
  headerSpacer: ViewStyle;
  /** Кнопка меню */
  menuButton: ViewStyle;
  /** Прокрутний список */
  scrollView: ViewStyle;
  /** Вміст прокрутного списку */
  contentContainer: ViewStyle;
  /** Контейнер зображення */
  imageContainer: ViewStyle;
  /** Зображення персонажа */
  characterImage: ImageStyle;
  /** Пігулка з ім'ям */
  namePill: ViewStyle;
  /** Текст імені */
  nameText: TextStyle;
  /** Блок опису */
  description: TextStyle;
  /** Заголовок секції */
  sectionHeader: ViewStyle;
  /** Контейнер завантаження */
  loadingContainer: ViewStyle;
  /** Порожній контейнер */
  emptyContainer: ViewStyle;
  /** TV: горизонтальний layout */
  tvLayout: ViewStyle;
  /** TV: ліва панель */
  tvLeftPanel: ViewStyle;
  /** TV: права панель */
  tvRightPanel: ViewStyle;
};

export const useCharacterScreenStyles = (): CharacterScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: layout.spacing.lg, paddingBottom: layout.spacing.xmd },
    backButton: { borderRadius: layout.radius.lg, padding: layout.spacing.xsm, justifyContent: "center", alignItems: "center" },
    headerSpacer: { flex: 1 },
    menuButton: { borderRadius: layout.radius.lg, padding: layout.spacing.xsm, justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    contentContainer: { alignItems: "center" },
    imageContainer: { overflow: "hidden", borderRadius: layout.radius.lg },
    characterImage: { borderRadius: layout.radius.lg },
    namePill: {
      paddingHorizontal: "10%",
      paddingVertical: layout.spacing.xmd,
      borderRadius: layout.radius.lg,
      marginTop: layout.spacing.xlg,
      zIndex: 1,
      minWidth: layout.s(120),
      alignItems: "center",
    },
    nameText: { fontFamily: "Nunito-SemiBold", textAlign: "center" },
    description: { marginTop: layout.spacing.xlg, marginHorizontal: layout.spacing.xlg, textAlign: "left", lineHeight: 24 },
    sectionHeader: { width: "100%", paddingHorizontal: layout.spacing.xlg, marginTop: layout.spacing.xl, marginBottom: layout.spacing.sm },
    loadingContainer: { height: layout.sizing.img, justifyContent: "center", alignItems: "center" },
    emptyContainer: { height: layout.sizing.xl, justifyContent: "center", alignItems: "center" },
    tvLayout: { flex: 1, flexDirection: "row" },
    tvLeftPanel: { width: "35%" },
    tvRightPanel: { flex: 1 },
  };
};
