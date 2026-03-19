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
      width: layout.sizing.md,
      height: layout.sizing.md,
    },
    logoArea: {
      paddingHorizontal: layout.spacing.xlg,
      paddingVertical: layout.spacing.lg,
      marginBottom: layout.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
    },
    appTitle: {},
    navItems: {
      flex: 1,
      paddingHorizontal: layout.spacing.md,
      gap: layout.spacing.xs,
    },
    navItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(14),
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.s(14),
      borderRadius: TV.button.borderRadius,
      minHeight: layout.s(56),
    },
    navLabel: {
      fontFamily: "Nunito-SemiBold",
    },
  };
};
