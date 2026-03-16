import { View, Text } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import Icons from "../../Styles/Icons";
import { useNotAuthenticatedViewStyles } from "../../Styles/components/Profile/NotAuthenticatedViewStyles";

export default function NotAuthenticatedView({
  colors,
  scaleFontSize,
  onLogin,
}) {
  const s = useNotAuthenticatedViewStyles();

  return (
    <View style={s.notAuthContainer}>
      <View style={[s.avatarOuter, { backgroundColor: colors.subtle }]}>
        <Icons.User size={72} color={colors.Text(0.3)} weight="regular" />
      </View>

      <Text
        selectable={true}
        style={[
          s.notAuthTitle,
          { color: colors.text, fontSize: scaleFontSize(18) },
        ]}
      >
        Увійдіть в акаунт
      </Text>

      <Text
        selectable={true}
        style={[
          s.notAuthSubtitle,
          { color: colors.Text(0.5), fontSize: scaleFontSize(14) },
        ]}
      >
        Авторизуйтесь через Hikka, щоб синхронізувати свій список аніме
      </Text>

      <TouchableOpacity
        style={[s.loginButton, { backgroundColor: colors.primary }]}
        onPress={onLogin}
      >
        <Icons.SignIn size={20} color={colors.background} weight="bold" />
        <Text
          selectable={true}
          style={[
            s.loginButtonText,
            { color: colors.background, fontSize: scaleFontSize(15) },
          ]}
        >
          Увійти через Hikka
        </Text>
      </TouchableOpacity>
    </View>
  );
}

