import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type SearchFilterBottomSheetStyles = {
  /** ScrollView фільтрів */
  scrollView: ViewStyle;
  /** Нижній відступ вмісту */
  scrollContent: ViewStyle;
  /** Контейнер вмісту фільтрів */
  content: ViewStyle;
  /** Рядок заголовка (назва + кнопки) */
  headerRow: ViewStyle;
  /** Група кнопок дії (скинути/застосувати) */
  headerButtons: ViewStyle;
  /** Кнопка дії заголовка */
  headerButton: ViewStyle;
  /** Мітка секції фільтра */
  sectionLabel: TextStyle;
  /** Стиль слайдера */
  slider: ViewStyle;
};

export const useSearchFilterBottomSheetStyles =
  (): SearchFilterBottomSheetStyles => {
    const layout = useLayout();

    return {
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        paddingBottom: layout.spacing.xl3,
        paddingTop: layout.spacing.sm,
      },
      content: {
        flex: 1,
        paddingHorizontal: layout.spacing.lg,
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: layout.spacing.xlg,
      },
      headerButtons: {
        flexDirection: "row",
        gap: layout.spacing.xmd,
      },
      headerButton: {
        width: layout.sizing.touchSm,
        height: layout.sizing.touchSm,
        borderRadius: layout.radius.lg,
        alignItems: "center",
        justifyContent: "center",
      },
      sectionLabel: {
        marginTop: layout.spacing.lg,
        marginBottom: layout.spacing.sm,
      },
      slider: {
        marginTop: layout.spacing.lg,
      },
    };
  };
