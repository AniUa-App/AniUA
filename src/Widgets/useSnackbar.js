import { useState, useCallback } from "react";

/**
 * Hook для керування Snackbar
 *
 * @example
 * const { snackbar, snackbarTop, showSnackbar, showSnackbarTop } = useSnackbar();
 *
 * // Показати простий snackbar внизу
 * showSnackbar("Відео завантажено");
 *
 * // Показати snackbar вгорі з action
 * showSnackbarTop("Оновлення доступне", {
 *   actionLabel: "Оновити",
 *   onActionPress: () => console.log("Update clicked"),
 *   duration: 5000
 * });
 *
 * // Показати snackbar з action внизу
 * showSnackbar("Файл видалено", {
 *   actionLabel: "Скасувати",
 *   onActionPress: () => console.log("Undo clicked"),
 *   duration: 5000
 * });
 *
 * // В render:
 * return (
 *   <>
 *     <YourContent />
 *     {snackbar}
 *     {snackbarTop}
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
    hideSnackbar,
    hideSnackbarTop,
  };
}
