import { useLayout } from "../../Layout";
import type { ViewStyle } from "react-native";

type ErrorScreenStyles = {
  /** Головний flex-контейнер */
  container: ViewStyle;
};

export const useErrorScreenStyles = (): ErrorScreenStyles => {
  const layout = useLayout();

  return {
    container: { flex: 1, justifyContent: "center" },
  };
};
