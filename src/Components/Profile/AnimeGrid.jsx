import { View, Text, ActivityIndicator } from "react-native";
import { useState, useCallback, useMemo } from "react";
import Icons from "../../Styles/Icons";
import AnimeCard from "../AnimeCard";
import { H6 } from "../../Styles/Fonts";
import { useAnimeGridStyles } from "../../Styles/components/Profile/AnimeGridStyles";

export default function AnimeGrid({
  data,
  isLoading,
  emptyIcon,
  emptyText,
  colors,
  navigation,
  getAnimeFromItem,
  showAnimeDetails,
}) {
  const s = useAnimeGridStyles();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback(
    (e) => setContainerWidth(e.nativeEvent.layout.width),
    [],
  );

  const numColumns = s.numColumns(containerWidth);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < data.length; i += numColumns) {
      result.push(data.slice(i, i + numColumns));
    }
    return result;
  }, [data, numColumns]);

  if (isLoading) {
    return (
      <View style={s.emptyState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (data.length === 0) {
    const EmptyIcon = Icons[emptyIcon];
    return (
      <View style={s.emptyState}>
        <EmptyIcon size={48} color={colors.Text(0.3)} weight="regular" />
        <Text selectable={true} style={[H6, s.emptyStateText, { color: colors.Text(0.5) }]}>
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.animeGridContainer} onLayout={onLayout}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={s.row}>
          {row.map((item, colIndex) => {
            const anime = getAnimeFromItem ? getAnimeFromItem(item) : item;
            return (
              <View key={anime?.slug || colIndex} style={s.cardWrapper}>
                <AnimeCard
                  anime={anime}
                  showDetails={showAnimeDetails}
                  navigation={navigation}
                />
              </View>
            );
          })}
          {Array.from({ length: numColumns - row.length }).map((_, i) => (
            <View key={`filler-${i}`} style={s.cardWrapper} />
          ))}
        </View>
      ))}
    </View>
  );
}
