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
        paddingBottom: layout.s(40),
        paddingTop: layout.s(8),
      },
      content: {
        flex: 1,
        paddingHorizontal: layout.s(16),
      },
      headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: layout.s(20),
      },
      headerButtons: {
        flexDirection: "row",
        gap: layout.s(10),
      },
      headerButton: {
        width: layout.s(40),
        height: layout.s(40),
        borderRadius: layout.s(16),
        alignItems: "center",
        justifyContent: "center",
      },
      sectionLabel: {
        marginTop: layout.s(16),
        marginBottom: layout.s(8),
      },
      slider: {
        marginTop: layout.s(16),
      },
    };
  };
