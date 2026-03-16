import { useLayout } from "../Layout";
import type { ViewStyle } from "react-native";

type TeamReleasesBottomSheetStyles = {
  /** Зовнішній контейнер нижнього листа */
  container: ViewStyle;
  /** Заголовок з назвою команди */
  header: ViewStyle;
  /** Контейнер індикатора завантаження */
  loadingContainer: ViewStyle;
};

export const useTeamReleasesBottomSheetStyles =
  (): TeamReleasesBottomSheetStyles => {
    const layout = useLayout();

    return {
      container: {
        flex: 1,
      },
      header: {
        paddingHorizontal: layout.s(20),
        paddingVertical: layout.s(12),
        alignItems: "center",
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
    };
  };
