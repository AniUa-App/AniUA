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
      paddingHorizontal: layout.s(24),
    },
    modalContent: {
      width: "100%",
      maxWidth: layout.s(400),
      borderRadius: layout.s(20),
      padding: layout.s(24),
    },
    modalTitle: {
      textAlign: "center",
      marginBottom: layout.s(20),
    },
    modalInputContainer: {
      height: layout.s(52),
      borderRadius: layout.s(16),
      paddingHorizontal: layout.s(16),
      justifyContent: "center",
    },
    modalInput: {
      flex: 1,
    },
    modalButtons: {
      flexDirection: "row",
      gap: layout.s(12),
      marginTop: layout.s(24),
    },
    modalButton: {
      flex: 1,
      height: layout.s(52),
      borderRadius: layout.s(16),
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
