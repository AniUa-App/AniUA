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
      flex: 1,
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
      padding: layout.s(32),
      alignItems: "center",
      justifyContent: "center",
    },
    commentContainer: {
      padding: layout.s(16),
      borderRadius: layout.s(16),
    },
    replyContainer: {
      marginLeft: layout.s(4),
      marginTop: layout.s(4),
      paddingTop: layout.s(16),
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: layout.s(12),
    },
    avatar: {
      width: layout.s(44),
      height: layout.s(44),
      borderRadius: layout.s(22),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    headerContent: {
      flex: 1,
      marginLeft: layout.s(12),
    },
    username: {
      fontFamily: "Nunito-SemiBold",
    },
    commentText: {
      lineHeight: layout.s(22),
      marginTop: layout.s(4),
    },
    voteRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: layout.s(8),
      marginTop: layout.s(8),
      borderRadius: layout.s(16),
      padding: layout.s(4),
    },
    voteButton: {
      width: layout.s(32),
      height: layout.s(32),
      borderRadius: layout.s(10),
      justifyContent: "center",
      alignItems: "center",
    },
    editAndDeleteButton: {
      marginTop: layout.s(4),
      padding: layout.s(16),
      borderRadius: layout.s(16),
      justifyContent: "center",
      alignItems: "center",
      width: layout.s(38),
      height: layout.s(38),
    },
    replyButton: {
      marginTop: layout.s(4),
      paddingHorizontal: layout.s(10),
      borderRadius: layout.s(16),
      height: layout.s(38),
      justifyContent: "center",
      alignItems: "center",
    },
    divider: {
      height: 1,
      marginTop: layout.s(20),
      borderRadius: layout.s(16),
      flex: 1,
      bottom: layout.s(4),
      marginBottom: layout.s(8),
    },
    toggleRepliesButton: {
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
      paddingVertical: layout.s(12),
      gap: layout.s(8),
    },
    repliesList: {
      marginTop: layout.s(4),
      flex: 1,
    },
    emptyContainer: {
      padding: layout.s(24),
      alignItems: "center",
    },
    retryButton: {
      marginTop: layout.s(12),
      paddingVertical: layout.s(10),
      paddingHorizontal: layout.s(20),
      borderRadius: layout.s(8),
    },
    inputContainer: {
      marginBottom: layout.s(16),
      width: "100%",
    },
    replyIndicator: {
      flexDirection: "row",
      alignItems: "center",
      padding: layout.s(10),
      borderRadius: layout.s(8),
      marginBottom: layout.s(8),
    },
    commentActions: {
      flexDirection: "row",
      gap: layout.s(8),
    },
    bottomLeftButtonsContainer: {
      flexDirection: "row",
      gap: layout.s(8),
      justifyContent: "space-between",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: layout.s(8),
      width: "100%",
    },
    textInput: {
      flex: 1,
      flexGrow: 1,
      minHeight: layout.s(44),
      paddingHorizontal: layout.s(16),
      paddingVertical: layout.s(12),
      borderRadius: layout.s(12),
      fontSize: layout.font.md,
      fontFamily: "Nunito-Regular",
      lineHeight: layout.s(20),
    },
    sendButton: {
      width: layout.s(44),
      height: layout.s(44),
      borderRadius: layout.s(12),
      justifyContent: "center",
      alignItems: "center",
    },
  };
};
