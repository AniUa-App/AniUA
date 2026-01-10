import { View, Text } from "react-native";
import React, { useState } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useNavigation } from "@react-navigation/native";
import { H4 } from "../Styles/Fonts";
import { useThemeColors } from "../Global/useTheme";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";
import SettingsStorage from "../Storage/SettingsStorage";
import Logger from "../Logger/Logger";
import { useSnackbar } from "../Components/Snackbar";

export default function ButtonsScreen({ route }) {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const { snackbar, showSnackbar } = useSnackbar();
  const { list, title, buttonStyle, isGoBack, Sbutton, value, playerSelection } = route.params;

  // Знаходимо початкове значення - порівнюємо з value (повне ім'я) для playerSelection
  const getInitialValue = () => {
    if (playerSelection && value) {
      const item = list.find((item) => item.value === value);
      return item?.title || list[0]?.title || "";
    }
    return value || list[0]?.title || "";
  };
  const [_value, setValue] = useState(getInitialValue);

  const handleItemSelect = (item) => {
    // Обробка вибору плеєра
    if (playerSelection) {
      const selectedValue = item.value || item.title;
      SettingsStorage.setParameter("defaultPlayer", selectedValue);
      showSnackbar(`Плеєр ${selectedValue} за замовчуванням успішно вибрано.`);
    } else if (item.onPress) {
      // Для зворотної сумісності з старим API
      item.onPress();
    }

    if (isGoBack) {
      setTimeout(() => navigation.goBack(), 300);
    }
  };

  return (
    <DefaultScreenWidget>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          padding: 20,
          gap: 10,
        }}
      >
        {!Sbutton ? (
          list.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                {
                  minWidth: "20%",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 10,
                  minHeight: 50,
                },
                buttonStyle,
              ]}
              onPress={() => handleItemSelect(item)}
            >
              <Text style={H4}>{item.title}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ width: "100%" }}>
            <SegmentedControlLabelWidget
              segments={list.map((item) => ({
                label: item.title,
              }))}
              value={_value}
              onChange={(_item) => {
                Logger.debug("ButtonsScreen", "Item changed", { item: _item });
                setValue(_item);
                const selectedItem = list.find((item) => item.title === _item);
                if (selectedItem) {
                  handleItemSelect(selectedItem);
                }
              }}
            />
          </View>
        )}
      </View>
      {snackbar}
    </DefaultScreenWidget>
  );
}
