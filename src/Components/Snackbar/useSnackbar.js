import { useState, useCallback } from "react";

/**
 * Hook для керування Snackbar
 *
 * @example
 * const { snackbar, showSnackbar, showConfirmSnackbar } = useSnackbar();
 *
 * // Показати простий snackbar внизу
 * showSnackbar("Відео завантажено");
 *
 * // Показати snackbar з action
 * showSnackbar("Файл видалено", {
 *   actionLabel: "Скасувати",
 *   onActionPress: () => console.log("Undo clicked"),
 *   duration: 5000
 * });
 *
 * // Показати snackbar підтвердження
 * showConfirmSnackbar("Ви впевнені?", {
 *   onConfirm: () => console.log("Confirmed"),
 *   onDecline: () => console.log("Declined"),
 *   confirmLabel: "Так",
 *   declineLabel: "Ні"
 * });
 *
 * // В render:
 * return (
 *   <>
 *     <YourContent />
 *     {snackbar}
 *   </>
 * );
 */
export function useSnackbar() {
  const [snackbarState, setSnackbarState] = useState({
    visible: false,
    message: "",
    actionLabel: null,
    onActionPress: null,
    duration: 4000,
    isConfirm: false,
    confirmLabel: "Так",
    declineLabel: "Ні",
    onConfirm: null,
    onDecline: null,
  });

  const [snackbarTopState, setSnackbarTopState] = useState({
    visible: false,
    message: "",
    actionLabel: null,
    onActionPress: null,
    duration: 4000,
  });

  const showSnackbar = useCallback((message, options = {}) => {
    setSnackbarState({
      visible: true,
      message,
      actionLabel: options.actionLabel || null,
      onActionPress: options.onActionPress || null,
      duration: options.duration || 4000,
      isConfirm: false,
      confirmLabel: "Так",
      declineLabel: "Ні",
      onConfirm: null,
      onDecline: null,
    });
  }, []);

  const showConfirmSnackbar = useCallback((message, options = {}) => {
    setSnackbarState({
      visible: true,
      message,
      actionLabel: null,
      onActionPress: null,
      duration: 0,
      isConfirm: true,
      confirmLabel: options.confirmLabel || "Так",
      declineLabel: options.declineLabel || "Ні",
      onConfirm: options.onConfirm || null,
      onDecline: options.onDecline || null,
    });
  }, []);

  const showSnackbarTop = useCallback((message, options = {}) => {
    setSnackbarTopState({
      visible: true,
      message,
      actionLabel: options.actionLabel || null,
      onActionPress: options.onActionPress || null,
      duration: options.duration || 4000,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbarState((prev) => ({ ...prev, visible: false }));
  }, []);

  const hideSnackbarTop = useCallback(() => {
    setSnackbarTopState((prev) => ({ ...prev, visible: false }));
  }, []);

  const Snackbar = require("./SnackbarWidget").default;

  const snackbar = (
    <Snackbar
      visible={snackbarState.visible}
      message={snackbarState.message}
      actionLabel={snackbarState.actionLabel}
      onActionPress={snackbarState.onActionPress}
      duration={snackbarState.duration}
      onDismiss={hideSnackbar}
      position="bottom"
      isConfirm={snackbarState.isConfirm}
      confirmLabel={snackbarState.confirmLabel}
      declineLabel={snackbarState.declineLabel}
      onConfirm={snackbarState.onConfirm}
      onDecline={snackbarState.onDecline}
    />
  );

  const snackbarTop = (
    <Snackbar
      visible={snackbarTopState.visible}
      message={snackbarTopState.message}
      actionLabel={snackbarTopState.actionLabel}
      onActionPress={snackbarTopState.onActionPress}
      duration={snackbarTopState.duration}
      onDismiss={hideSnackbarTop}
      position="top"
    />
  );

  return {
    snackbar,
    snackbarTop,
    showSnackbar,
    showSnackbarTop,
    showConfirmSnackbar,
    hideSnackbar,
    hideSnackbarTop,
  };
}
