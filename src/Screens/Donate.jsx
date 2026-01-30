import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { H2, H7 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";

export default function DonateScreen() {
  const colors = useThemeColors();
  const [amount, setAmount] = React.useState("40");

  return (
    <DefaultScreenWidget>
      <View style={styles.container}>
        <Text
          selectable={true}
          style={[
            H2,
            {
              alignSelf: "center",
              maxWidth: "85%",
            },
          ]}
        >
          Введіть суму яку бажаєте пожертвувати
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[H2, styles.amountInput]}
            placeholder="30"
            placeholderTextColor={inActiveText}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text
            selectable={true}
            style={[
              H2,
              styles.currency,
              {
                color: colors.primary,
              },
            ]}
          >
            ₴
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => {
            /* TODO: handle donate */
          }}
        >
          <Text selectable={true} style={[H2, styles.primaryButtonText]}>
            Пожертвувати
          </Text>
        </TouchableOpacity>

        <Text selectable={true} style={[H7, styles.caption]}>
          Мінімальна сума донату: 30₴
        </Text>
      </View>
    </DefaultScreenWidget>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    width: "40%",
    height: "8%",
    borderRadius: 8,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    textAlign: "center",
    fontSize: 40,
    lineHeight: 40,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  currency: {
    fontSize: 55,
    lineHeight: 55,
  },
  primaryButton: {
    width: "70%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  primaryButtonText: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
  },
  caption: {
    alignSelf: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});
