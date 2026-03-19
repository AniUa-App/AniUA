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

export const useNotAuthenticatedViewStyles = (): NotAuthenticatedViewStyles => {
  const layout = useLayout();

  return {
    notAuthContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: layout.spacing.xl3,
    },
    avatarOuter: {
      width: layout.sizing.lg,
      height: layout.sizing.lg,
      borderRadius: layout.s(45),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    notAuthTitle: {
      fontFamily: "Nunito-Bold",
      marginTop: layout.spacing.xlg,
      textAlign: "center",
    },
    notAuthSubtitle: {
      fontFamily: "Nunito-Regular",
      marginTop: layout.spacing.sm,
      textAlign: "center",
      lineHeight: layout.spacing.xlg,
    },
    loginButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: layout.s(14),
      paddingHorizontal: layout.spacing.xl,
      borderRadius: layout.radius.md,
      marginTop: layout.spacing.xl,
      gap: layout.spacing.xmd,
    },
    loginButtonText: {
      fontFamily: "Nunito-Bold",
    },
  };
};
