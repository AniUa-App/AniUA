import { View, Text, Dimensions, StyleSheet, FlatList } from "react-native";
import React, { useEffect } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Button";
import { H3, H4 } from "../../Styles/Fonts";
import Icons from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { background } from "../../Styles/Colors";

export default function QualityWidget({
  sheetRef,
  currentQuality,
  onQualityChange,
  qualities = [],
}) {
  const [orientation, setOrientation] = React.useState(
    getOrientation(
      Dimensions.get("window").width,
      Dimensions.get("window").height
    )
  );
  const colors = useThemeColors();
  const handleQualityChange = (quality) => {
    onQualityChange(quality);
    sheetRef.current?.close();
  };

  function getOrientation(width, height) {
    if (!width || !height) return "vertical";
    return width > height ? "horizontal" : "vertical";
  }

  useEffect(() => {
    const handleChange = ({ window }) => {
      setOrientation(getOrientation(window.width, window.height));
      sheetRef.current?.close();
    };

    const subscription = Dimensions.addEventListener("change", handleChange);

    return () => {
      subscription?.remove?.();
    };
  }, [sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={orientation === "horizontal" ? ["45%"] : ["20%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.inActiveText }}
      backdropComponent={(props) => (
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          activeOpacity={1}
          {...props}
        />
      )}
      animationDuration={300}
      enableContentPanningGesture={false}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text
            selectable={true}
            style={[H3, { textAlign: "left", marginBottom: 12 }]}
          >
            Якість відтворення
          </Text>
        </View>

        <View
          style={[
            {
              backgroundColor: colors.accent,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <FlatList
            data={qualities}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.speedOptionsContainer, { flex: 1 }]}
            keyExtractor={(item) => item.toString()}
            decelerationRate="fast"
            snapToAlignment="center"
            renderItem={({ item: quality, index }) => (
              <TouchableOpacity
                style={[
                  styles.speedOption,
                  index !== qualities.length - 1 && {},
                  {
                    backgroundColor:
                      currentQuality === quality
                        ? colors.primary
                        : colors.background,
                  },
                ]}
                onPress={() => handleQualityChange(quality)}
              >
                <Text
                  selectable={true}
                  style={[
                    H4,
                    {
                      color: colors.text,
                      textAlign: "center",
                    },
                  ]}
                >
                  {quality}
                </Text>
                {currentQuality === quality && (
                  <View style={styles.checkIcon}>
                    <Icons.Check size={16} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  header: {
    paddingHorizontal: 4,
  },

  speedOptionsContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexDirection: "row",
  },
  speedOption: {
    borderRadius: 16,
    minWidth: 80,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  speedOptionActive: {},
  checkIcon: {
    position: "absolute",
    top: 2,
    right: 2,
  },
});
