import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H4 } from "../../Styles/Fonts";

export default function UsernameEditModal({
  visible,
  onClose,
  username,
  onChangeUsername,
  onSubmit,
  isUpdating,
  colors,
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            selectable={true}
            style={[H4, styles.modalTitle, { color: colors.text }]}
          >
            Змінити ім'я користувача
          </Text>

          <View
            style={[
              styles.modalInputContainer,
              { backgroundColor: colors.accent },
            ]}
          >
            <TextInput
              style={[H4, styles.modalInput, { color: colors.text }]}
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

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
              disabled={isUpdating}
            >
              <Text selectable={true} style={[H4, { color: colors.text }]}>
                Скасувати
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSubmit}
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  modalInputContainer: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  modalInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
