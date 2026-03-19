import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type CommentsSectionStyles = {
  /** Зовнішній контейнер секції коментарів */
  sectionContainer: ViewStyle;
  /** Напівпрозорий оверлей модального вікна */
  modalOverlay: ViewStyle;
  /** contentContainerStyle для ScrollView */
  container: ViewStyle;
  /** Центрований контейнер для стану завантаження/помилки */
  centerContainer: ViewStyle;
  /** Контейнер одного коментаря */
  commentContainer: ViewStyle;
  /** Відступи для відповіді (вкладений коментар) */
  replyContainer: ViewStyle;
  /** Рядок заголовка коментаря (аватар + ім'я + голосування) */
  commentHeader: ViewStyle;
  /** Аватар користувача */
  avatar: ViewStyle;
  /** Блок з ім'ям та датою */
  headerContent: ViewStyle;
  /** Стиль імені користувача (SemiBold) */
  username: TextStyle;
  /** Текст коментаря */
  commentText: TextStyle;
  /** Рядок кнопок голосування */
  voteRow: ViewStyle;
  /** Кнопка голосування (вгору/вниз) */
  voteButton: ViewStyle;
  /** Кнопка редагування або видалення */
  editAndDeleteButton: ViewStyle;
  /** Кнопка відповіді */
  replyButton: ViewStyle;
  /** Горизонтальний роздільник */
  divider: ViewStyle;
  /** Кнопка показу/приховання відповідей */
  toggleRepliesButton: ViewStyle;
  /** Контейнер списку відповідей */
  repliesList: ViewStyle;
  /** Стан коли коментарів немає */
  emptyContainer: ViewStyle;
  /** Кнопка "Спробувати ще" */
  retryButton: ViewStyle;
  /** Контейнер поля введення коментаря */
  inputContainer: ViewStyle;
  /** Індикатор відповіді/редагування */
  replyIndicator: ViewStyle;
  /** Рядок дій (редагувати/видалити + відповісти) */
  commentActions: ViewStyle;
  /** Ліва група кнопок (редагувати/видалити) */
  bottomLeftButtonsContainer: ViewStyle;
  /** Рядок поля вводу та кнопки відправки */
  inputRow: ViewStyle;
  /** Поле введення тексту коментаря */
  textInput: TextStyle;
  /** Кнопка відправки коментаря */
  sendButton: ViewStyle;
};

export const useCommentsSectionStyles = (): CommentsSectionStyles => {
  const layout = useLayout();

  return {
    sectionContainer: {
      width: "100%",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "transparent",
    },
    container: {
      width: "100%",
    },
    centerContainer: {
      padding: layout.spacing.xxl,
      alignItems: "center",
      justifyContent: "center",
    },
    commentContainer: {
      padding: layout.spacing.lg,
      borderRadius: layout.radius.lg,
    },
    replyContainer: {
      marginLeft: layout.spacing.xs,
      marginTop: layout.spacing.xs,
      paddingTop: layout.spacing.lg,
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: layout.spacing.md,
    },
    avatar: {
      width: layout.sizing.touch,
      height: layout.sizing.touch,
      borderRadius: layout.s(22),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    headerContent: {
      flex: 1,
      marginLeft: layout.spacing.md,
    },
    username: {
      fontFamily: "Nunito-SemiBold",
    },
    commentText: {
      lineHeight: layout.s(22),
      marginTop: layout.spacing.xs,
    },
    voteRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.spacing.sm,
      marginTop: layout.spacing.sm,
      borderRadius: layout.radius.lg,
      padding: layout.spacing.xs,
    },
    voteButton: {
      width: layout.sizing.touchXs,
      height: layout.sizing.touchXs,
      borderRadius: layout.radius.xmd,
      justifyContent: "center",
      alignItems: "center",
    },
    editAndDeleteButton: {
      marginTop: layout.spacing.xs,
      padding: layout.spacing.lg,
      borderRadius: layout.radius.lg,
      justifyContent: "center",
      alignItems: "center",
      width: layout.sizing.touchSm,
      height: layout.sizing.touchSm,
    },
    replyButton: {
      marginTop: layout.spacing.xs,
      paddingHorizontal: layout.spacing.xmd,
      borderRadius: layout.radius.lg,
      height: layout.sizing.touchSm,
      justifyContent: "center",
      alignItems: "center",
    },
    divider: {
      height: 1,
      marginTop: layout.spacing.xlg,
      borderRadius: layout.radius.lg,
      flex: 1,
      bottom: layout.spacing.xs,
      marginBottom: layout.spacing.sm,
    },
    toggleRepliesButton: {
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
      paddingVertical: layout.spacing.md,
      gap: layout.spacing.sm,
    },
    repliesList: {
      marginTop: layout.spacing.xs,
      flex: 1,
    },
    emptyContainer: {
      padding: layout.spacing.xl,
      alignItems: "center",
    },
    retryButton: {
      marginTop: layout.spacing.md,
      paddingVertical: layout.spacing.xmd,
      paddingHorizontal: layout.spacing.xlg,
      borderRadius: layout.radius.sm,
    },
    inputContainer: {
      marginBottom: layout.spacing.lg,
      width: "100%",
    },
    replyIndicator: {
      flexDirection: "row",
      alignItems: "center",
      padding: layout.spacing.xmd,
      borderRadius: layout.radius.sm,
      marginBottom: layout.spacing.sm,
    },
    commentActions: {
      flexDirection: "row",
      gap: layout.spacing.sm,
    },
    bottomLeftButtonsContainer: {
      flexDirection: "row",
      gap: layout.spacing.sm,
      justifyContent: "space-between",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: layout.spacing.sm,
      width: "100%",
    },
    textInput: {
      flex: 1,
      flexGrow: 1,
      minHeight: layout.sizing.touch,
      paddingHorizontal: layout.spacing.lg,
      paddingVertical: layout.spacing.md,
      borderRadius: layout.radius.md,
      fontSize: layout.font.md,
      fontFamily: "Nunito-Regular",
      lineHeight: layout.spacing.xlg,
    },
    sendButton: {
      width: layout.sizing.touch,
      height: layout.sizing.touch,
      borderRadius: layout.radius.md,
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
