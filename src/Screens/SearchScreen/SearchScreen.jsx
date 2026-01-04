import { useCallback, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../Global/useTheme";
import SearchHeaderComponent from "../../Components/SearchHeaderComponent";
import SearchCategoryTabsComponent from "../../Components/SearchCategoryTabsComponent";
import SearchEmptyStateComponent from "../../Components/SearchEmptyStateComponent";
import SearchFilterBottomSheet from "../../Components/SearchFilterBottomSheet";
import TeamReleasesBottomSheet from "../../Components/TeamReleasesBottomSheet";
import CharacterDetailBottomSheet from "../../Components/CharacterDetailBottomSheet";

import { SEARCH_CATEGORIES } from "./constants";
import { useSearch, useTeamReleases, useCharacterDetails } from "./hooks";
import { SearchResultItem } from "./components";

export default function SearchScreen() {
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();

  const filterSheetRef = useRef(null);
  const teamReleasesSheetRef = useRef(null);
  const characterSheetRef = useRef(null);

  const {
    searchText,
    setSearchText,
    activeCategory,
    handleCategoryChange,
    results,
    hasSearched,
    isLoading,
    filters,
    setFilters,
    loadedGenres,
    handleSearch,
    resetFilters,
  } = useSearch();

  const { selectedTeam, teamReleases, isLoadingReleases, handleTeamPress } =
    useTeamReleases(teamReleasesSheetRef);

  const {
    selectedCharacter,
    characterAnimeList,
    isLoadingCharacter,
    handleCharacterPress,
  } = useCharacterDetails(characterSheetRef);

  const headerPaddingTop = useMemo(
    () => Math.max(insets.top, StatusBar.currentHeight || 0) + 10,
    [insets.top]
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderSearchResult = useCallback(
    ({ item }) => (
      <SearchResultItem
        item={item}
        activeCategory={activeCategory}
        onTeamPress={handleTeamPress}
        onCharacterPress={handleCharacterPress}
      />
    ),
    [activeCategory, handleTeamPress, handleCharacterPress]
  );

  const keyExtractor = useCallback(
    (item, index) => item.slug || item.reference || `${index}`,
    []
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <SearchHeaderComponent
        searchText={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        onGoBack={handleGoBack}
        onFilterPress={() => filterSheetRef.current?.present()}
        paddingTop={headerPaddingTop}
        placeholder="Пошук аніме..."
        autoFocus={true}
      />

      <SearchCategoryTabsComponent
        categories={SEARCH_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <View
          style={[
            styles.loadingContainer,
            { backgroundColor: themeColors.accent },
          ]}
        >
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderSearchResult}
          ListEmptyComponent={
            <SearchEmptyStateComponent
              hasSearched={hasSearched}
              isLoading={isLoading}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.resultsContainer,
            { backgroundColor: themeColors.accent },
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={8}
        />
      )}

      <SearchFilterBottomSheet
        sheetRef={filterSheetRef}
        filters={filters}
        loadedGenres={loadedGenres}
        onApply={(newFilters) => {
          setFilters(newFilters);
          filterSheetRef.current?.close();
        }}
        onReset={resetFilters}
      />

      <TeamReleasesBottomSheet
        sheetRef={teamReleasesSheetRef}
        selectedTeam={selectedTeam}
        teamReleases={teamReleases}
        isLoading={isLoadingReleases}
        navigation={navigation}
      />

      <CharacterDetailBottomSheet
        sheetRef={characterSheetRef}
        character={selectedCharacter}
        animeList={characterAnimeList}
        isLoading={isLoadingCharacter}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    flexGrow: 1,
  },
});
