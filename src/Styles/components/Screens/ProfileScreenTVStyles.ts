import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";
import { TV } from "../../../Styles/TVStyles";

type ProfileScreenTVStyles = {
  /** Горизонтальний flex-контейнер */
  container: ViewStyle;
  /** Контейнер завантаження */
  loadingContainer: ViewStyle;
  /** Заголовок екрану */
  header: ViewStyle;
  /** Бічна панель з профілем */
  sidebar: ViewStyle;
  /** Заголовок бічної панелі */
  sidebarHeader: ViewStyle;
  /** Контейнер імені користувача */
  usernameContainer: ViewStyle;
  /** Кнопка редагування імені */
  editButton: ViewStyle;
  /** Текст @username */
  handle: TextStyle;
  /** Контент (список аніме) */
  content: ViewStyle;
  /** Вертикальна панель вкладок */
  tabsContainer: ViewStyle;
  /** Кнопка вкладки */
  tabButton: ViewStyle;
};

export const useProfileScreenTVStyles = (): ProfileScreenTVStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, flexDirection: "row" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: TV.padding.screen,
      paddingTop: layout.s(50),
      paddingBottom: layout.s(8),
    },
    sidebar: { paddingTop: layout.s(20), paddingHorizontal: layout.s(8), paddingBottom: layout.s(40), width: "35%", flexDirection: "column" },
    sidebarHeader: { flexDirection: "row", marginBottom: layout.s(4) },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.s(8), gap: layout.s(6) },
    editButton: { width: layout.s(32), height: layout.s(24), borderRadius: layout.s(12), justifyContent: "center", alignItems: "center" },
    handle: { textAlign: "center", marginTop: layout.s(2) },
    content: { width: "30%" },
    tabsContainer: { justifyContent: "center", alignContent: "center", flexDirection: "column", gap: layout.s(8), paddingTop: layout.s(16) },
    tabButton: { borderRadius: layout.s(16) },
  };
};
