import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  StatusBar,
  Share,
} from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { TouchableOpacity } from "../Widgets/Button";
import { H3, H4, useScaleFontSize } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { useThemeColors } from "../Global/useTheme";
import { isTablet, isTabletLandscape, useIsTV } from "../Styles/Responsive";
import { TV } from "../Styles/TVStyles";
import Icons from "../Styles/Icons";
import { HikkaApiComplete } from "../Sources/HikkaApiComplete";
import { AnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import Logger from "../Logger/Logger";
import { Shadow } from "react-native-shadow-2";
import Markdown from "react-native-markdown-display";
import MainConfig from "../cfgs/MainConfig";
import BloomImage from "../Widgets/BloomImage";

export default function CharacterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scaleFontSize = useScaleFontSize();
  const isTV = useIsTV();

  // Підтримка як об'єкта character, так і slug для deep linking
  const characterFromParams = route.params?.character;
  const slugFromParams = route.params?.slug;

  const [character, setCharacter] = useState(characterFromParams || null);
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(
    !characterFromParams && !!slugFromParams,
  );

  const name =
    character?.name_ua ||
    character?.name_en ||
    character?.name_ja ||
    character?.name ||
    "";
  const image = character?.image;
  const description = (
    character?.description_ua ||
    character?.description ||
    ""
  ).replaceAll("hikka.io", "aniua.yuzka.site");

  const imageSize = useMemo(() => {
    if (isTV) {
      return { width: width * 0.2, height: height * 0.7 };
    }
    if (isTabletLandscape()) {
      return { width: width * 0.25, height: height * 0.45 };
    }
    if (isTablet()) {
      return { width: width * 0.4, height: height * 0.35 };
    }
    return { width: width * 0.6, height: height * 0.4 };
  }, [width, height, isTV]);

  const headerPaddingTop = useMemo(
    () => Math.max(insets.top, StatusBar.currentHeight || 0) + 10,
    [insets.top],
  );

  // Завантаження деталей персонажа по slug (для deep linking)
  useEffect(() => {
    if (characterFromParams) {
      setCharacter(characterFromParams);
      setIsLoadingCharacter(false);
      return;
    }

    if (!slugFromParams) {
      setIsLoadingCharacter(false);
      return;
    }

    const loadCharacterDetails = async () => {
      try {
        setIsLoadingCharacter(true);
        const details =
          await HikkaApiComplete.getCharacterDetails(slugFromParams);
        if (details) {
          setCharacter(details);
          Logger.debug("CharacterScreen", "Завантажено деталі персонажа", {
            slug: slugFromParams,
            name: details.name_ua || details.name_en,
          });
        }
      } catch (error) {
        Logger.error(
          "CharacterScreen",
          "Помилка завантаження деталей персонажа",
          error,
        );
      } finally {
        setIsLoadingCharacter(false);
      }
    };

    loadCharacterDetails();
  }, [slugFromParams, characterFromParams]);

  // Завантаження аніме персонажа
  useEffect(() => {
    if (!character?.slug) {
      setIsLoading(false);
      return;
    }

    const loadCharacterAnime = async () => {
      try {
        // getCharacterAnime повертає масив напряму
        const animeItems =
          (await HikkaApiComplete.getCharacterAnime(character.slug)) || [];

        // Завантажуємо деталі для кожного аніме
        const detailedAnime = await Promise.all(
          animeItems.map(async (item) => {
            try {
              const anime = item.anime || item;
              if (!anime?.slug) return null;
              const details = await HikkaApiComplete.getAnimeDetails(
                anime.slug,
              );
              return details || anime;
            } catch (error) {
              Logger.warn(
                "CharacterScreen",
                `Не вдалося завантажити аніме`,
                error,
              );
              return item.anime || item;
            }
          }),
        );

        const validAnime = detailedAnime.filter((anime) => anime !== null);
        setAnimeList(validAnime);

        Logger.debug("CharacterScreen", "Завантажено аніме персонажа", {
          character: name,
          count: validAnime.length,
        });
      } catch (error) {
        Logger.error(
          "CharacterScreen",
          "Помилка завантаження аніме персонажа",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacterAnime();
  }, [character?.slug]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else {
      navigation.navigate("MainTabs", {
        screen: "Home",
      });
    }
  }, [navigation]);
  if (isLoadingCharacter) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      </View>
    );
  }

  if (!character) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.emptyContainer}>
          <Text
            selectable={true}
            style={[H4, { color: themeColors.inActiveText }]}
          >
            Персонаж не знайдено
          </Text>
        </View>
      </View>
    );
  }

  const iconSize = isTV ? 48 : 32;
  const btnPadding = isTV ? 12 : 6;

  const headerContent = (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerPaddingTop,
          backgroundColor: themeColors.background,
        },
        isTV && { paddingHorizontal: TV.padding.screen },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: themeColors.subtle, padding: btnPadding },
        ]}
        onPress={handleGoBack}
      >
        <Icons.ArrowCircleLeft size={iconSize} color={themeColors.primary} />
      </TouchableOpacity>

      <View style={styles.headerSpacer} />

      <TouchableOpacity
        style={[
          styles.menuButton,
          { backgroundColor: themeColors.subtle, padding: btnPadding },
        ]}
        onPress={() => {
          Share.share({
            title: character.name_ua,
            message: `${character.name_ua}: ${MainConfig.urls.appUrl}/characters/${character.slug}`,
            url: `${MainConfig.urls.appUrl}/characters/${character.slug}`,
          });
        }}
      >
        <Icons.ShareNetwork size={iconSize} color={themeColors.primary} />
      </TouchableOpacity>
    </View>
  );

  const imageContent = image ? (
    <BloomImage
      uri={image}
      width={imageSize.width}
      height={imageSize.height}
      borderRadius={16}
      blurRadius={8}
      glowScale={1}
      fadePercent={0.15}
    />
  ) : null;

  const namePillContent = (
    <View
      style={[
        styles.namePill,
        { backgroundColor: themeColors.primary },
        isTV && { paddingVertical: 14, marginTop: TV.padding.section },
      ]}
    >
      <Text
        selectable={true}
        style={[
          styles.nameText,
          { fontSize: scaleFontSize(18), color: themeColors.text },
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );

  const descriptionContent = description ? (
    <Markdown
      style={{
        body: {
          ...H4,
          ...styles.description,
          color: themeColors.text,
          ...(isTV && { lineHeight: 32, marginHorizontal: TV.padding.screen }),
        },
        link: {
          ...H4,
          color: themeColors.primary,
          textDecorationLine: "underline",
        },
      }}
    >
      {description}
    </Markdown>
  ) : null;

  const animeContent = isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  ) : animeList.length > 0 ? (
    <View style={{ width: "100%" }}>
      <View
        style={[
          styles.sectionHeader,
          isTV && { paddingHorizontal: TV.padding.screen },
        ]}
      >
        <Text selectable={true} style={[H3, { color: themeColors.text }]}>
          Аніме
        </Text>
      </View>
      <AnimeListHorizontal
        animeList={animeList}
        title=""
        onClickMore={null}
        navigation={navigation}
      />
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Text selectable={true} style={[H4, { color: themeColors.inActiveText }]}>
        Немає пов'язаного аніме
      </Text>
    </View>
  );

  if (isTV) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        {headerContent}
        <View style={styles.tvLayout}>
          {/* Left panel — image + name */}
          <ScrollView
            style={styles.tvLeftPanel}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {imageContent}
            {namePillContent}
          </ScrollView>

          {/* Right panel — description + anime */}
          <ScrollView
            style={styles.tvRightPanel}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {descriptionContent}
            {animeContent}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {headerContent}
        {imageContent}
        {namePillContent}
        {descriptionContent}
        {animeContent}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: {
    borderRadius: 16,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    flex: 1,
  },
  menuButton: {
    borderRadius: 16,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 16,
  },
  characterImage: {
    borderRadius: 16,
  },
  namePill: {
    paddingHorizontal: "10%",
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 20,
    zIndex: 1,
    minWidth: 120,
    alignItems: "center",
  },
  nameText: {
    fontFamily: "Nunito-SemiBold",
    textAlign: "center",
  },
  description: {
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: "left",
    lineHeight: 24,
  },
  sectionHeader: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  // TV layout
  tvLayout: {
    flex: 1,
    flexDirection: "row",
  },
  tvLeftPanel: {
    width: "35%",
    paddingHorizontal: TV.padding.screen,
  },
  tvRightPanel: {
    flex: 1,
    paddingRight: TV.padding.screen,
  },
});
