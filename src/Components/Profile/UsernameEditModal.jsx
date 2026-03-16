import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H4 } from "../../Styles/Fonts";
import { useUsernameEditModalStyles } from "../../Styles/components/Profile/UsernameEditModalStyles";

export default function UsernameEditModal({
  visible,
  onClose,
  username,
  onChangeUsername,
  onSubmit,
  isUpdating,
  colors,
}) {
  const s = useUsernameEditModalStyles();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable
          style={[s.modalContent, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            selectable={true}
            style={[H4, s.modalTitle, { color: colors.text }]}
          >
            Змінити ім'я користувача
          </Text>

          <View
            style={[
              s.modalInputContainer,
              { backgroundColor: colors.accent },
            ]}
          >
            <TextInput
              style={[H4, s.modalInput, { color: colors.text }]}
              value={username}
              onChangeText={onChangeUsername}
              placeholder="Нове ім'я користувача"
              placeholderTextColor={colors.inActiveText}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isUpdating}
              autoFocus={true}
            />
          </View>

          <View style={s.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[s.modalButton, { backgroundColor: colors.accent }]}
              disabled={isUpdating}
            >
              <Text selectable={true} style={[H4, { color: colors.text }]}>
                Скасувати
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubmit}
              style={[s.modalButton, { backgroundColor: colors.primary }]}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text selectable={true} style={[H4, { color: "#fff" }]}>
                  Зберегти
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

