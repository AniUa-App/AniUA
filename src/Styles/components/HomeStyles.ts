import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type HomeStyles = {
  /** Контейнер для індикатора завантаження */
  loaderContainer: ViewStyle;
  /** Sidebar навігація (планшет landscape) */
  sidebarNav: ViewStyle;
  /** Панель табів зверху (телефон) */
  tabBar: ViewStyle;
  /** Прозорий фон (для навігатора) */
  transparent: ViewStyle;
  /** Контент-зона на планшеті */
  tabletContent: ViewStyle;
  /** Відступ знизу сторінки */
  spacer: ViewStyle;
  /** Головний layout (flex column) */
  mainLayout: ViewStyle;
  /** Прихований sidebar (portrait) */
  sidebarHidden: ViewStyle;
  /** Видимий sidebar (landscape, 40% ширини) */
  sidebarVisible: ViewStyle;
  /** Контейнер контенту (flex: 1) */
  contentNavigator: ViewStyle;
  /** Контейнер контенту поруч із sidebar */
  contentNavigatorSidebar: ViewStyle;
  /** Контейнер списків на телефоні */
  contentContainer: ViewStyle;
  /** Контейнер списків на планшеті portrait */
  contentContainerTablet: ViewStyle;
};

export const useHomeStyles = (): HomeStyles => {
  const layout = useLayout();

  return {
    loaderContainer: { justifyContent: "center", alignItems: "center", padding: layout.s(30), height: layout.sizing.img },
    sidebarNav: { backgroundColor: "transparent", zIndex: 2 },
    tabBar: { marginTop: layout.spacing.sm, backgroundColor: "transparent", zIndex: 2, position: "absolute", width: "100%" },
    transparent: { backgroundColor: "transparent" },
    tabletContent: { flex: 1, paddingBottom: layout.spacing.xl5, width: "95%", alignSelf: "center" },
    spacer: { height: layout.sizing.md },
    mainLayout: { flex: 1, flexDirection: "column" },
    sidebarHidden: { width: 0, height: 0, overflow: "hidden" },
    sidebarVisible: { width: "40%", height: "100%", overflow: "hidden" },
    contentNavigator: { flex: 1 },
    contentNavigatorSidebar: { flex: 1, height: "100%" },
    contentContainer: { flex: 1, width: "97%", alignSelf: "center" },
    contentContainerTablet: { flex: 1, width: "98%", alignSelf: "center", paddingHorizontal: layout.spacing.sm },
  };
};
