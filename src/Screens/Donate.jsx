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
import { black_1, white, gray, appColor } from "../Styles/Colors";

export default function DonateScreen() {
  const [amount, setAmount] = React.useState("40");

  return (
    <DefaultScreenWidget>
      <View style={styles.container}>
        <Text
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
            placeholderTextColor={gray}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={[H2, styles.currency]}>₴</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => {
            /* TODO: handle donate */
          }}
        >
          <Text style={[H2, styles.primaryButtonText]}>Пожертвувати</Text>
        </TouchableOpacity>

        <Text style={[H7, styles.caption]}>Мінімальна сума донату: 30₴</Text>
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
    backgroundColor: black_1,
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
    color: white,
    fontSize: 40,
    lineHeight: 40,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  currency: {
    fontSize: 55,
    lineHeight: 55,
    color: appColor,
  },
  primaryButton: {
    width: "70%",
    backgroundColor: appColor,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  primaryButtonText: {
    color: white,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
  },
  caption: {
    alignSelf: "center",
    marginTop: 16,
    color: gray,
    lineHeight: 18,
  },
});
