import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import Icon from "../Styles/Icons";
import { useThemeColors } from "../Global/useTheme";
import { H3 } from "../Styles/Fonts";
import { Image } from "./LoadersWidgets";
import { NavigationContext } from "@react-navigation/native";
import { isTablet, isTabletLandscape } from "../Styles/Responsive";
import { useContext } from "react";

export function AnimeListHorizontal({
  animeList,
  title = "",
  onClickMore = null,
  navigation: navProp,
  onAnimePress = () => {},
}) {
  // Використовуємо переданий navigation або з контексту
  const navContext = useContext(NavigationContext);
  const navigation = navProp || navContext;

  const themeColors = useThemeColors();
  const { width, height } = useWindowDimensions();
  const baseWidth = Math.max(120, width * 0.4);
  const baseHeight = Math.max(120, height * 0.26);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={1}
        onPress={onClickMore}
      >
        {title?.length > 0 && (
          <Text style={[styles.title, H3, { color: themeColors.text }]}>
            {title || ""}
          </Text>
        )}
        {!!onClickMore && (
          <View style={styles.arrowRightIcon}>
            <Icon.ArrowRight size={34} color={themeColors.primary} />
          </View>
        )}
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {animeList.map((anime, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            style={[
              styles.imageContainer,
              isTabletLandscape()
                ? { width: width * 0.12, height: height * 0.3 }
                : isTablet()
                  ? { width: width * 0.2, height: height * 0.2 }
                  : { width: baseWidth, height: baseHeight },
            ]}
            onPress={() => {
              navigation.navigate("HiddenStack", {
                screen: "AnimePreview",
                params: { anime },
              });
              onAnimePress(anime);
            }}
          >
            <Image
              uri={anime.image}
              style={[
                { flex: 1, width: "100%", height: "100%", borderRadius: 18 },
              ]}
            />
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
  const { width, height } = useWindowDimensions();
  const baseWidth = Math.max(120, width * 0.4);
  const baseHeight = Math.max(120, height * 0.3);

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <Text style={[styles.title, H3, { color: themeColors.text }]}>
          {title}
        </Text>
        <View style={styles.arrowRightIcon}>
          {animeList.length >= 10 && (
            <Icon.ArrowRight size={34} color={themeColors.primary} />
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
            style={[
              styles.imageContainer,
              isTabletLandscape()
                ? { width: width * 0.12, height: height * 0.3 }
                : isTablet()
                  ? { width: width * 0.2, height: height * 0.2 }
                  : { width: baseWidth, height: baseHeight },
            ]}
            onPress={() => {
              onPress(anime);
            }}
          >
            <Image
              uri={anime.image}
              style={[
                { flex: 1, width: "100%", height: "100%", borderRadius: 8 },
              ]}
            />
            {/* <Text style={[H3, { color: themeColors.text }]} numberOfLines={2}>
              {anime.title_ua}
            </Text> */}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  arrowRightIcon: {
    paddingRight: "5%",
    paddingVertical: isTabletLandscape() ? 8 : 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    width: "100%",
  },
  title: {
    paddingLeft: 25,
    paddingVertical: isTabletLandscape() ? 8 : 16,
  },
});
