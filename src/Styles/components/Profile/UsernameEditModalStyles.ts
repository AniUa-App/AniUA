import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type UsernameEditModalStyles = {
  /** Напівпрозорий оверлей модального вікна */
  modalOverlay: ViewStyle;
  /** Вміст модального вікна */
  modalContent: ViewStyle;
  /** Заголовок модального вікна */
  modalTitle: TextStyle;
  /** Контейнер поля введення */
  modalInputContainer: ViewStyle;
  /** Поле введення */
  modalInput: TextStyle;
  /** Рядок кнопок дії */
  modalButtons: ViewStyle;
  /** Кнопка дії (скасувати/зберегти) */
  modalButton: ViewStyle;
};

export const useUsernameEditModalStyles = (): UsernameEditModalStyles => {
  const layout = useLayout();

  return {
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: layout.spacing.xl,
    },
    modalContent: {
      width: "100%",
      maxWidth: layout.s(400),
      borderRadius: layout.radius.xxlg,
      padding: layout.spacing.xl,
    },
    modalTitle: {
      textAlign: "center",
      marginBottom: layout.spacing.xlg,
    },
    modalInputContainer: {
      height: layout.s(52),
      borderRadius: layout.radius.lg,
      paddingHorizontal: layout.spacing.lg,
      justifyContent: "center",
    },
    modalInput: {
      flex: 1,
    },
    modalButtons: {
      flexDirection: "row",
      gap: layout.spacing.md,
      marginTop: layout.spacing.xl,
    },
    modalButton: {
      flex: 1,
      height: layout.s(52),
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
