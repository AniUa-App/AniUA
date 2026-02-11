import { useEffect, useRef } from "react";
import { Platform } from "react-native";

/**
 * Hook that wraps React Native's TV event handling.
 * Provides callbacks for common TV remote events.
 *
 * @param {Object} handlers
 * @param {Function} handlers.onSelect - D-pad center / select button
 * @param {Function} handlers.onPlayPause - Play/Pause media key
 * @param {Function} handlers.onMenu - Menu / Back button
 * @param {Function} handlers.onLeft - D-pad left
 * @param {Function} handlers.onRight - D-pad right
 * @param {Function} handlers.onUp - D-pad up
 * @param {Function} handlers.onDown - D-pad down
 * @param {Function} handlers.onLongSelect - Long press on select
 */
export default function useTVEventHandler(handlers = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!Platform.isTV) return;

    let TVEventHandler;
    try {
      // TVEventHandler is available in react-native for TV platforms
      TVEventHandler = require("react-native").TVEventHandler;
    } catch {
      return;
    }

    if (!TVEventHandler) return;

    const tvEventHandler = new TVEventHandler();

    tvEventHandler.enable(null, (cmp, evt) => {
      if (!evt || evt.eventType === "blur" || evt.eventType === "focus") return;

      const h = handlersRef.current;

      switch (evt.eventType) {
        case "select":
          h.onSelect?.();
          break;
        case "playPause":
          h.onPlayPause?.();
          break;
        case "menu":
          h.onMenu?.();
          break;
        case "left":
          h.onLeft?.();
          break;
        case "right":
          h.onRight?.();
          break;
        case "up":
          h.onUp?.();
          break;
        case "down":
          h.onDown?.();
          break;
        case "longSelect":
          h.onLongSelect?.();
          break;
      }
    });

    return () => {
      tvEventHandler.disable();
    };
  }, []);
}
