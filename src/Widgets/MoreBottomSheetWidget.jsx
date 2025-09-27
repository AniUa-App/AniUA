import { View, Text, Share, Linking } from "react-native";
import React from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "./Button";
import { Black, White } from "../Styles/Colors";
import { H2, H3 } from "../Styles/Fonts";
import MainConfig from "../cfgs/MainConfig";
import { useNavigation } from "@react-navigation/native";

export default function MoreBottomSheet({ sheetRef, anime }) {
  const navigation = useNavigation();

  const elements = [
    {
      title: "Поділитись",
      onPress: () => {
        Share.share({
          title: anime.title_ua,
          message: `Подивись ${anime.title_ua}\nзa посиланням: ${MainConfig.urls.appUrl}/anime/${anime.slug}`,
          url: `${MainConfig.urls.appUrl}/anime/${anime.slug}`,
        });
        sheetRef.current?.close();
      },
    },
    {
      title: "На головну",
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "Home",
        });
        sheetRef.current?.close();
      },
    },
    {
      title: "Поскаржитися",
      onPress: () => {
        Linking.openURL(`${MainConfig.urls.telegramChannelUrl}`);
        sheetRef.current?.close();
      },
    },

    {
      title: "Відкрити налаштування",
      onPress: () => {
        navigation.navigate("MainTabs", {
          screen: "Settings",
        });
        sheetRef.current?.close();
      },
    },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["28%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: Black(0.8) }}
      handleIndicatorStyle={{ backgroundColor: Black(1) }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          {...props}
        />
      )}
    >
      <BottomSheetView>
        {elements.map((element, index) => (
          <TouchableOpacity
            activeOpacity={0.6}
            key={index}
            style={{
              alignItems: "center",
              width: "100%",
              paddingTop: index === 0 ? "1%" : "3%",
              paddingBottom: index === elements.length - 1 ? "1%" : "3%",
            }}
            onPress={element.onPress}
          >
            <Text style={[H3, { color: White(0.91) }]}>{element.title}</Text>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
