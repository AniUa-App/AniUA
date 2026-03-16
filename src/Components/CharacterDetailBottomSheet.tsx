import React, { RefObject } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "../Widgets/Button";
import { useThemeColors } from "../Global/useTheme";
import { H3, H4, useScaleFontSize } from "../Styles/Fonts";
import { Image } from "../Widgets/LoadersWidgets";
import { AnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import LinearGradient from "react-native-linear-gradient";
import { isTablet, isTabletLandscape, isTV } from "../Styles/Responsive";
import { Shadow } from "react-native-shadow-2";
import MarkdownComponent from "./MarkdownComponent";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import BloomImage from "../Widgets/BloomImage";
import { useCharacterDetailBottomSheetStyles } from "../Styles/components/CharacterDetailBottomSheetStyles";

interface Character {
  slug?: string;
  name_ua?: string;
  name_en?: string;
  name_ja?: string;
  name?: string;
  image?: string;
  description_ua?: string;
  description?: string;
  [key: string]: unknown;
}

interface Anime {
  slug: string;
  title_ua?: string;
  title_en?: string;
  image?: string;
  [key: string]: unknown;
}

interface CharacterDetailBottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  character: Character | null;
  animeList: Anime[];
  isLoading: boolean;
  navigation: any;
}

export default function CharacterDetailBottomSheet({
  sheetRef,
  character,
  animeList,
  isLoading,
  navigation,
}: CharacterDetailBottomSheetProps) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scaleFontSize = useScaleFontSize();
  const s = useCharacterDetailBottomSheetStyles();

  const name =
    character?.name_ua ||
    character?.name_en ||
    character?.name_ja ||
    character?.name ||
    "";
  const image = character?.image;
  const description = character?.description_ua || character?.description || "";

  const imageSize = (() => {
    if (isTV()) {
      return { width: width * 0.2, height: height * 0.5 };
    }
    if (isTabletLandscape()) {
      return { width: width * 0.2, height: height * 0.4 };
    }
    if (isTablet()) {
      return { width: width * 0.35, height: height * 0.3 };
    }
    return { width: width * 0.45, height: height * 0.28 };
  })();

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["85%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.inActiveIcon }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          style={[props.style as object]}
        />
      )}
    >
      <BottomSheetScrollView
        style={s.container}
        contentContainerStyle={[
          s.contentContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Image with Gradient Shadow */}

        {image && (
          <View style={[s.imageContainer]}>
            <BloomImage
              uri={image}
              width={imageSize.width}
              height={imageSize.height}
              borderRadius={16}
              blurRadius={8}
              glowScale={1}
              fadePercent={0.15}
            />
          </View>
        )}

        {/* Character Name Pill */}
        <View
          style={[s.namePill, { backgroundColor: themeColors.primary }]}
        >
          <Text
            selectable={true}
            style={[
              s.nameText,
              { fontSize: scaleFontSize(18), color: themeColors.text },
            ]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>

        {/* Description */}
        {description ? (
          <View style={s.descriptionContainer}>
            <MarkdownComponent
              style={{
                body: {
                  ...H4,
                  lineHeight: 24,
                },
              }}
              navigation={navigation}
              onNavigate={() => sheetRef.current?.close()}
            >
              {description}
            </MarkdownComponent>
          </View>
        ) : null}

        {isLoading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : animeList.length > 0 ? (
          <>
            {/* Anime Section */}
            <View style={s.sectionHeader}>
              <Text selectable={true} style={[H3, { color: themeColors.text }]}>
                Аніме
              </Text>
            </View>
            <AnimeListHorizontal
              animeList={animeList}
              title=""
              onClickMore={null}
              navigation={navigation}
              onAnimePress={() => {
                sheetRef.current?.close();
              }}
            />
          </>
        ) : (
          <View style={s.emptyContainer}>
            <Text
              selectable={true}
              style={[H4, { color: themeColors.inActiveText }]}
            >
              Немає пов'язаного аніме
            </Text>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

