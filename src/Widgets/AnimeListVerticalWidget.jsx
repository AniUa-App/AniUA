import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { TouchableOpacity } from "./Button";
import React from "react";
import Icon from "../Styles/Icons";
import { appColor, black, white } from "../Styles/Colors";
import { H3 } from "../Styles/Fonts";
import { GetScreenHeight, GetScreenWidth } from "../Global/Functions";
import { Image } from "./LoadersWidgets";
import { useNavigation } from "@react-navigation/native";

export default function AnimeListVertical({
  title,
  animeList,
  onClickMore,
  navigation,
}) {
  const { width, height } = useWindowDimensions();
  const itemWidth = Math.max(120, width * 0.4);
  const itemHeight = Math.max(120, height * 0.3);
  const marginH = Math.max(8, width * 0.03);
  if (!navigation) {
    navigation = useNavigation();
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.9}
        onPress={onClickMore}
      >
        <Text style={[styles.title, H3]}>{title}</Text>
        <View style={styles.arrowRightIcon}>
          {onClickMore && <Icon.ArrowRight size={34} color={appColor} />}
        </View>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {animeList.map((anime, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              navigation.navigate("HiddenStack", {
                screen: "AnimePreview",
                params: { anime },
              })
            }
          >
            <Image
              uri={anime.image}
              style={[
                styles.image,
                {
                  width: itemWidth,
                  height: itemHeight,
                  marginHorizontal: marginH,
                  marginVertical: "5%",
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row", // Размещаем элементы по горизонтали
    flexWrap: "wrap", // Разрешаем перенос элементов на следующую строку
    justifyContent: "center", // Центрирование по горизонтали
  },
  arrowRightIcon: {
    paddingRight: "5%",
    paddingBottom: "5%",
    paddingTop: "5%",
  },
  header: {
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: black,
    width: "100%",
  },
  title: {
    paddingLeft: "5%",
    paddingTop: "5%",
  },
});
