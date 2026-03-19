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
  /** Обгортка аватара з відступами */
  avatarWrapper: ViewStyle;
  /** Контейнер імені користувача */
  usernameContainer: ViewStyle;
  /** Кнопка редагування імені */
  editButton: ViewStyle;
  /** Текст @username */
  handle: TextStyle;
  /** Текст відображуваного імені */
  displayNameText: TextStyle;
  /** Контент (список аніме) */
  content: ViewStyle;
  /** Вертикальна панель вкладок */
  tabsContainer: ViewStyle;
  /** Кнопка вкладки */
  tabButton: ViewStyle;
  /** Контейнер екрану входу (absoluteFill) */
  loginContainer: ViewStyle;
  /** Нижній відступ-заповнювач */
  bottomSpacer: ViewStyle;
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
      paddingTop: layout.spacing.xl5,
      paddingBottom: layout.spacing.sm,
    },
    sidebar: { paddingTop: layout.spacing.xlg, paddingHorizontal: layout.spacing.sm, paddingBottom: layout.spacing.xl3, width: "35%", flexDirection: "column" },
    sidebarHeader: { flexDirection: "row", marginBottom: layout.spacing.xs },
    avatarWrapper: { left: layout.spacing.lg, paddingTop: "20%" },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.spacing.sm, gap: layout.spacing.xsm },
    editButton: { width: layout.sizing.touchXs, height: layout.s(24), borderRadius: layout.radius.md, justifyContent: "center", alignItems: "center" },
    handle: { textAlign: "center", marginTop: layout.spacing.xxs, fontSize: layout.s(12) },
    displayNameText: { fontSize: layout.s(16) },
    content: { width: "30%" },
    tabsContainer: { justifyContent: "center", alignContent: "center", flexDirection: "column", gap: layout.spacing.sm, paddingTop: layout.spacing.lg },
    tabButton: { borderRadius: layout.radius.lg },
    loginContainer: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    bottomSpacer: { height: layout.sizing.xl },
  };
};
