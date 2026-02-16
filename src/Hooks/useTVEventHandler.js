import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import { isTV } from "../Styles/Responsive";

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

  const handleEvent = useCallback((evt) => {
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
  }, []);

  useEffect(() => {
    if (!Platform.isTV && !isTV()) return;

    // New API: TVEventHandler.addListener (static method)
    let TVEventHandler;
    try {
      TVEventHandler =
        require("react-native/Libraries/Components/TV/TVEventHandler").default;
    } catch {
      // Fallback: try legacy class-based API
      try {
        const { TVEventHandler: LegacyHandler } = require("react-native");
        if (LegacyHandler) {
          const handler = new LegacyHandler();
          handler.enable(null, (cmp, evt) => handleEvent(evt));
          return () => handler.disable();
        }
      } catch {
        // No TV event handling available
      }
      return;
    }

    if (!TVEventHandler?.addListener) return;

    const subscription = TVEventHandler.addListener(handleEvent);
    return () => subscription.remove();
  }, [handleEvent]);
}
