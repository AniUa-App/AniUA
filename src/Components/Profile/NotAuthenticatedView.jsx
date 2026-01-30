import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";

export default function NotAuthenticatedView({
  colors,
  scaleFontSize,
  onLogin,
}) {
  return (
    <View style={styles.notAuthContainer}>
      <View style={[styles.avatarOuter, { backgroundColor: colors.subtle }]}>
        <Icons.User size={72} color={colors.Text(0.3)} weight="regular" />
      </View>

      <Text
        selectable={true}
        style={[
          styles.notAuthTitle,
          { color: colors.text, fontSize: scaleFontSize(18) },
        ]}
      >
        Увійдіть в акаунт
      </Text>

      <Text
        selectable={true}
        style={[
          styles.notAuthSubtitle,
          { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
        ]}
      >
        Авторизуйтесь через Hikka, щоб синхронізувати свій список аніме
      </Text>

      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: colors.primary }]}
        onPress={onLogin}
      >
        <Icons.SignIn size={20} color={colors.background} weight="bold" />
        <Text
          selectable={true}
          style={[
            styles.loginButtonText,
            { color: colors.background, fontSize: scaleFontSize(15) },
          ]}
        >
          Увійти через Hikka
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  notAuthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  avatarOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  notAuthTitle: {
    fontFamily: "Nunito-Bold",
    marginTop: 20,
    textAlign: "center",
  },
  notAuthSubtitle: {
    fontFamily: "Nunito-Regular",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  loginButtonText: {
    fontFamily: "Nunito-Bold",
  },
});
