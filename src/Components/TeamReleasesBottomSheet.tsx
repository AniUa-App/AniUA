import React, { RefObject } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity } from "../Widgets/Button";
import { useThemeColors } from "../Global/useTheme";
import { H3, H5 } from "../Styles/Fonts";
import { AnimeListHorizontal } from "../Widgets/AnimeListHorizontalWidget";
import { Team } from "../Api/AniuaApi";

interface Anime {
  slug: string;
  title_ua?: string;
  title_en?: string;
  image?: string;
  [key: string]: unknown;
}

interface TeamReleasesBottomSheetProps {
  sheetRef: RefObject<BottomSheetModal>;
  selectedTeam: Team | null;
  teamReleases: Anime[];
  isLoading: boolean;
  navigation: any;
}

export default function TeamReleasesBottomSheet({
  sheetRef,
  selectedTeam,
  teamReleases,
  isLoading,
  navigation,
}: TeamReleasesBottomSheetProps) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["43%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.inActiveIcon }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          style={[
            {
              ...props.style
              ,
            },
          ]}
        />
      )}
    >
      <BottomSheetView
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        {/* Заголовок з назвою команди */}
        <View style={styles.header}>
          <Text style={[H3, { color: themeColors.text }]}>
            {selectedTeam?.name}
          </Text>
          <Text style={[H5, { color: themeColors.inActiveText, marginTop: 4 }]}>
            {selectedTeam?.releases?.length || 0} релізів
          </Text>
        </View>

        {/* Контент */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : teamReleases.length > 0 ? (
          <AnimeListHorizontal
            animeList={teamReleases}
            title=""
            onClickMore={null}
            navigation={navigation}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={[H5, { color: themeColors.inActiveText }]}>
              Релізи не знайдено
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
