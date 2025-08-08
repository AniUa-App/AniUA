import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import {
  AppColor,
  Black,
  appColor,
  black,
  Gray,
  white,
  yellow,
} from "../Styles/Colors";
import { TouchableOpacity } from "./Button";
import Icon, { MoonIcon, AshdiIcon, AppIcon } from "../Styles/Icons";
import { GetScreenHeight } from "../Global/Functions";
import { H2, H3, H4 } from "../Styles/Fonts";

export const playersIcons = {
  "Вбудований плеєр": <Icon.MonitorPlay color={appColor} size={40} />,
  moon: <MoonIcon styles={{ width: 40, height: 40 }} />,
  ashdi: <AshdiIcon styles={{ width: 40, height: 40 }} />,
};

function MoonPlayerContent({ dubbings, data, changeDubbing }) {
  const [selectedDubbing, setSelectedDubbing] = useState(data.watched.dubbing);

  return (
    <>
      <Text style={H2}>Плеєр Moon</Text>
      <Text
        style={[
          H4,
          {
            fontSize: 13,
            color: Gray(0.8),
          },
        ]}
      >
        може містити рекламу казино
      </Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={true}
        data={dubbings ? Object.keys(dubbings) : []}
        contentContainerStyle={{ paddingVertical: 10 }}
        style={{ maxHeight: GetScreenHeight() * 0.5 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 11,
              flexDirection: "row",
              width: "100%",
              backgroundColor:
                selectedDubbing === item ? Black(0.4) : "transparent",
              borderRadius: 8,
              marginVertical: 4,
              borderLeftColor: AppColor(),
            }}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedDubbing(item);
              changeDubbing({
                ...data,
                watched: { ...data.watched, dubbing: item },
              });
            }}
          >
            <Text style={H3}>Переклад:</Text>
            <Text
              style={[
                H3,
                { color: selectedDubbing === item ? AppColor() : Gray() },
                { marginLeft: 10, maxWidth: "60%" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}

function AshdiPlayerContent({ dubbings, data, changeDubbing }) {
  const [selectedDubbing, setSelectedDubbing] = useState(data.watched.dubbing);

  return (
    <>
      <Text style={H2}>Плеєр Ashdi</Text>
      <Text
        style={[
          H4,
          {
            fontSize: 13,
            color: Gray(0.8),
          },
        ]}
      >
        може містити рекламу казино
      </Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={true}
        data={dubbings ? Object.keys(dubbings) : []}
        contentContainerStyle={{ paddingVertical: 10 }}
        style={{ maxHeight: GetScreenHeight() * 0.5 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 11,
              flexDirection: "row",
              width: "100%",
              backgroundColor:
                selectedDubbing === item ? Black(0.4) : "transparent",
              borderRadius: 8,
              marginVertical: 4,
              borderLeftColor: AppColor(),
            }}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedDubbing(item);
              changeDubbing({
                ...data,
                watched: { ...data.watched, dubbing: item },
              });
            }}
          >
            <Text style={H3}>Переклад:</Text>
            <Text
              style={[
                H3,
                { color: selectedDubbing === item ? AppColor() : Gray() },
                { marginLeft: 10, maxWidth: "60%" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}

function DefaultPlayerContent({ dubbings, data, changeDubbing }) {
  const [selectedDubbing, setSelectedDubbing] = useState(data.watched.dubbing);

  return (
    <>
      <Text style={H2}>Вбудований плеєр</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={true}
        data={dubbings ? Object.keys(dubbings) : []}
        contentContainerStyle={{ paddingVertical: 10 }}
        style={{ maxHeight: GetScreenHeight() * 0.5 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 11,
              flexDirection: "row",
              width: "100%",
              backgroundColor:
                selectedDubbing === item ? Black(0.4) : "transparent",
              borderRadius: 8,
              marginVertical: 4,
              borderLeftColor: AppColor(),
            }}
            activeOpacity={0.7}
            onPress={() => {
              setSelectedDubbing(item);
              changeDubbing({
                ...data,
                watched: { ...data.watched, dubbing: item },
              });
            }}
          >
            <Text style={H3}>Переклад:</Text>
            <Text
              style={[
                H3,
                { color: selectedDubbing === item ? AppColor() : Gray() },
                { marginLeft: 10, maxWidth: "60%" },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}

export function getFullDubbersListOfQueues(episodesList) {
  if (!episodesList || typeof episodesList !== "object") {
    console.log("episodesList is not valid:", episodesList);
    return {};
  }

  var players = Object.keys(episodesList);
  var dubbersList = {}; // Змінюємо на об'єкт замість масиву

  for (const player of players) {
    const playerEpisodes = episodesList[player];
    if (!playerEpisodes || typeof playerEpisodes !== "object") {
      console.log(`Player ${player} episodes is not valid:`, playerEpisodes);
      continue;
    }

    var dubbers = Object.keys(playerEpisodes);
    for (const dubber of dubbers) {
      const dubberEpisodes = playerEpisodes[dubber];
      if (!Array.isArray(dubberEpisodes)) {
        console.log(
          `Dubber ${dubber} episodes is not an array:`,
          dubberEpisodes
        );
        continue;
      }

      if (dubbersList.hasOwnProperty(dubber)) {
        // Якщо дублер вже існує, перевіряємо чи новий список епізодів довший
        if (dubbersList[dubber].length < dubberEpisodes.length) {
          dubbersList[dubber] = dubberEpisodes;
        }
      } else {
        // Якщо дублер не існує, додаємо його
        dubbersList[dubber] = dubberEpisodes;
      }
    }
  }
  return dubbersList;
}

export default function DubbingBottomSheet({
  sheetRef,
  episodesList,
  storage_data,
  isChanges,
}) {
  const [activeTab, setActiveTab] = useState(null);
  const [info, setInfo] = useState(storage_data);

  // Потім встановлюємо плеєр на основі інформаціїі
  useEffect(() => {
    if (
      episodesList &&
      typeof episodesList === "object" &&
      Object.keys(episodesList).length > 0 &&
      info
    ) {
      // Визначаємо, яку вкладку встановити за замовчуванням
      let defaultTab;

      // Спочатку перевіряємо, чи є player в info.watched і чи він присутній в episodesList
      if (info?.watched?.player && episodesList[info?.watched?.player]) {
        defaultTab = info?.watched?.player;
      }

      // Встановлюємо активну вкладку
      setActiveTab(defaultTab);
    }
  }, [episodesList]); // Прибираємо info з залежностей, щоб уникнути циклів

  const changeDubbing = (newInfo) => {
    setInfo(newInfo);
    if (isChanges) {
      isChanges(newInfo);
    }
  };
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["60%"]}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: Black(0.8) }}
      handleIndicatorStyle={{ backgroundColor: Black(1) }}
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
      <BottomSheetView style={[styles.container]}>
        <View style={styles.contentContainer}>
          {(() => {
            if (activeTab === "moon") {
              return (
                <MoonPlayerContent
                  dubbings={episodesList.moon}
                  data={info}
                  changeDubbing={changeDubbing}
                />
              );
            } else if (activeTab === "ashdi") {
              return (
                <AshdiPlayerContent
                  dubbings={episodesList.ashdi}
                  data={info}
                  changeDubbing={changeDubbing}
                />
              );
            } else if (activeTab === "Вбудований плеєр") {
              return (
                <DefaultPlayerContent
                  dubbings={episodesList["Вбудований плеєр"]}
                  data={info}
                  changeDubbing={changeDubbing}
                />
              );
            } else {
              return null;
            }
          })()}
        </View>
        <Text style={[H3, { paddingBottom: 16, paddingLeft: 16 }]}>Плеєр:</Text>
        <View style={styles.tabsContainer}>
          {Object.entries(playersIcons).map(([name, icon]) => {
            if (name in episodesList) {
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => {
                    changeDubbing({
                      ...info,
                      watched: { ...info.watched, player: name },
                    });
                    setActiveTab(name);
                  }}
                  style={[
                    styles.tabButton,
                    activeTab === name && styles.activeTabButton,
                  ]}
                >
                  {icon}
                </TouchableOpacity>
              );
            }
            return null;
          })}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignSelf: "center",
    width: "100%",
    height: "100%",
  },
  tabsContainer: {
    flex: 0.3,
    flexDirection: "row",
    gap: 20,
    paddingLeft: 26,
  },
  tabButton: {
    padding: 1,
    backgroundColor: "transparent",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    borderColor: Gray(0.5),
    borderWidth: 1,
    justifyContent: "center",
    width: 45,
    height: 45,
  },
  activeTabButton: {
    borderColor: AppColor(),
    borderWidth: 1,
  },
  tabText: {
    color: "white",
    marginLeft: 8,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 10,
    width: "100%",
    height: "80%",
  },
});
