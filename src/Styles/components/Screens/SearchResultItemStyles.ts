import { useLayout } from "../../Layout";
import { useThemeColors } from "../../../Global/useTheme";

type SearchResultItemStyles = {
  /** Розмір іконки (Telegram тощо) */
  iconSize: number;
  /** Колір іконки команди */
  teamIconColor: string;
};

export const useSearchResultItemStyles = (): SearchResultItemStyles => {
  const layout = useLayout();
  const themeColors = useThemeColors();

  return {
    iconSize: layout.icon.xmd,
    teamIconColor: themeColors.text,
  };
};
