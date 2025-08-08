import { View, Text, Dimensions, StyleSheet, FlatList } from "react-native";
import React, { useEffect } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { TouchableOpacity } from "../Button";
import { Black, white, appColor, Gray } from "../../Styles/Colors";
import { H3, H4 } from "../../Styles/Fonts";
import Icons from "../../Styles/Icons";

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
      backgroundStyle={{ backgroundColor: Black(0.95) }}
      handleIndicatorStyle={{ backgroundColor: Gray(0.5) }}
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
            style={[H3, { color: white, textAlign: "left", marginBottom: 12 }]}
          >
            Якість відтворення
          </Text>
        </View>

        <View style={styles.flatListContainer}>
          <FlatList
            data={qualities}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.speedOptionsContainer}
            keyExtractor={(item) => item.toString()}
            decelerationRate="fast"
            snapToAlignment="center"
            renderItem={({ item: quality, index }) => (
              <TouchableOpacity
                style={[
                  styles.speedOption,
                  currentQuality === quality && styles.speedOptionActive,
                  index !== qualities.length - 1 && { marginRight: 12 },
                ]}
                onPress={() => handleQualityChange(quality)}
              >
                <Text
                  style={[
                    H4,
                    {
                      color: currentQuality === quality ? appColor : white,
                      textAlign: "center",
                    },
                  ]}
                >
                  {quality}
                </Text>
                {currentQuality === quality && (
                  <View style={styles.checkIcon}>
                    <Icons.Check size={16} color={appColor} />
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
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 4,
  },

  speedOptionsContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
  },
  speedOption: {
    minWidth: 80,
    height: 60,
    borderRadius: 12,
    backgroundColor: Black(0.5),
    borderWidth: 1,
    borderColor: Gray(0.5),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  speedOptionActive: {
    backgroundColor: Black(0.8),
    borderWidth: 2,
    borderColor: appColor,
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
