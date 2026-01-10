import { View, StyleSheet } from "react-native";
import { Image } from "../../Widgets/LoadersWidgets";
import Icons from "../../Styles/Icons";

export default function ProfileAvatar({ avatarUrl, colors }) {
  const hasCustomAvatar = avatarUrl && !avatarUrl.includes("/avatar/");

  return (
    <View style={styles.avatarContainer}>
      {!hasCustomAvatar ? (
        <Image
          uri={avatarUrl}
          style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}>
          <Icons.User size={72} color={colors.Text(0.5)} weight="regular" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  avatarOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
