import React, { useRef, useCallback } from "react";
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
  const flatListRef = useRef(null);

  const handleScrollToItem = useCallback(
    (index) => {
      if (flatListRef.current && index >= 0) {
        flatListRef.current.scrollToIndex({
          index: Math.max(0, index - numColumns),
          animated: true,
          viewPosition: 0,
        });
      }
    },
    [numColumns]
  );

  const wrappedRenderItem = useCallback(
    (info) => {
      const originalElement = renderItem(info);
      if (!originalElement) return null;

      return React.cloneElement(originalElement, {
        onFocus: () => {
          handleScrollToItem(info.index);
          originalElement.props?.onFocus?.();
        },
      });
    },
    [renderItem, handleScrollToItem]
  );

  return (
    <TVFocusGuideView autoFocus>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={wrappedRenderItem}
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
