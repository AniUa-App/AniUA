import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type AnimeWatchScreenStyles = {
  /** Головний flex-контейнер з центруванням */
  container: ViewStyle;
};

export const useAnimeWatchScreenStyles = (): AnimeWatchScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: layout.s(32) },
  };
};
