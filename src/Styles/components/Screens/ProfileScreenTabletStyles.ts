import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type ProfileScreenTabletStyles = {
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
  /** Кнопка-іконка */
  iconButton: ViewStyle;
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
  /** Обгортка вмісту вкладок */
  tabContentWrapper: ViewStyle;
};

export const useProfileScreenTabletStyles = (): ProfileScreenTabletStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, flexDirection: "row" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: layout.s(20),
      paddingTop: layout.s(50),
      paddingBottom: layout.s(8),
    },
    sidebar: { paddingTop: layout.s(40), paddingHorizontal: layout.s(16), paddingBottom: layout.s(100), maxWidth: "40%", flexDirection: "column" },
    sidebarHeader: { flexDirection: "row", marginBottom: layout.s(8) },
    iconButton: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(16), justifyContent: "center", alignItems: "center" },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.s(14), gap: layout.s(8) },
    editButton: { width: layout.s(40), height: layout.s(24), borderRadius: layout.s(14), justifyContent: "center", alignItems: "center" },
    handle: { textAlign: "center", marginTop: layout.s(2) },
    content: { flex: 1 },
    tabsContainer: { justifyContent: "center", alignContent: "center", flexDirection: "column", gap: layout.s(16), top: "4%" },
    tabContentWrapper: { overflow: "hidden", width: "100%" },
  };
};
