import { useCallback, useRef } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  TVFocusGuideView as RNTVFocusGuideView,
} from "react-native";
import { useSearchScreenStyles } from "../../Styles/components/Screens/SearchScreenStyles";
import { useNavigation } from "@react-navigation/native";
import { useIsTV } from "../../Styles/Responsive";
import SearchHeaderComponent from "../../Components/SearchHeaderComponent";
import SearchCategoryTabsComponent from "../../Components/SearchCategoryTabsComponent";
import SearchEmptyStateComponent from "../../Components/SearchEmptyStateComponent";
import SearchFilterBottomSheet from "../../Components/SearchFilterBottomSheet";
import TeamReleasesBottomSheet from "../../Components/TeamReleasesBottomSheet";
import CharacterDetailBottomSheet from "../../Components/CharacterDetailBottomSheet";
import DefaultScreenWidget from "../../Widgets/DefaultScreenWidget";
import { SEARCH_CATEGORIES } from "./constants";
import { useSearch, useTeamReleases, useCharacterDetails } from "./hooks";
import { SearchResultItem } from "./components";
import Logger from "../../Logger/Logger";

const TVFocusGuideView = RNTVFocusGuideView || View;

export default function SearchScreen() {
  const navigation = useNavigation();
  const isTV = useIsTV();
  const s = useSearchScreenStyles();

  const flatListRef = useRef(null);
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
    isVerified,
    setIsVerified,
  } = useSearch();

  const { selectedTeam, teamReleases, isLoading_releases, handleTeamPress } =
    useTeamReleases(teamReleasesSheetRef);

  const {
    selectedCharacter,
    characterAnimeList,
    isLoadingCharacter,
    handleCharacterPress,
  } = useCharacterDetails(characterSheetRef);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleScrollToIndex = useCallback((index) => {
    if (flatListRef.current && index >= 0) {
      flatListRef.current.scrollToIndex({
        index: Math.max(0, index - 1),
        animated: true,
        viewPosition: 0,
      });
    }
  }, []);

  const renderSearchResult = useCallback(
    ({ item, index }) => (
      <SearchResultItem
        item={item}
        activeCategory={activeCategory}
        onTeamPress={handleTeamPress}
        onCharacterPress={handleCharacterPress}
        onFocus={isTV ? () => handleScrollToIndex(index) : undefined}
      />
    ),
    [
      activeCategory,
      handleTeamPress,
      handleCharacterPress,
      isTV,
      handleScrollToIndex,
    ],
  );

  const keyExtractor = useCallback(
    (item, index) => item.slug || item.reference || `${index}`,
    [],
  );

  return (
    <DefaultScreenWidget style={s.container} isNavBarPadding={false}>
      <SearchHeaderComponent
        searchText={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        onGoBack={handleGoBack}
        onFilterPress={() => filterSheetRef.current?.present()}
        paddingTop={s.headerPaddingTop}
        placeholder="Пошук аніме..."
        autoFocus={true}
        activeCategory={activeCategory}
      />

      <SearchCategoryTabsComponent
        categories={SEARCH_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={s.loaderColor} />
        </View>
      ) : (
        <TVFocusGuideView autoFocus style={s.listWrapper}>
          <FlatList
            ref={flatListRef}
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
            contentContainerStyle={s.resultsContainer}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={8}
          />
        </TVFocusGuideView>
      )}

      <SearchFilterBottomSheet
        sheetRef={filterSheetRef}
        filters={filters}
        loadedGenres={loadedGenres}
        onApply={(args) => {
          if (typeof args === "boolean") {
            setIsVerified(args);
          } else {
            setFilters(args);
            handleSearch(args);
          }
          filterSheetRef.current?.close();
        }}
        activeCategory={activeCategory}
        onReset={resetFilters}
        isVerified={isVerified}
      />

      <TeamReleasesBottomSheet
        sheetRef={teamReleasesSheetRef}
        selectedTeam={selectedTeam}
        teamReleases={teamReleases}
        isLoading={isLoading_releases}
        navigation={navigation}
      />

      <CharacterDetailBottomSheet
        sheetRef={characterSheetRef}
        character={selectedCharacter}
        animeList={characterAnimeList}
        isLoading={isLoadingCharacter}
        navigation={navigation}
      />
    </DefaultScreenWidget>
  );
}
