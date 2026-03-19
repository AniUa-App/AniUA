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
  /** Контейнер екрану входу (absoluteFill) */
  loginContainer: ViewStyle;
  /** Обгортка статистики профілю */
  statsWrapper: ViewStyle;
  /** Нижній відступ-заповнювач */
  bottomSpacer: ViewStyle;
};

export const useProfileScreenPhoneStyles = (): ProfileScreenPhoneStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    contentContainer: { flexGrow: 1, paddingBottom: layout.spacing.xlg },
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
    iconButton: { width: layout.sizing.touch, height: layout.sizing.touch, borderRadius: layout.radius.lg, justifyContent: "center", alignItems: "center" },
    usernameContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: layout.s(14), gap: layout.spacing.sm },
    editButton: { padding: layout.spacing.xs, justifyContent: "center", alignItems: "center", borderRadius: layout.radius.lg },
    handle: { textAlign: "center", marginTop: layout.spacing.xxs },
    tabsContainer: { flexDirection: "row", justifyContent: "space-evenly", marginTop: layout.spacing.xlg, marginHorizontal: layout.spacing.xlg },
    tabContentWrapper: { width: "100%" },
    loginContainer: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    statsWrapper: { width: "100%", flex: 1, justifyContent: "center", alignItems: "center" },
    bottomSpacer: { width: "100%", paddingBottom: layout.s(45) },
  };
};
