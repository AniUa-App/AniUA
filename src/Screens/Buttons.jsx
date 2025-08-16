import { View, Text } from "react-native";
import React, { useEffect, useCallback } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { TouchableOpacity } from "../Widgets/Button";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { H3, H4, H5 } from "../Styles/Fonts";
import { appColor } from "../Styles/Colors";
import { SegmentedControlLabelWidget } from "../Widgets/Buttons";

export default function ButtonsScreen({ route }) {
  const navigation = useNavigation();
  const { list, title, buttonStyle, isGoBack, Sbutton } = route.params;
  useEffect(() => {
    console.log(list);
  }, [list]);
  useFocusEffect(
    useCallback(() => {
      console.log(list);
    }, [list])
  );
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
          <>
            {list.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  {
                    minWidth: "20%",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: appColor,
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 50,
                  },
                  buttonStyle,
                ]}
                onPress={() => {
                  item.onPress();
                  if (isGoBack) {
                    navigation.goBack();
                  }
                }}
              >
                <Text style={H4}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <SegmentedControlLabelWidget
            segments={list.map((item) => ({
              label: item.title,
            }))}
            onChange={(index) => {
              list.find((item) => item.title === index).onPress();
            }}
          />
        )}
      </View>
    </DefaultScreenWidget>
  );
}
