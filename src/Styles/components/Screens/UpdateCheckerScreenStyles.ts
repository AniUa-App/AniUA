import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type UpdateCheckerScreenStyles = {
  /** Головний flex-контейнер */
  screen: ViewStyle;
  /** Прокрутний список (flex: 1) */
  scrollView: ViewStyle;
  /** Вміст прокрутного списку */
  scrollContent: ViewStyle;
  /** Центрований блок контенту */
  centerContent: ViewStyle;
  /** Блок заголовку оновлення */
  header: ViewStyle;
  /** Контейнер іконки оновлення */
  iconContainer: ViewStyle;
  /** Контейнер changelog */
  changelogContainer: ViewStyle;
  /** Блок changelog (застарілий) */
  changelogBox: ViewStyle;
  /** Контейнер повідомлення про помилку */
  errorContainer: ViewStyle;
  /** Текст помилки */
  errorText: TextStyle;
  /** Контейнер прогресу оновлення */
  progressContainer: ViewStyle;
  /** Індикатор типу оновлення */
  typeIndicator: ViewStyle;
  /** Контейнер завантаження (fallback) */
  loadingContainer: ViewStyle;
};

export const useUpdateCheckerScreenStyles = (): UpdateCheckerScreenStyles => {
  const layout = useLayout();

  return {
    screen: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: layout.spacing.xlg, paddingVertical: layout.spacing.xl },
    centerContent: { alignItems: "center" },
    header: { alignItems: "center", marginBottom: layout.spacing.xl },
    iconContainer: {
      width: layout.sizing.md,
      height: layout.sizing.md,
      borderRadius: layout.s(32),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: layout.spacing.lg,
    },
    changelogContainer: { width: "100%", padding: layout.spacing.lg, borderRadius: layout.radius.lg },
    changelogBox: { borderRadius: layout.radius.md, padding: layout.spacing.md },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: layout.spacing.md,
      borderRadius: layout.radius.md,
      marginTop: layout.spacing.lg,
      width: "100%",
    },
    errorText: { fontFamily: "Nunito-Regular", fontSize: 13, marginLeft: layout.spacing.sm, flex: 1 },
    progressContainer: { width: "100%", marginVertical: layout.spacing.lg },
    typeIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: layout.spacing.sm, gap: layout.spacing.xsm },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.spacing.xlg },
  };
};
