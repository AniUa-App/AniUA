import { View, Text, Share, Linking, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "./Button";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import MainConfig from "../cfgs/MainConfig";
import { useNavigation } from "@react-navigation/native";
import Icon from "../Styles/Icons";

export default function MoreBottomSheet({ sheetRef, anime }) {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const elements = useMemo(
    () => [
      {
        title: "Поділитись",
        icon: (
          <Icon.ShareNetwork size={28} color={colors.text} weight="regular" />
        ),
        onPress: () => {
          Share.share({
            title: anime.title_ua,
            message: `Подивись ${anime.title_ua || anime.title_en || anime.title_ja}\nзa посиланням: ${MainConfig.urls.appUrl}/anime/${anime.slug}`,
            url: `${MainConfig.urls.appUrl}/anime/${anime.slug}`,
          });
          sheetRef.current?.close();
        },
      },
      {
        title: "На головну",
        icon: <Icon.House size={28} color={colors.text} weight="regular" />,
        onPress: () => {
          navigation.navigate("MainTabs", {
            screen: "Home",
          });
          sheetRef.current?.close();
        },
      },
      {
        title: "Поскаржитися",
        icon: <Icon.Info size={28} color={colors.text} weight="regular" />,
        onPress: () => {
          Linking.openURL(`${MainConfig.urls.telegramChannelUrl}`);
          sheetRef.current?.close();
        },
      },
      {
        title: "Налаштування",
        icon: <Icon.Gear size={28} color={colors.text} weight="regular" />,
        onPress: () => {
          navigation.navigate("HiddenStack", {
            screen: "SettingsScreen",
          });
          sheetRef.current?.close();
        },
      },
    ],
    [colors.text, anime, navigation, sheetRef]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: 20,
        },
        menuItem: {
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          paddingHorizontal: 16,
        },
        iconContainer: {
          width: 40,
          alignItems: "center",
          justifyContent: "center",
        },
        menuText: {
          color: colors.text,
          opacity: 0.91,
          marginLeft: 16,
        },
      }),
    [colors]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["35%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.inActiveIcon }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          {...props}
        />
      )}
    >
      <BottomSheetView
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        {elements.map((element, index) => (
          <TouchableOpacity
            activeOpacity={0.6}
            key={index}
            style={[
              styles.menuItem,
              {
                paddingTop: index === 0 ? 12 : 16,
                paddingBottom: index === elements.length - 1 ? 12 : 16,
              },
            ]}
            onPress={element.onPress}
          >
            <View style={styles.iconContainer}>{element.icon}</View>
            <Text selectable={true} style={[H3, styles.menuText]}>
              {element.title}
            </Text>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
