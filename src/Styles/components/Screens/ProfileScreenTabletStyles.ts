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
  /** Вміст бічної панелі (ScrollView contentContainerStyle) */
  sidebarContent: ViewStyle;
  /** Заголовок бічної панелі */
  sidebarHeader: ViewStyle;
  /** Кнопка-іконка */
  iconButton: ViewStyle;
  /** Обгортка аватара з відступами */
  avatarWrapper: ViewStyle;
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
  /** Контейнер екрану входу (absoluteFill) */
  loginContainer: ViewStyle;
  /** Нижній відступ-заповнювач */
  bottomSpacer: ViewStyle;
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
      paddingHorizontal: layout.spacing.xlg,
      paddingTop: layout.spacing.xl5,
      paddingBottom: layout.spacing.sm,
      zIndex: 1,
    },
    sidebar: { paddingTop: layout.spacing.xl3, paddingHorizontal: layout.spacing.lg, paddingBottom: layout.s(100), maxWidth: "40%", flexDirection: "column" },
    sidebarContent: { flexGrow: 1 },
    sidebarHeader: { flexDirection: "row", marginBottom: layout.spacing.sm },
    avatarWrapper: { left: layout.spacing.xxl, paddingTop: "5%" },
    iconButton: { width: layout.sizing.touch, height: layout.sizing.touch, borderRadius: layout.radius.lg, justifyContent: "center", alignItems: "center" },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.s(14), gap: layout.spacing.sm },
    editButton: { width: layout.s(40), height: layout.s(24), borderRadius: layout.s(14), justifyContent: "center", alignItems: "center" },
    handle: { textAlign: "center", marginTop: layout.spacing.xxs },
    content: { flex: 1 },
    tabsContainer: { justifyContent: "center", alignContent: "center", flexDirection: "column", gap: layout.spacing.lg, top: "4%" },
    tabContentWrapper: { overflow: "hidden", width: "100%" },
    loginContainer: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    bottomSpacer: { height: layout.sizing.xl },
  };
};
