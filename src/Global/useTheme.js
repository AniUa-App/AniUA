import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export function useThemeColors() {
  const { colors } = useContext(ThemeContext);
  // const t = Object.values(colors);
  // for (let i = 0; i < t.length; i++) {
  //   if (typeof t[i] === "function") {
  //     console.log(t[i](), t[i].name);
  //   }
  // }
  return colors;
}
