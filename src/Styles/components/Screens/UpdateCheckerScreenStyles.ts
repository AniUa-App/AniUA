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
    scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: layout.s(20), paddingVertical: layout.s(24) },
    centerContent: { alignItems: "center" },
    header: { alignItems: "center", marginBottom: layout.s(24) },
    iconContainer: {
      width: layout.s(64),
      height: layout.s(64),
      borderRadius: layout.s(32),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: layout.s(16),
    },
    changelogContainer: { width: "100%", padding: layout.s(16), borderRadius: layout.s(16) },
    changelogBox: { borderRadius: layout.s(12), padding: layout.s(12) },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: layout.s(12),
      borderRadius: layout.s(12),
      marginTop: layout.s(16),
      width: "100%",
    },
    errorText: { fontFamily: "Nunito-Regular", fontSize: 13, marginLeft: layout.s(8), flex: 1 },
    progressContainer: { width: "100%", marginVertical: layout.s(16) },
    typeIndicator: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: layout.s(8), gap: layout.s(6) },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: layout.s(20) },
  };
};
