import React, { useState, useCallback, memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useThemeColors } from "../Global/useTheme";
import { H5, H6 } from "../Styles/Fonts";
import { TouchableOpacity } from "../Widgets/Button";
import Icon from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { HikkaAuthService } from "../Services/HikkaAuthService";
import Logger from "../Logger/Logger";
import MarkdownComponent from "./MarkdownComponent";

/**
 * Single comment item component
 */
const CommentItem = memo(function CommentItem({
  comment,
  themeColors,
  isReply = false,
  onReply,
  onVote,
  votingMap,
  depth = 0,
}) {
  const [showReplies, setShowReplies] = useState(false);

  const handleToggleReplies = useCallback(() => {
    setShowReplies((prev) => !prev);
  }, []);

  const handleReply = useCallback(() => {
    onReply?.(comment);
  }, [comment, onReply]);

  const isVoting = Boolean(votingMap?.[comment.reference]);
  const handleVote = useCallback(
    (score) => {
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
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
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
          <View
            style={[styles.avatar, { backgroundColor: themeColors.background }]}
          >
            <Icon.User size={24} color={themeColors.primary} />
          </View>
        ) : (
          <View
            style={[styles.avatar, { backgroundColor: themeColors.background }]}
          >
            <Icon.User size={24} color={themeColors.primary} />
          </View>
        )}

        {/* Username */}
        <View style={styles.headerContent}>
          <Text style={[H5, styles.username, { color: themeColors.text }]}>
            {comment.author?.username || "Користувач AniUa"}
          </Text>
          {comment.created && (
            <Text style={[H6, { color: themeColors.Text(0.5) }]}>
              {formatDate(comment.created)}
            </Text>
          )}
        </View>
      </View>

      {/* Comment text */}
      <MarkdownComponent>{comment.text}</MarkdownComponent>

      {/* Vote row */}
      <View style={styles.voteRow}>
        <TouchableOpacity
          style={[
            styles.voteButton,
            {
              backgroundColor:
                comment.my_score === 1
                  ? themeColors.primary
                  : themeColors.background,
            },
          ]}
          onPress={() => handleVote(comment.my_score === 1 ? 0 : 1)}
          disabled={isVoting || !HikkaAuthService.isAuthenticated()}
        >
          <Icon.ThumbsUp
            size={18}
            color={
              comment.my_score === 1
                ? themeColors.text
                : themeColors.inActiveText
            }
            weight={comment.my_score === 1 ? "fill" : "regular"}
          />
        </TouchableOpacity>

        <Text style={[H6, { color: themeColors.text }]}>
          {comment.vote_score ?? 0}
        </Text>

        <TouchableOpacity
          style={[
            styles.voteButton,
            {
              backgroundColor:
                comment.my_score === -1
                  ? themeColors.primary
                  : themeColors.background,
            },
          ]}
          onPress={() => handleVote(comment.my_score === -1 ? 0 : -1)}
          disabled={isVoting || !HikkaAuthService.isAuthenticated()}
        >
          <Icon.ThumbsDown
            size={18}
            color={
              comment.my_score === -1
                ? themeColors.text
                : themeColors.inActiveText
            }
            weight={comment.my_score === -1 ? "fill" : "regular"}
          />
        </TouchableOpacity>
      </View>

      {/* Reply button */}
      {HikkaAuthService.isAuthenticated() && depth < 2 && (
        <TouchableOpacity
          style={[
            styles.replyButton,
            { backgroundColor: themeColors.background },
          ]}
          onPress={handleReply}
        >
          <Text style={[H6, { color: themeColors.text }]}>Відповісти</Text>
        </TouchableOpacity>
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

            <Text style={[H5, { color: themeColors.text }]}>
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
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.reference}
                  comment={reply}
                  themeColors={themeColors}
                  isReply={true}
                  onReply={onReply}
                  onVote={onVote}
                  votingMap={votingMap}
                  depth={depth + 1}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
});

/**
 * Comment input component
 */
const CommentInput = memo(function CommentInput({
  themeColors,
  onSubmit,
  replyTo,
  onCancelReply,
  isSubmitting,
}) {
  const [text, setText] = useState("");

  const handleSubmit = useCallback(() => {
    if (text.trim() && !isSubmitting) {
      onSubmit(text.trim());
      setText("");
      Keyboard.dismiss();
    }
  }, [text, onSubmit, isSubmitting]);

  return (
    <View style={styles.inputContainer}>
      {/* Reply indicator */}
      {replyTo && (
        <View
          style={[
            styles.replyIndicator,
            { backgroundColor: themeColors.subtle },
          ]}
        >
          <Text style={[H6, { color: themeColors.Text(0.7), flex: 1 }]}>
            Відповідь для {replyTo.author?.username || "користувача"}
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Icon.X size={18} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: themeColors.subtle,
              color: themeColors.text,
            },
          ]}
          placeholder="Написати коментар..."
          placeholderTextColor={themeColors.Text(0.4)}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
          editable={!isSubmitting}
        />
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
              size={20}
              color={
                text.trim() ? themeColors.inActiveIcon : themeColors.Text(0.3)
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

/**
 * Comments section component for anime preview
 * @param {string} slug - Anime slug for loading comments
 * @param {string} contentType - Content type (default: "anime")
 */
function CommentsSection({ slug, contentType = "anime" }) {
  const themeColors = useThemeColors();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingMap, setVotingMap] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);

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
  const transformComments = (apiComments) => {
    if (!apiComments || !Array.isArray(apiComments)) return [];

    const hasNestedReplies = apiComments.some(
      (comment) => Array.isArray(comment.replies) && comment.replies.length > 0
    );

    const getParentRef = (parent) => {
      if (!parent) return null;
      if (typeof parent === "string") return parent;
      if (typeof parent === "object") return parent.reference || null;
      return null;
    };

    const normalizeReplies = (comment) => ({
      ...comment,
      replies: (comment.replies || []).map(normalizeReplies),
    });

    if (hasNestedReplies) {
      const normalized = apiComments.map(normalizeReplies);
      normalized.sort((a, b) => (b.created || 0) - (a.created || 0));
      return normalized;
    }

    // Flat list fallback
    const commentMap = new Map();
    const rootComments = [];

    apiComments.forEach((comment) => {
      commentMap.set(comment.reference, {
        ...comment,
        replies: [],
      });
    });

    apiComments.forEach((comment) => {
      const commentObj = commentMap.get(comment.reference);
      const parentRef = getParentRef(comment.parent);
      if (parentRef) {
        const parent = commentMap.get(parentRef);
        if (parent) {
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

  // Handle reply
  const handleReply = useCallback((comment) => {
    setReplyTo(comment);
  }, []);

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const updateCommentVote = useCallback((items, reference, updater) => {
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
  }, []);

  const handleVote = useCallback(
    async (comment, score) => {
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

  // Submit comment
  const handleSubmitComment = useCallback(
    async (text) => {
      if (!HikkaAuthService.isAuthenticated()) {
        Logger.warn("CommentsSection", "User not authenticated");
        return;
      }

      setIsSubmitting(true);

      try {
        const data = {
          text,
          ...(replyTo && { parent: replyTo.reference }),
        };

        await HikkaApiComplete.writeComment(contentType, slug, data);

        // Reload comments after successful submission
        await loadComments();
        setReplyTo(null);
      } catch (err) {
        Logger.error("CommentsSection", "Failed to submit comment", err);
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
        <Text style={[H5, { color: themeColors.Text(0.5) }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: themeColors.subtle }]}
          onPress={loadComments}
        >
          <Text style={[H5, { color: themeColors.primary }]}>
            Спробувати ще
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      {/* Comment input (only for authenticated users) */}
      {HikkaAuthService.isAuthenticated() && (
        <CommentInput
          themeColors={themeColors}
          onSubmit={handleSubmitComment}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[H5, { color: themeColors.Text(0.5) }]}>
            Коментарів поки немає
          </Text>
          {HikkaAuthService.isAuthenticated() && (
            <Text style={[H6, { color: themeColors.Text(0.3), marginTop: 4 }]}>
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
              votingMap={votingMap}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  voteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  replyButton: {
    marginTop: 4,
    padding: 10,
    borderRadius: 16,
    alignSelf: "flex-end",
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
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    fontFamily: "Nunito-Regular",
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
