import { View, TextInput } from "react-native";
import { useState } from "react";
import { useTextInputComponentStyles } from "../Styles/components/TextInputComponentStyles";

export default function TextInputComponent({
  title = "",
  onChangeText = () => {},
  onSubmitEditing = () => {},
  placeholder = "Назва",
  returnKeyType = "search",
  autoFocus = false,
  style,
}) {
  const s = useTextInputComponentStyles();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={[style]}>
      <TextInput
        value={title}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        onSubmitEditing={onSubmitEditing}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={s.placeholderColor}
        returnKeyType={returnKeyType}
        autoFocus={autoFocus}
        style={s.input(isFocused)}
      />
    </View>
  );
}
