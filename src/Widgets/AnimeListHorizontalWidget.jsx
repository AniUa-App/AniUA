import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import Icon from "../Styles/Icons";
import { appColor, black, white } from "../Styles/Colors";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import { GetScreenHeight, GetScreenWidth } from "../Global/Functions";
import { Image } from "./LoadersWidgets";
import { useNavigation } from "@react-navigation/native";
import { isTabletLandscape } from "../Styles/Responsive";

export function AnimeListHorizontal({ animeList, title, onClickMore = null }) {
  const navigation = useNavigation();
  const themeColors = useThemeColors();

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.9}
        onPress={onClickMore}
      >
        <Text style={[styles.title, H3, { color: themeColors.white }]}>
          {title}
        </Text>
        <View style={styles.arrowRightIcon}>
          {onClickMore && (
            <Icon.ArrowRight size={34} color={themeColors.appColor} />
          )}
        </View>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {animeList.map((anime, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageContainer,
              isTabletLandscape() && {
                width: GetScreenWidth() * 0.12,
                height: GetScreenHeight() * 0.3,
              },
            ]}
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "AnimePreview",
                params: { anime },
              });
            }}
          >
            <Image
              uri={anime.image}
              style={[
                { flex: 1, width: "100%", height: "100%", borderRadius: 8 },
              ]}
            />
            {/* <Text style={[H3, { color: themeColors.white }]} numberOfLines={2}>
              {anime.title_ua}
            </Text> */}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function PreviewAnimeListHorizontal({
  animeList,
  title,
  onPress = () => {},
}) {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={[styles.title, H3, { color: themeColors.white }]}>
          {title}
        </Text>
        <View style={styles.arrowRightIcon}>
          {animeList.length >= 10 && (
            <Icon.ArrowRight size={34} color={themeColors.appColor} />
          )}
        </View>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
      >
        {animeList.map((anime, index) => (
          <TouchableOpacity
            key={index}
            style={[{ marginHorizontal: 8 }, styles.imageContainer]}
            onPress={onPress}
          >
            <Image uri={anime.image} style={styles.image} />
            <Text style={[H3, { color: themeColors.white }]} numberOfLines={2}>
              {anime.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: GetScreenWidth() * 0.4,
    height: GetScreenHeight() * 0.3,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  arrowRightIcon: {
    paddingRight: "5%",
    paddingVertical: isTabletLandscape() ? "2%" : "4%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    width: "100%",
  },
  title: {
    paddingLeft: 25,
    paddingVertical: isTabletLandscape() ? "2%" : "4%",
  },
});
