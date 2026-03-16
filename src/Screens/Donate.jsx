import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { H2, H7 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import { useDonateStyles } from "../Styles/components/Screens/DonateStyles";

export default function DonateScreen() {
  const colors = useThemeColors();
  const s = useDonateStyles();
  const [amount, setAmount] = React.useState("40");

  return (
    <DefaultScreenWidget>
      <View style={s.container}>
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
        <View style={s.inputContainer}>
          <TextInput
            style={[H2, s.amountInput]}
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
              s.currency,
              {
                color: colors.primary,
              },
            ]}
          >
            ₴
          </Text>
        </View>

        <TouchableOpacity
          style={[s.primaryButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => {
            /* TODO: handle donate */
          }}
        >
          <Text selectable={true} style={[H2, s.primaryButtonText]}>
            Пожертвувати
          </Text>
        </TouchableOpacity>

        <Text selectable={true} style={[H7, s.caption]}>
          Мінімальна сума донату: 30₴
        </Text>
      </View>
    </DefaultScreenWidget>
  );
}
