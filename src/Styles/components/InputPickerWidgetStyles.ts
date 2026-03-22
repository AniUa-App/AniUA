import type { ViewStyle, TextStyle } from "react-native";
import { useLayout } from "../Layout";
import { useThemeColors } from "../../Global/useTheme";
import { H4, H5 } from "../Fonts";

type InputPickerStyles = {
  /** Тригер-кнопка (закритий стан) */
  trigger: ViewStyle;
  /** Інпут-рядок у відкритому модалі */
  activeInput: ViewStyle;
  /** Стиль тексту в TextInput */
  inputText: TextStyle;
  /** Рядок однієї опції в списку */
  option: ViewStyle;
  /** Текст опції */
  optionText: TextStyle;
  /** Статична частина дропдауну */
  dropdown: ViewStyle;
  /** Динамічна частина дропдауну (позиція + розміри + кольори) */
  dropdownPositioned: (anchor: {
    x: number;
    y: number;
    width: number;
  }, maxHeight: number) => ViewStyle;
  /** Контейнер чипів */
  chipsContainer: ViewStyle;
  /** Один чип */
  chip: ViewStyle;
  /** Кнопка видалення чипа */
  chipRemove: ViewStyle;
  /** Текст чипа */
  chipText: TextStyle;
  /** Розмір іконок (CaretDown, Check, Plus, XCircle тощо) */
  iconSize: number;
  /** Колір акцентних іконок (Check) */
  iconPrimaryColor: string;
  /** Колір звичайних іконок (Plus, CaretDown, CaretUp, XCircle) */
  iconColor: string;
  /** Колір плейсхолдера */
  placeholderColor: string;
};

export const useInputPickerWidgetStyles = (): InputPickerStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  const inputRow: ViewStyle = {
    height: layout.sizing.touch,
    borderRadius: layout.radius.lg,
    paddingHorizontal: layout.s(14),
    alignItems: "center",
    flexDirection: "row",
    opacity: 0.95,
  };

  return {
    trigger: {
      ...inputRow,
      backgroundColor: themeColors.accent,
    },
    activeInput: {
      ...inputRow,
      backgroundColor: themeColors.subtle,
    },
    inputText: {
      ...H4,
      color: themeColors.text,
      flex: 1,
    },
    option: {
      paddingHorizontal: layout.spacing.md,
      paddingVertical: layout.spacing.xmd,
      borderRadius: layout.radius.sm,
      marginHorizontal: layout.spacing.sm,
      marginVertical: layout.spacing.xsm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionText: {
      ...H5,
      color: themeColors.text,
    },
    dropdown: {
      borderRadius: layout.radius.lg,
      borderWidth: 1,
      paddingVertical: layout.spacing.xsm,
      zIndex: 10,
    },
    dropdownPositioned: (anchor, maxHeight) => ({
      position: "absolute",
      left: anchor.x,
      top: anchor.y + layout.sizing.touch + layout.spacing.sm,
      width: anchor.width,
      backgroundColor: themeColors.background,
      borderColor: themeColors.subtle,
      maxHeight,
    }),
    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: layout.spacing.sm,
      paddingTop: layout.spacing.xmd,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.spacing.xmd,
      paddingVertical: layout.spacing.xsm,
      borderRadius: layout.radius.lg,
      backgroundColor: themeColors.primary,
    },
    chipRemove: {
      marginRight: layout.spacing.xsm,
    },
    chipText: {
      ...H5,
      color: themeColors.text,
    },
    iconSize: layout.icon.sm,
    iconPrimaryColor: themeColors.primary,
    iconColor: themeColors.text,
    placeholderColor: themeColors.text,
  };
};
