import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SettingsStorage from "../Storage/SettingsStorage";
import { defaultColors } from "../Styles/Colors";
import { EventBus } from "./EventBus";
import Color from "color";

export const ThemeContext = createContext({
  colors: defaultColors,
  isCustomisation: false,
});

export function ThemeProvider({ children }) {
  // Ensure colors are solid (no alpha) to avoid unintended dim overlays when combined with backgrounds/blur.
  const solidizeColor = (value) => {
    try {
      const c = Color(value);
      // If provided value has alpha < 1, drop alpha to keep UI from looking dimmed.
      if (typeof c.alpha === "function" && c.alpha() < 1) {
        return c.alpha(1).rgb().string();
      }
      return c.rgb().string();
    } catch {
      // If not a valid color string, return as-is so defaults can cover.
      return value;
    }
  };

  const getColorsFromConfig = useCallback(() => {
    const userConfig = SettingsStorage.getParameter("userConfig") || {};
    const isCustomisation = Boolean(userConfig?.colors?.isCustomisation);
    const rawUserColors = userConfig?.colors || {};
    // Sanitize only color-like string values; leave functions (e.g. Black()) and non-strings untouched
    const userColors = Object.fromEntries(
      Object.entries(rawUserColors).map(([k, v]) => [
        k,
        typeof v === "string" ? solidizeColor(v) : v,
      ])
    );
    const merged = { ...defaultColors, ...userColors };
    return {
      colors: isCustomisation ? merged : defaultColors,
      isCustomisation,
    };
  }, []);

  const [state, setState] = useState(getColorsFromConfig);

  useEffect(() => {
    const unsubscribe = EventBus.on("userConfig", () => {
      setState(getColorsFromConfig());
    });
    return unsubscribe;
  }, [getColorsFromConfig]);

  const value = useMemo(() => state, [state]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
