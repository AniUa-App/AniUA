import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import React, { useRef, useState } from "react";
import DefaultScreenWidget from "../Widgets/DefaultScreenWidget";
import AnimeListHorizontal from "../Widgets/AnimeListHorizontalWidget";
import { HikkaSets } from "../Sources/HikkaSets";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";

import {
  appColor,
  white,
  black_1,
  White,
  Black,
  Black_1,
  black,
  AppColor,
  gray,
  Gray,
} from "../Styles/Colors";
import { H4 } from "../Styles/Fonts";
import SettingsStorage from "../Storage/SettingsStorage";
import CustomSet, { test } from "../Sources/CustomSet";
import SwitchWidget from "../Widgets/SwitchWidget";
import { EventBus } from "../Global/EventBus";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Icons from "../Styles/Icons";
import {
  CustomAnimeListsPreviewScreen,
  CustomisationAnimeListsScreen,
} from "./BottomSheetScreens";

export default function MainScreenCustomisationScreen() {
  const [RECOMMENDATIONS, setRecommendations] = useState();
  const PersonalRecommendationsSettingsRef = useRef(null);

  function SET_RECOMMENDATIONS(newRecommendations) {
    setRecommendations(newRecommendations);
    EventBus.emit("recommendations", newRecommendations);

    console.log(
      "[MainScreenCustomisationScreen] SET_RECOMMENDATIONS",
      newRecommendations
    );
    SettingsStorage.setParameter(
      "userConfig.recommendations",
      newRecommendations
    );
  }

  useEffect(() => {
    setRecommendations(
      SettingsStorage.getParameter("userConfig.recommendations")
    );
  }, []);

  return (
    <DefaultScreenWidget>
      <SwitchWidget
        title="Показувати загальні рекомендації"
        value={RECOMMENDATIONS?.isEnabled || false}
        onPress={() => {
          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isEnabled: !RECOMMENDATIONS?.isEnabled,
          });
        }}
        onBodyPress={() => {
          PersonalRecommendationsSettingsRef.current?.present();
        }}
      />
      <SwitchWidget
        title="Показувати вбудований банер"
        value={RECOMMENDATIONS?.isDefaultBigBanner || false}
        onPress={() => {
          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isDefaultBigBanner: !RECOMMENDATIONS?.isDefaultBigBanner,
          });
        }}
      />
      <SwitchWidget
        title="Показувати особисті рекомендації"
        value={RECOMMENDATIONS?.isCustomedPersonalRecommendations || false}
        onPress={() => {
          if (!RECOMMENDATIONS?.isCustomedPersonalRecommendations) {
            PersonalRecommendationsSettingsRef.current?.present();
          }
          SET_RECOMMENDATIONS({
            ...RECOMMENDATIONS,
            isCustomedPersonalRecommendations:
              !RECOMMENDATIONS?.isCustomedPersonalRecommendations,
          });
        }}
        onPressBody={() => {
          if (RECOMMENDATIONS?.isCustomedPersonalRecommendations) {
            PersonalRecommendationsSettingsRef.current?.present();
          }
        }}
      />
      <PersonalRecommendationsSettings
        sheetRef={PersonalRecommendationsSettingsRef}
        personalRecommendations={RECOMMENDATIONS?.personalRecommendations}
      />
    </DefaultScreenWidget>
  );
}

function CustomisationScreen() {
  return (
    <View>
      <Text>CustomisationScreen</Text>
    </View>
  );
}

const OngoingAnimeList = React.memo(() => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPopularAnime = async () => {
      try {
        const data = await HikkaSets.getOngoingAnime(1, 16, 2020);
        setAnimeList(data);
      } catch (error) {
        console.error("Помилка при завантаженні популярних аніме:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularAnime();
  }, []);

  const handleShowMore = useCallback(async () => {
    try {
      const data = await HikkaSets.getOngoingAnime(1, 32, 2020);
      navigation.navigate("HiddenStack", {
        screen: "AnimeList",
        params: {
          title: "Онґоінги",
          initialData: data,
        },
      });
    } catch (error) {
      console.error("Помилка при завантаженні аніме:", error);
    }
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={appColor} />
      </View>
    );
  }

  return (
    <AnimeListHorizontal
      title="Онґоінги"
      animeList={animeList}
      onClickMore={handleShowMore}
    />
  );
});

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: black_1,
    borderRadius: 8,
    padding: 4,
    alignSelf: "center",
    position: "relative",
  },
  segmentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: appColor,
  },
  segmentIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: appColor,
    borderRadius: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

function PersonalRecommendationsSettings({
  sheetRef,
  personalRecommendations,
}) {
  const [
    customAnimeRecommendationsSettings,
    setCustomAnimeRecommendationsSettings,
  ] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["50%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: Black_1(0.8) }}
      handleIndicatorStyle={{ backgroundColor: black }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => {
            setIsAdding(false);
            sheetRef.current?.close();
          }}
          {...props}
        />
      )}
      animationDuration={300}
      enableContentPanningGesture={true}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {isAdding ? (
          <CustomisationAnimeListsScreen
            onPressCheck={() => {
              setIsAdding(false);
            }}
          />
        ) : (
          <CustomAnimeListsPreviewScreen
            onPressAdd={() => {
              setIsAdding(true);
            }}
          />
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function configureAnimeRecommendationsItem() {}

export function TabWidget({ segments, onSelect = () => {}, style }) {
  const [activeSegment, setActiveSegment] = useState(segments[0]);
  const [layouts, setLayouts] = useState({});
  const translateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  const animateTo = (label) => {
    const layout = layouts[label];
    if (!layout) return;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: layout.x,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(indicatorWidth, {
        toValue: layout.width,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  React.useEffect(() => {
    if (layouts[activeSegment]) {
      animateTo(activeSegment);
    }
  }, [activeSegment, layouts]);

  return (
    <View style={[styles.segmentContainer, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.segmentIndicator,
          { width: indicatorWidth, transform: [{ translateX }] },
        ]}
      />
      {segments.map((label) => {
        const isActive = activeSegment === label;
        return (
          <TouchableOpacity
            key={label}
            onLayout={(e) => {
              const { x, width } = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [label]: { x, width } }));
            }}
            onPress={() => {
              setActiveSegment(label);
              onSelect(label);
            }}
            style={[styles.segmentButton, {}]}
          >
            <Text style={[H4, { color: isActive ? white : White(0.8) }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function TextInputWidget({
  title = "",
  onChangeText = () => {},
  placeholder = "Назва",
  style,
}) {
  return (
    <View style={[style]}>
      <TextInput
        value={title}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={gray}
        textColor={white}
        style={{
          height: 45,
          width: "100%",
          paddingHorizontal: 16,
          color: white,
          backgroundColor: Black_1(1),
          borderRadius: 8,
        }}
      />
    </View>
  );
}
