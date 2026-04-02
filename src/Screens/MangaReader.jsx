import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import { useThemeColors } from "../Global/useTheme";
import { useHomeStyles } from "../Styles/components/HomeStyles";
import { H4, H5 } from "../Styles/Fonts";
import Icon from "../Styles/Icons";
import AniuaApi from "../Api/AniuaApi";
import Logger from "../Logger/Logger";

export default function MangaReaderScreen({ route, navigation }) {
  const { slug, title, chapters: initialChapters } = route.params || {};
  const [chapters, setChapters] = useState(initialChapters || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialChapters);
  const [error, setError] = useState(null);
  const themeColors = useThemeColors();
  const s = useHomeStyles();
  const insets = useSafeAreaInsets();

  const loadChapters = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await AniuaApi.getMangaChapters(slug);
      setChapters(data);
      setSelectedIndex(0);
    } catch (err) {
      Logger.error("MangaReader", "Не вдалося завантажити розділи", err);
      setError(err?.message || "Не вдалося завантажити розділи");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!initialChapters) {
      loadChapters();
    }
  }, [initialChapters, loadChapters]);

  const selectedChapter = useMemo(
    () => chapters[selectedIndex] || null,
    [chapters, selectedIndex],
  );

  const renderPage = useCallback(
    ({ item, index }) => (
      <View style={{ marginBottom: 12 }}>
        <FastImage
          source={{ uri: item }}
          style={{
            width: "100%",
            aspectRatio: 0.7,
            borderRadius: 12,
            backgroundColor: themeColors.subtle,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
        <Text
          selectable
          style={{
            color: themeColors.Text?.(0.6) || themeColors.text,
            alignSelf: "flex-end",
            marginTop: 4,
          }}
        >
          Сторінка {index + 1}
        </Text>
      </View>
    ),
    [themeColors],
  );

  const keyExtractor = useCallback((item, index) => `${index}-${item}`, []);

  const renderChaptersBar = () => {
    if (!chapters?.length) return null;
    return (
      <FlatList
        horizontal
        data={chapters}
        keyExtractor={(item, idx) => item.reference || `${idx}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        renderItem={({ item, index }) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                marginRight: 10,
                backgroundColor: isActive
                  ? themeColors.Primary?.(0.15) || themeColors.primary
                  : themeColors.subtle,
                borderWidth: isActive ? 1 : 0,
                borderColor: isActive ? themeColors.primary : "transparent",
              }}
              onPress={() => setSelectedIndex(index)}
            >
              <Text
                selectable
                style={{
                  color: isActive ? themeColors.primary : themeColors.text,
                  fontWeight: "600",
                }}
              >
                {item.title || `Розділ ${item.number ?? index + 1}`}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={s.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={[s.loaderContainer, { paddingTop: 40 }]}>
          <Text selectable style={[H4, { color: themeColors.text }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: themeColors.primary,
            }}
            onPress={loadChapters}
          >
            <Text selectable style={[H5, { color: themeColors.background }]}>
              Спробувати знову
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selectedChapter) {
      return (
        <View style={s.loaderContainer}>
          <Text selectable style={[H4, { color: themeColors.text }]}>
            Розділи не знайдено
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={selectedChapter.pages}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <DefaultScreenWidget isNavBarPadding={true}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: themeColors.subtle,
          }}
          onPress={() => navigation.goBack()}
        >
          <Icon.ArrowLeft size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text
          selectable
          style={[H4, { color: themeColors.text, flex: 1, textAlign: "center" }]}
          numberOfLines={2}
        >
          {title || slug}
        </Text>
        <View style={{ width: 44, height: 44 }} />
      </View>

      {renderChaptersBar()}
      {renderContent()}
    </DefaultScreenWidget>
  );
}
