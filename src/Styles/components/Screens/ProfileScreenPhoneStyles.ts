import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type ProfileScreenPhoneStyles = {
  /** Прокрутний контейнер */
  container: ViewStyle;
  /** Вміст прокрутного списку */
  contentContainer: ViewStyle;
  /** Контейнер завантаження */
  loadingContainer: ViewStyle;
  /** Заголовок з кнопкою налаштувань */
  header: ViewStyle;
  /** Кнопка-іконка */
  iconButton: ViewStyle;
  /** Контейнер імені користувача */
  usernameContainer: ViewStyle;
  /** Кнопка редагування імені */
  editButton: ViewStyle;
  /** Текст @username */
  handle: TextStyle;
  /** Рядок з вкладками */
  tabsContainer: ViewStyle;
  /** Обгортка вмісту вкладок */
  tabContentWrapper: ViewStyle;
};

export const useProfileScreenPhoneStyles = (): ProfileScreenPhoneStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    contentContainer: { flexGrow: 1, paddingBottom: layout.s(20) },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: layout.s(20),
      paddingTop: layout.s(50),
      paddingBottom: layout.s(8),
    },
    iconButton: { width: layout.s(44), height: layout.s(44), borderRadius: layout.s(16), justifyContent: "center", alignItems: "center" },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.s(14), gap: layout.s(8) },
    editButton: { padding: layout.s(4), justifyContent: "center", alignItems: "center", borderRadius: layout.s(16) },
    handle: { textAlign: "center", marginTop: layout.s(2) },
    tabsContainer: { flexDirection: "row", justifyContent: "space-evenly", marginTop: layout.s(20), marginHorizontal: layout.s(20) },
    tabContentWrapper: { width: "100%" },
  };
};
