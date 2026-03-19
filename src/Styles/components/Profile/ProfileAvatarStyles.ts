import { useLayout } from "../../Layout";
import type { ViewStyle, ImageStyle } from "react-native";

type ProfileAvatarStyles = {
  /** Зовнішній контейнер аватара */
  avatarContainer: ViewStyle;
  /** Кругове зображення аватара */
  avatarOuter: ImageStyle;
};

export const useProfileAvatarStyles = (): ProfileAvatarStyles => {
  const layout = useLayout();

  return {
    avatarContainer: {
      alignItems: "center",
      marginTop: layout.spacing.xs,
    },
    avatarOuter: {
      width: layout.sizing.lg,
      height: layout.sizing.lg,
      borderRadius: layout.s(45),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
  };
};
