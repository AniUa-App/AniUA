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

export const ThemeContext = createContext({
  colors: defaultColors,
  isCustomisation: false,
});

export function ThemeProvider({ children }) {
  const getColorsFromConfig = useCallback(() => {
    const userConfig = SettingsStorage.getParameter("userConfig") || {};
    const isCustomisation = Boolean(userConfig?.colors?.isCustomisation);
    const userColors = userConfig?.colors || {};
    const merged = { ...defaultColors, ...userColors };
    return {
      colors: isCustomisation ? merged : defaultColors,
      isCustomisation,
    };
  }, []);

  const [state, setState] = useState(getColorsFromConfig);

  useEffect(() => {
    const unsubscribe = EventBus.on("userConfigChanged", () => {
      setState(getColorsFromConfig());
    });
    return unsubscribe;
  }, [getColorsFromConfig]);

  const value = useMemo(() => state, [state]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
