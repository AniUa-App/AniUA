import React, { useState, useCallback, memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from "react-native";
import Snackbar from "./Snackbar/SnackbarWidget";
import { useThemeColors } from "../Global/useTheme";
import { H5, H6 } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Icon from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import Logger from "../Logger/Logger";
import Clipboard from "@react-native-clipboard/clipboard";
import MarkdownComponent from "./MarkdownComponent";
import { SelectableTextInputWrapper } from "react-native-selectable-text-input";
import {
  MarkdownTextInput,
  parseExpensiMark,
} from "@expensify/react-native-live-markdown";

// Custom parser that extends parseExpensiMark with spoiler support
function parseWithSpoiler(text: string) {
  "worklet";
  // Get base ranges from ExpensiMark
  const ranges = parseExpensiMark(text);

  // Find spoiler blocks :::spoiler ... :::
  const spoilerRegex = /:::\s*spoiler\b/gi;
  const closingRegex = /:::/g;

  let match;
  const openings: { index: number; length: number }[] = [];
  const closings: number[] = [];

  // Find all :::spoiler openings
  while ((match = spoilerRegex.exec(text)) !== null) {
    openings.push({ index: match.index, length: match[0].length });
  }

  // Find all ::: closings (that are not openings)
  while ((match = closingRegex.exec(text)) !== null) {
    // Skip if this is part of an opening
    const isOpening = openings.some(
      (o) => match.index >= o.index && match.index < o.index + o.length
    );
    if (!isOpening) {
      closings.push(match.index);
    }
  }

  // Match openings with closings and add blockquote ranges
  for (let i = 0; i < openings.length; i++) {
    const opening = openings[i];
    // Find the next closing after this opening
    const closingIndex = closings.find(
      (c) => c > opening.index + opening.length
    );

    if (closingIndex !== undefined) {
      // Add syntax range for opening :::spoiler
      ranges.push({
        type: "syntax",
        start: opening.index,
        length: opening.length,
      });

      // Add blockquote range for content between opening and closing
      const contentStart = opening.index + opening.length;
      const contentLength = closingIndex - contentStart;
      if (contentLength > 0) {
        ranges.push({
          type: "blockquote",
          start: contentStart,
          length: contentLength,
          depth: 1,
        });
      }

      // Add syntax range for closing :::
      ranges.push({
        type: "syntax",
        start: closingIndex,
        length: 3,
      });
    }
  }

  return ranges;
}

const COMMENT_MENU_COPY = "Копіювати";
const COMMENT_MENU_OPTIONS = [
  COMMENT_MENU_COPY,
  "Жирний",
  "Курсив",
  "Спойлер",
  "Цитата",
];
const COMMENT_MENU_FORMATTERS: Record<
  string,
  { prefix: string; suffix: string }
> = {
  Жирний: { prefix: "**", suffix: "**" },
  Курсив: { prefix: "*", suffix: "*" },
  Спойлер: { prefix: ":::spoiler\n", suffix: "\n:::" },
  Цитата: { prefix: "> ", suffix: "" },
};

interface Author {
  username?: string;
  avatar?: string;
}

interface Comment {
  reference: string;
  text: string;
  author?: Author;
  created?: number;
  my_score?: number;
  vote_score?: number;
  replies?: Comment[];
  total_replies?: number;
  parent?: string | { reference: string };
}

interface VotingMap {
  [key: string]: boolean;
}

interface CommentItemProps {
  comment: Comment;
  themeColors: any;
  isReply?: boolean;
  onReply?: (comment: Comment) => void;
  onVote?: (comment: Comment, score: number) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
  votingMap?: VotingMap;
  depth?: number;
  currentUsername?: string | null;
}

/**
 * Single comment item component
 */
const CommentItem = memo(function CommentItem({
  comment,
  themeColors,
  isReply = false,
  onReply,
  onVote,
  onEdit,
  onDelete,
  votingMap,
  depth = 0,
  currentUsername,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor =
    currentUsername && comment.author?.username === currentUsername;

  const handleToggleReplies = useCallback(() => {
    setShowReplies((prev) => !prev);
  }, []);

  const handleReply = useCallback(() => {
    onReply?.(comment);
  }, [comment, onReply]);

  const handleEdit = useCallback(() => {
    setTimeout(() => onEdit?.(comment), 400);
  }, [comment, onEdit]);

  const handleDelete = useCallback(() => {
    setTimeout(() => {
      onDelete?.(comment);
    }, 400);
  }, [comment, onDelete]);

  const isVoting = Boolean(votingMap?.[comment.reference]);
  const handleVote = useCallback(
    (score: number) => {
      if (isVoting) return;
      onVote?.(comment, score);
    },
    [comment, isVoting, onVote]
  );

  const repliesCount = Math.max(
    comment.replies?.length || 0,
    comment.total_replies || 0
  );

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "щойно";
    if (minutes < 60) return `${minutes} хв тому`;
    if (hours < 24) return `${hours} год тому`;
    if (days < 7) return `${days} дн тому`;
    return date.toLocaleDateString("uk-UA");
  };

  return (
    <View
      style={[
        styles.commentContainer,
        isReply && styles.replyContainer,
        { backgroundColor: themeColors.accent },
      ]}
    >
      {/* Comment header */}
      <View style={styles.commentHeader}>
        {/* Avatar */}
        {comment.author?.avatar ? (
          <Image
            source={{ uri: comment.author.avatar }}
            style={[styles.avatar, { backgroundColor: themeColors.background }]}
          />
        ) : (
          <View
            style={[styles.avatar, { backgroundColor: themeColors.background }]}
          >
            <Icon.User size={24} color={themeColors.primary} />
          </View>
        )}

        {/* Username */}
        <View style={styles.headerContent}>
          <Text
            selectable={true}
            style={[H5, styles.username, { color: themeColors.text }]}
          >
            {comment.author?.username || "Користувач AniUa"}
          </Text>
          {comment.created && (
            <Text
              selectable={true}
              style={[H6, { color: themeColors.Text(0.5) }]}
            >
              {formatDate(comment.created)}
            </Text>
          )}
        </View>
        {/* Vote row */}
        <View
          style={[styles.voteRow, { backgroundColor: themeColors.background }]}
        >
          <TouchableOpacity
            style={[styles.voteButton, {}]}
            onPress={() => handleVote(comment.my_score === 1 ? 0 : 1)}
            disabled={isVoting || !HikkaAuthService.isAuthenticated()}
          >
            <Icon.ThumbsUp
              size={18}
              color={
                comment.my_score === 1
                  ? themeColors.primary
                  : themeColors.inActiveText
              }
              weight={comment.my_score === 1 ? "fill" : "regular"}
            />
          </TouchableOpacity>

          <Text selectable={true} style={[H6, { color: themeColors.text }]}>
            {comment.vote_score ?? 0}
          </Text>

          <TouchableOpacity
            style={[styles.voteButton, {}]}
            onPress={() => handleVote(comment.my_score === -1 ? 0 : -1)}
            disabled={isVoting || !HikkaAuthService.isAuthenticated()}
          >
            <Icon.ThumbsDown
              size={18}
              color={
                comment.my_score === -1
                  ? themeColors.primary
                  : themeColors.inActiveText
              }
              weight={comment.my_score === -1 ? "fill" : "regular"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comment text */}
      <MarkdownComponent>{comment.text}</MarkdownComponent>

      {/* Reply button */}
      {HikkaAuthService.isAuthenticated() && depth < 2 && (
        <View
          style={[
            styles.commentActions,
            {
              justifyContent: isAuthor ? "space-between" : "flex-end",
            },
          ]}
        >
          {isAuthor && (
            <View style={styles.bottomLeftButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.editAndDeleteButton,
                  { backgroundColor: themeColors.background },
                ]}
                onPress={handleEdit}
              >
                <Icon.PencilSimple size={24} color={themeColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editAndDeleteButton,
                  { backgroundColor: themeColors.background },
                ]}
                onPress={handleDelete}
              >
                <Icon.Trash size={24} color={themeColors.redBookmark} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.replyButton,
              { backgroundColor: themeColors.background },
            ]}
            onPress={handleReply}
          >
            <Text selectable={true} style={[H6, { color: themeColors.text }]}>
              Відповісти
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Replies section */}
      {repliesCount > 0 && (
        <>
          <TouchableOpacity
            style={styles.toggleRepliesButton}
            onPress={handleToggleReplies}
          >
            {/* Divider */}
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: themeColors.primary,
                },
              ]}
            />

            {/* Toggle replies button */}

            <Text selectable={true} style={[H5, { color: themeColors.text }]}>
              {showReplies ? "Сховати" : `Подивитись відповіді`}
            </Text>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: themeColors.primary,
                },
              ]}
            />
          </TouchableOpacity>

          {/* Replies list */}
          {showReplies && (
            <View style={styles.repliesList}>
              {comment.replies?.map((reply) => (
                <CommentItem
                  key={reply.reference}
                  comment={reply}
                  themeColors={themeColors}
                  isReply={true}
                  onReply={onReply}
                  onVote={onVote}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  votingMap={votingMap}
                  depth={depth + 1}
                  currentUsername={currentUsername}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
});

interface CommentInputProps {
  themeColors: any;
  onSubmit: (text: string, editingComment: Comment | null) => void;
  replyTo: Comment | null;
  onCancelReply: () => void;
  editingComment: Comment | null;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

/**
 * Comment input component with native formatting menu
 */
const CommentInput = memo(function CommentInput({
  themeColors,
  onSubmit,
  replyTo,
  onCancelReply,
  editingComment,
  onCancelEdit,
  isSubmitting,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Set text when editing starts
  useEffect(() => {
    if (editingComment) {
      setText(editingComment.text || "");
    }
  }, [editingComment]);

  const markdownStyle = {
    syntax: {
      color: themeColors.Text(0.4),
    },
    bold: {
      fontFamily: "Nunito-Bold",
    },
    italic: {
      fontFamily: "Nunito-Italic",
    },
    strikethrough: {
      textDecorationLine: "line-through",
    },
    link: {
      color: themeColors.primary,
    },
    blockquote: {
      borderColor: themeColors.primary,
      borderWidth: 2,
      marginLeft: 6,
      paddingLeft: 6,
    },
  };

  const handleSubmit = useCallback(() => {
    if (text.trim() && !isSubmitting) {
      onSubmit(text.trim(), editingComment);
      setText("");
      Keyboard.dismiss();
    }
  }, [text, onSubmit, isSubmitting, editingComment]);

  const handleCancel = useCallback(() => {
    if (editingComment) {
      onCancelEdit?.();
      setText("");
    } else if (replyTo) {
      onCancelReply?.();
    }
  }, [editingComment, replyTo, onCancelEdit, onCancelReply]);

  const handleSelectionChange = useCallback(
    (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setSelection(event.nativeEvent.selection);
    },
    []
  );

  const handleMenuSelection = useCallback(
    (event: any) => {
      if (event.chosenOption === COMMENT_MENU_COPY) {
        const selectedText =
          text.substring(selection?.start ?? 0, selection?.end ?? 0) ||
          event.highlightedText ||
          "";
        if (selectedText) {
          Clipboard.setString(selectedText);
        }
        return;
      }

      const formatter = COMMENT_MENU_FORMATTERS[event.chosenOption];
      if (!formatter) return;

      const selectionStart = selection?.start ?? 0;
      const selectionEnd = selection?.end ?? 0;
      if (selectionStart === selectionEnd) return;

      const selectedText =
        text.substring(selectionStart, selectionEnd) ||
        event.highlightedText ||
        "";
      const formattedText = `${formatter.prefix}${selectedText}${formatter.suffix}`;

      const newText =
        text.substring(0, selectionStart) +
        formattedText +
        text.substring(selectionEnd);

      setText(newText);
    },
    [selection, text]
  );

  return (
    <View style={styles.inputContainer}>
      {/* Edit indicator */}
      {editingComment && (
        <View
          style={[
            styles.replyIndicator,
            { backgroundColor: themeColors.subtle },
          ]}
        >
          <Icon.PencilSimple size={16} color={themeColors.primary} />
          <Text
            selectable={true}
            style={[
              H6,
              { color: themeColors.Text(0.7), flex: 1, marginLeft: 8 },
            ]}
          >
            Редагування коментаря
          </Text>
          <TouchableOpacity onPress={handleCancel}>
            <Icon.X size={18} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Reply indicator */}
      {replyTo && !editingComment && (
        <View
          style={[
            styles.replyIndicator,
            { backgroundColor: themeColors.subtle },
          ]}
        >
          <Text
            selectable={true}
            style={[H6, { color: themeColors.Text(0.7), flex: 1 }]}
          >
            Відповідь для {replyTo.author?.username || "користувача"}
          </Text>
          <TouchableOpacity onPress={handleCancel}>
            <Icon.X size={18} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <SelectableTextInputWrapper
          menuOptions={COMMENT_MENU_OPTIONS}
          onSelection={handleMenuSelection}
          containerStyle={{ flex: 1 }}
        >
          <MarkdownTextInput
            value={text}
            onChangeText={setText}
            onSelectionChange={handleSelectionChange}
            parser={parseWithSpoiler}
            placeholder="Написати коментар..."
            placeholderTextColor={themeColors.Text(0.4)}
            editable={!isSubmitting}
            multiline
            textAlignVertical="top"
            markdownStyle={markdownStyle}
            style={[
              styles.textInput,
              {
                backgroundColor: themeColors.subtle,
                color: themeColors.text,
              },
            ]}
          />
        </SelectableTextInputWrapper>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                text.trim() && !isSubmitting
                  ? themeColors.primary
                  : themeColors.subtle,
            },
          ]}
          onPress={handleSubmit}
          disabled={!text.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={themeColors.text} />
          ) : (
            <Icon.PaperPlaneTilt
              size={24}
              color={text.trim() ? themeColors.text : themeColors.Text(0.3)}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

interface CommentsSectionProps {
  slug: string;
  contentType?: string;
}

/**
 * Comments section component for anime preview
 * @param {string} slug - Anime slug for loading comments
 * @param {string} contentType - Content type (default: "anime")
 */
function CommentsSection({
  slug,
  contentType = "anime",
}: CommentsSectionProps) {
  const themeColors = useThemeColors();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [votingMap, setVotingMap] = useState<VotingMap>({});
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    comment: Comment | null;
  }>({
    visible: false,
    comment: null,
  });

  // Get current user's username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (HikkaAuthService.isAuthenticated()) {
        try {
          const user = await HikkaApiComplete.getCurrentUser();
          setCurrentUsername(user?.username || null);
        } catch (err) {
          Logger.warn("CommentsSection", "Failed to get current user", err);
        }
      }
    };
    fetchCurrentUser();
  }, []);

  // Load comments from API
  const loadComments = useCallback(async () => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await HikkaApiComplete.getContentComments(
        contentType,
        slug
      );

      // Transform API response to our format
      const transformedComments = transformComments(response?.list || []);
      setComments(transformedComments);
    } catch (err) {
      Logger.error("CommentsSection", "Failed to load comments", err);
      setError("Не вдалося завантажити коментарі");
    } finally {
      setIsLoading(false);
    }
  }, [slug, contentType]);

  // Transform API comments to nested structure
  const transformComments = (apiComments: any[]) => {
    if (!apiComments || !Array.isArray(apiComments)) return [];

    const hasNestedReplies = apiComments.some(
      (comment) => Array.isArray(comment.replies) && comment.replies.length > 0
    );

    const getParentRef = (parent: any) => {
      if (!parent) return null;
      if (typeof parent === "string") return parent;
      if (typeof parent === "object") return parent.reference || null;
      return null;
    };

    const normalizeReplies = (comment: any): Comment => ({
      ...comment,
      replies: (comment.replies || []).map(normalizeReplies),
    });

    if (hasNestedReplies) {
      const normalized = apiComments.map(normalizeReplies);
      normalized.sort((a, b) => (b.created || 0) - (a.created || 0));
      return normalized;
    }

    // Flat list fallback
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    apiComments.forEach((comment) => {
      commentMap.set(comment.reference, {
        ...comment,
        replies: [],
      });
    });

    apiComments.forEach((comment) => {
      const commentObj = commentMap.get(comment.reference);
      if (!commentObj) return;

      const parentRef = getParentRef(comment.parent);
      if (parentRef) {
        const parent = commentMap.get(parentRef);
        if (parent && parent.replies) {
          parent.replies.push(commentObj);
        } else {
          rootComments.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    rootComments.sort((a, b) => (b.created || 0) - (a.created || 0));

    return rootComments;
  };

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadComments();
    setIsRefreshing(false);
  }, [loadComments]);

  // Handle reply
  const handleReply = useCallback((comment: Comment) => {
    setReplyTo(comment);
  }, []);

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  // Handle edit comment
  const handleEditComment = useCallback((comment: Comment) => {
    setEditingComment(comment);
    setReplyTo(null); // Cancel reply if editing
  }, []);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
  }, []);

  // Show delete confirmation
  const handleDeleteComment = useCallback((comment: Comment) => {
    if (!HikkaAuthService.isAuthenticated()) return;
    if (!comment?.reference) return;
    setDeleteConfirm({ visible: true, comment });
  }, []);

  // Confirm delete
  const confirmDeleteComment = useCallback(async () => {
    const comment = deleteConfirm.comment;
    if (!comment?.reference) return;

    setDeleteConfirm({ visible: false, comment: null });

    try {
      await HikkaApiComplete.deleteComment(comment.reference);
      await loadComments();
    } catch (err) {
      Logger.error("CommentsSection", "Failed to delete comment", err);
    }
  }, [deleteConfirm.comment, loadComments]);

  // Cancel delete
  const cancelDeleteComment = useCallback(() => {
    setDeleteConfirm({ visible: false, comment: null });
  }, []);

  const updateCommentVote = useCallback(
    (
      items: Comment[],
      reference: string,
      updater: (item: Comment) => Comment
    ): Comment[] => {
      return items.map((item) => {
        if (item.reference === reference) {
          return updater(item);
        }
        if (item.replies?.length) {
          return {
            ...item,
            replies: updateCommentVote(item.replies, reference, updater),
          };
        }
        return item;
      });
    },
    []
  );

  const handleVote = useCallback(
    async (comment: Comment, score: number) => {
      if (!HikkaAuthService.isAuthenticated()) return;
      if (!comment?.reference) return;

      setVotingMap((prev) => ({ ...prev, [comment.reference]: true }));

      const previousScore = comment.my_score || 0;
      const delta = score - previousScore;

      setComments((prev) =>
        updateCommentVote(prev, comment.reference, (item) => ({
          ...item,
          my_score: score,
          vote_score: (item.vote_score || 0) + delta,
        }))
      );

      try {
        await HikkaApiComplete.setVote("comment", comment.reference, score);
      } catch (err) {
        Logger.error("CommentsSection", "Failed to vote comment", err);
        setComments((prev) =>
          updateCommentVote(prev, comment.reference, (item) => ({
            ...item,
            my_score: previousScore,
            vote_score: (item.vote_score || 0) - delta,
          }))
        );
      } finally {
        setVotingMap((prev) => ({ ...prev, [comment.reference]: false }));
      }
    },
    [updateCommentVote]
  );

  // Submit comment (create or edit)
  const handleSubmitComment = useCallback(
    async (text: string, commentToEdit: Comment | null) => {
      if (!HikkaAuthService.isAuthenticated()) {
        Logger.warn("CommentsSection", "User not authenticated");
        return;
      }

      setIsSubmitting(true);

      try {
        if (commentToEdit) {
          // Edit existing comment
          await HikkaApiComplete.editComment(commentToEdit.reference, { text });
          setEditingComment(null);
        } else {
          // Create new comment
          const data = {
            text,
            ...(replyTo && { parent: replyTo.reference }),
          };
          await HikkaApiComplete.writeComment(contentType, slug, data);
          setReplyTo(null);
        }

        // Reload comments after successful submission
        await loadComments();
      } catch (err) {
        Logger.error("CommentsSection", "Failed to submit comment", err);
        Alert.alert(
          "Помилка",
          commentToEdit
            ? "Не вдалося редагувати коментар"
            : "Не вдалося додати коментар"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [contentType, slug, replyTo, loadComments]
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text
          selectable={true}
          style={[H5, { color: themeColors.inActiveText }]}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: themeColors.subtle }]}
          onPress={loadComments}
        >
          <Text selectable={true} style={[H5, { color: themeColors.primary }]}>
            Спробувати ще
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        contentContainerStyle={styles.container}
      >
        {/* Comment input (only for authenticated users) */}
        {HikkaAuthService.isAuthenticated() && (
          <CommentInput
            themeColors={themeColors}
            onSubmit={handleSubmitComment}
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            editingComment={editingComment}
            onCancelEdit={handleCancelEdit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              selectable={true}
              style={[H5, { color: themeColors.inActiveText }]}
            >
              Коментарів поки немає
            </Text>
            {HikkaAuthService.isAuthenticated() && (
              <Text
                selectable={true}
                style={[H6, { color: themeColors.inActiveText, marginTop: 4 }]}
              >
                Будьте першим, хто залишить коментар
              </Text>
            )}
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.reference}
                comment={comment}
                themeColors={themeColors}
                onReply={handleReply}
                onVote={handleVote}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                votingMap={votingMap}
                currentUsername={currentUsername}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete confirmation Snackbar in Modal */}
      <Modal
        visible={deleteConfirm.visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={cancelDeleteComment}
      >
        <View style={styles.modalOverlay}>
          <Snackbar
            visible={deleteConfirm.visible}
            message="Видалити цей коментар?"
            isConfirm
            confirmLabel="Так"
            declineLabel="Ні"
            onConfirm={confirmDeleteComment}
            onDecline={cancelDeleteComment}
            onDismiss={cancelDeleteComment}
            position="bottom"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  commentContainer: {
    padding: 16,
    borderRadius: 16,
  },
  replyContainer: {
    marginLeft: 4,
    marginTop: 4,
    paddingTop: 16,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontFamily: "Nunito-SemiBold",
  },
  commentText: {
    lineHeight: 22,
    marginTop: 4,
  },
  voteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    borderRadius: 16,
    padding: 4,
  },
  voteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editAndDeleteButton: {
    marginTop: 4,
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    width: 38,
    height: 38,
  },
  replyButton: {
    marginTop: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginTop: 20,
    borderRadius: 16,
    flex: 1,
    bottom: 4,
    marginBottom: 8,
  },
  toggleRepliesButton: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  repliesList: {
    marginTop: 4,
    flex: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  // Input styles
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 8,
  },
  bottomLeftButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    width: "100%",
  },
  textInput: {
    flex: 1,
    flexGrow: 1,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    fontFamily: "Nunito-Regular",
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(CommentsSection);
