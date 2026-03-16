import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type NotAuthenticatedViewStyles = {
  /** Контейнер неавторизованого стану */
  notAuthContainer: ViewStyle;
  /** Кругла область аватара (плейсхолдер) */
  avatarOuter: ViewStyle;
  /** Заголовок "Увійдіть в акаунт" */
  notAuthTitle: TextStyle;
  /** Підзаголовок з поясненням */
  notAuthSubtitle: TextStyle;
  /** Кнопка входу через Hikka */
  loginButton: ViewStyle;
  /** Текст кнопки входу */
  loginButtonText: TextStyle;
};

export const useNotAuthenticatedViewStyles =
  (): NotAuthenticatedViewStyles => {
    const layout = useLayout();

    return {
      notAuthContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: layout.s(40),
      },
      avatarOuter: {
        width: layout.s(90),
        height: layout.s(90),
        borderRadius: layout.s(45),
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      },
      notAuthTitle: {
        fontFamily: "Nunito-Bold",
        marginTop: layout.s(20),
        textAlign: "center",
      },
      notAuthSubtitle: {
        fontFamily: "Nunito-Regular",
        marginTop: layout.s(8),
        textAlign: "center",
        lineHeight: layout.s(20),
      },
      loginButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: layout.s(14),
        paddingHorizontal: layout.s(24),
        borderRadius: layout.s(12),
        marginTop: layout.s(24),
        gap: layout.s(10),
      },
      loginButtonText: {
        fontFamily: "Nunito-Bold",
      },
    };
  };
