import { useLayout } from "../../Layout";
import { TV } from "../../TVStyles";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

type TVSidebarNavStyles = {
  /** Фіксований контейнер бічної панелі */
  container: ViewStyle;
  /** Логотип застосунку */
  logo: ImageStyle;
  /** Область логотипу з назвою */
  logoArea: ViewStyle;
  /** Порожній стиль заголовка застосунку */
  appTitle: ViewStyle;
  /** Контейнер елементів навігації */
  navItems: ViewStyle;
  /** Елемент навігації */
  navItem: ViewStyle;
  /** Підпис елемента навігації */
  navLabel: TextStyle;
};

export const useTVSidebarNavStyles = (): TVSidebarNavStyles => {
  const layout = useLayout();

  return {
    container: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: TV.sidebar.width,
      zIndex: 10,
      justifyContent: "flex-start",
      borderRightWidth: 1,
      borderRightColor: "rgba(255, 255, 255, 0.1)",
    },
    logo: {
      width: layout.s(64),
      height: layout.s(64),
    },
    logoArea: {
      paddingHorizontal: layout.s(20),
      paddingVertical: layout.s(16),
      marginBottom: layout.s(8),
      flexDirection: "row",
      alignItems: "center",
    },
    appTitle: {},
    navItems: {
      flex: 1,
      paddingHorizontal: layout.s(12),
      gap: layout.s(4),
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(14),
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(14),
      borderRadius: TV.button.borderRadius,
      minHeight: layout.s(56),
    },
    navLabel: {
      fontFamily: "Nunito-SemiBold",
    },
  };
};
