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
      marginTop: layout.s(4),
    },
    avatarOuter: {
      width: layout.s(90),
      height: layout.s(90),
      borderRadius: layout.s(45),
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
  };
};
