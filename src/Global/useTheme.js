import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export function useThemeColors() {
  const { colors } = useContext(ThemeContext);
  return colors;
}
