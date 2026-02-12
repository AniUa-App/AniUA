import React from "react";
import { View, FlatList, TVFocusGuideView as RNTVFocusGuideView } from "react-native";

const TVFocusGuideView = RNTVFocusGuideView || View;

export default function TVFocusableGrid({
  data,
  renderItem,
  keyExtractor,
  numColumns,
  contentContainerStyle,
  columnWrapperStyle,
  ListEmptyComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold,
  ...props
}) {
  return (
    <TVFocusGuideView autoFocus>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        initialNumToRender={numColumns * 3}
        maxToRenderPerBatch={numColumns * 4}
        windowSize={10}
        removeClippedSubviews={true}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={columnWrapperStyle}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        {...props}
      />
    </TVFocusGuideView>
  );
}
