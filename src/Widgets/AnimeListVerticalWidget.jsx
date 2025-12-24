import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { TouchableOpacity } from "./Button";
import React, { useMemo } from "react";
import Icon from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import { Image } from "./LoadersWidgets";
import { useNavigation } from "@react-navigation/native";
import { Background, background } from "../Styles/Colors";
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
          {onClickMore && <Icon.ArrowRight size={34} color={primary} />}
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
    flexDirection: "row", // Розміщуємо елементи по горизонталі
    flexWrap: "wrap", // Дозволяємо перенесення елементів на наступний рядок
    justifyContent: "center", // Центрування по горизонталі
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
    backgroundColor: background,
    width: "100%",
  },
  title: {
    paddingLeft: "5%",
    paddingTop: "5%",
  },
});
