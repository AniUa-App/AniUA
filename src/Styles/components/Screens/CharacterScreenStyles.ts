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
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: layout.s(16), paddingBottom: layout.s(10) },
    backButton: { borderRadius: layout.s(16), padding: layout.s(6), justifyContent: "center", alignItems: "center" },
    headerSpacer: { flex: 1 },
    menuButton: { borderRadius: layout.s(16), padding: layout.s(6), justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    contentContainer: { alignItems: "center" },
    imageContainer: { overflow: "hidden", borderRadius: layout.s(16) },
    characterImage: { borderRadius: layout.s(16) },
    namePill: {
      paddingHorizontal: "10%",
      paddingVertical: layout.s(10),
      borderRadius: layout.s(16),
      marginTop: layout.s(20),
      zIndex: 1,
      minWidth: layout.s(120),
      alignItems: "center",
    },
    nameText: { fontFamily: "Nunito-SemiBold", textAlign: "center" },
    description: { marginTop: layout.s(20), marginHorizontal: layout.s(20), textAlign: "left", lineHeight: 24 },
    sectionHeader: { width: "100%", paddingHorizontal: layout.s(20), marginTop: layout.s(24), marginBottom: layout.s(8) },
    loadingContainer: { height: layout.s(200), justifyContent: "center", alignItems: "center" },
    emptyContainer: { height: layout.s(100), justifyContent: "center", alignItems: "center" },
    tvLayout: { flex: 1, flexDirection: "row" },
    tvLeftPanel: { width: "35%" },
    tvRightPanel: { flex: 1 },
  };
};
