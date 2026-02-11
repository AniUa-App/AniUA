import { useRef, useEffect, useCallback, useState } from "react";
import { findNodeHandle, Platform } from "react-native";

/**
 * Remembers and restores last focused element when screen regains focus.
 */
export function useFocusRestore() {
  const lastFocusedRef = useRef(null);

  const onItemFocus = useCallback((ref) => {
    lastFocusedRef.current = ref;
  }, []);

  const restoreFocus = useCallback(() => {
    if (lastFocusedRef.current && Platform.isTV) {
      const node = findNodeHandle(lastFocusedRef.current);
      if (node) {
        try {
          lastFocusedRef.current.setNativeProps?.({
            hasTVPreferredFocus: true,
          });
        } catch {
          // Silently fail if setNativeProps not available
        }
      }
    }
  }, []);

  return { onItemFocus, restoreFocus };
}

/**
 * Auto-focus a specific element on mount (TV only).
 * @param {React.RefObject} ref - Ref to the element to focus
 */
export function useAutoFocus(ref) {
  useEffect(() => {
    if (!Platform.isTV || !ref.current) return;

    // Small delay to ensure the component is mounted
    const timeout = setTimeout(() => {
      try {
        ref.current?.setNativeProps?.({
          hasTVPreferredFocus: true,
        });
      } catch {
        // Silently fail
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [ref]);
}

/**
 * Manages focus within a group of items.
 * Returns the currently focused index and handlers.
 */
export function useFocusGroup(itemCount) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleItemFocus = useCallback((index) => {
    setFocusedIndex(index);
  }, []);

  const focusNext = useCallback(() => {
    setFocusedIndex((prev) => Math.min(prev + 1, itemCount - 1));
  }, [itemCount]);

  const focusPrevious = useCallback(() => {
    setFocusedIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    focusedIndex,
    handleItemFocus,
    focusNext,
    focusPrevious,
  };
}
