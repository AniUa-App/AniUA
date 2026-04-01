import { View, Text, FlatList as RNFlatList, ScrollView } from "react-native";
import { TouchableOpacity } from "./Button";
import { FlatList as GHFlatList } from "react-native-gesture-handler";
import { isTV as checkIsTV } from "../Styles/Responsive";
import { useAnimeListHStyles } from "../Styles/components/AnimeListHStyles";
import Icon from "../Styles/Icons";
import { useCallback } from "react";
import MangaCard from "../Components/MangaCard";

const FlatList = checkIsTV() ? RNFlatList : GHFlatList;

const TVCellRenderer = ({ children, style, ...props }) => (
  <View style={[style, { overflow: "visible" }]} collapsable={false} {...props}>
    {children}
  </View>
);

export function MangaListHorizontal({
  mangaList,
  title = "",
  onClickMore = null,
  navigation,
}) {
  const s = useAnimeListHStyles();

  const renderItem = useCallback(
    ({ item: manga, index }) => (
      <MangaCard
        manga={manga}
        key={`${manga.slug}-${index}` || index}
        width={s.cardWidth}
        showDetails={true}
        navigation={navigation}
      />
    ),
    [s, navigation],
  );

  const keyExtractor = useCallback((item, index) => {
    return item.slug ? `${item.slug}-${index}` : String(index);
  }, []);

  const content = (
    <>
      <TouchableOpacity
        style={s.header}
        activeOpacity={1}
        onPress={onClickMore}
        tvFocusable={!!onClickMore}
      >
        {title?.length > 0 && <Text style={s.title}>{title || ""}</Text>}
        {!!onClickMore && (
          <View style={s.arrowIcon}>
            <Icon.ArrowRight size={s.iconSize} color={s.arrowIconColor} />
          </View>
        )}
      </TouchableOpacity>

      <FlatList
        horizontal
        data={mangaList ?? []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        nestedScrollEnabled={true}
        focusable={false}
        contentContainerStyle={[
          s.listContent,
          checkIsTV() && { paddingVertical: 8 },
        ]}
        style={checkIsTV() ? { overflow: "visible" } : undefined}
        CellRendererComponent={checkIsTV() ? TVCellRenderer : undefined}
      />
    </>
  );

  return <View focusable={false}>{content}</View>;
}

export function PreviewMangaListHorizontal({ mangaList, title, onPress = () => {} }) {
  const s = useAnimeListHStyles();

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
      <View style={s.header} activeOpacity={1}>
        {title?.length > 0 && (
          <Text selectable={true} style={s.title}>
            {title || ""}
          </Text>
        )}
        <View style={s.arrowIcon}>
          <Icon.ArrowRight size={s.iconSize} color={s.arrowIconColor} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={false}
        contentContainerStyle={s.listContent}
      >
        {(mangaList ?? []).slice(0, 6).map((manga, index) => (
          <MangaCard
            key={`${manga.slug}-${index}`}
            manga={manga}
            width={s.cardWidth}
            showDetails={true}
          />
        ))}
      </ScrollView>
    </TouchableOpacity>
  );
}
