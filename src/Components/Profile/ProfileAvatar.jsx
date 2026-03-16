import { View } from "react-native";
import { Image } from "../../Widgets/LoadersWidgets";
import Icons from "../../Styles/Icons";
import { useProfileAvatarStyles } from "../../Styles/components/Profile/ProfileAvatarStyles";

export default function ProfileAvatar({ avatarUrl, colors }) {
  const hasCustomAvatar = avatarUrl && !avatarUrl.includes("/avatar/");
  const s = useProfileAvatarStyles();

  return (
    <View style={s.avatarContainer}>
      {!hasCustomAvatar ? (
        <Image
          uri={avatarUrl}
          style={[s.avatarOuter, { backgroundColor: colors.subtle }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[s.avatarOuter, { backgroundColor: colors.subtle }]}>
          <Icons.User size={72} color={colors.Text(0.5)} weight="regular" />
        </View>
      )}
    </View>
  );
}

