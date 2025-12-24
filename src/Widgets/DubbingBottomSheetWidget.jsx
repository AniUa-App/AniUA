import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Primary,
  Background,
  primary,
  background,
  InActiveText,
  text,
  yellow,
} from "../Styles/Colors";
import { TouchableOpacity } from "./Button";
import Icon, { MoonIcon, AshdiIcon, AppIcon } from "../Styles/Icons";
import { H2, H3, H4, H5 } from "../Styles/Fonts";
import MainConfig from "../cfgs/MainConfig";
import { Linking } from "react-native";
import Logger from "../Logger/Logger";
import DubComponent from "../Components/DubComponent";
import { useThemeColors } from "../Global/useTheme";

export const playersIcons = {
  "Вбудований плеєр": <Icon.MonitorPlay color={primary} size={40} />,
  moon: <MoonIcon styles={{ width: 40, height: 40 }} />,
  ashdi: <AshdiIcon styles={{ width: 40, height: 40 }} />,
};

// Функція для сортування студій - партнерські студії вгорі у порядку з MainConfig.partnerStudios_old
export const sortDubbingsBypartnerStudios_old = (dubbingsList) => {
  if (!Array.isArray(dubbingsList) || dubbingsList.length === 0) return [];

  // Сортуємо партнерів у тому ж порядку, як вони розташовані у partnerStudios_old
  const partnerStudiosObj = MainConfig?.partnerStudios_old || {};
  const ps = Object.keys(partnerStudiosObj);

  const partners = ps.filter((studio) => dubbingsList.includes(studio));
  const others = dubbingsList.filter((dubbing) => !ps.includes(dubbing));

  return [...partners, ...others];
};

// Функція для сортування студій - верифіковані команди вгорі
// Повертає масив об'єктів { name: string, team: Team | null }
export const sortDubbingsByPartnerStudios = (dubbingsList) => {
  if (!Array.isArray(dubbingsList) || dubbingsList.length === 0) return [];

  const partnerStudios = Array.isArray(MainConfig?.partnerStudios) ? MainConfig.partnerStudios : [];

  const normalizeDubbingName = (name) => {
    if (!name || typeof name !== "string") return "";
    return name.replace(/\s*\((субтитри|subtitles|subs)\)\s*$/i, "").trim();
  };

  // Створюємо масив об'єктів з інформацією про команду
  const dubbingsWithTeams = dubbingsList.map((dubbingName) => {
    const lowerDubbing = normalizeDubbingName(dubbingName).toLowerCase();

    const matchedTeam = partnerStudios.find((team) => {
      const lowerName = team.name?.toLowerCase() || "";
      const altNames = team.alt_names?.map((alt) => alt.toLowerCase()) || [];

      return (
        lowerName.includes(lowerDubbing) ||
        altNames.some((alt) => alt.includes(lowerDubbing))
      );
    });

    return { name: dubbingName, team: matchedTeam || null };
  });

  // Сортуємо: is_verified вгорі, потім інші з команд, потім без команд
  dubbingsWithTeams.sort((a, b) => {
    const aVerified = a.team?.is_verified ? 1 : 0;
    const bVerified = b.team?.is_verified ? 1 : 0;

    // Спочатку порівнюємо по is_verified
    if (bVerified !== aVerified) {
      return bVerified - aVerified;
    }

    // Потім команди з team вище ніж без team
    const aHasTeam = a.team ? 1 : 0;
    const bHasTeam = b.team ? 1 : 0;

    return bHasTeam - aHasTeam;
  });

  return dubbingsWithTeams;
};

// Допоміжна функція для отримання Team за назвою озвучення
export const getPartnerTeamByDubbingName = (dubbingName) => {
  const partnerStudios = Array.isArray(MainConfig?.partnerStudios) ? MainConfig.partnerStudios : [];
  if (!dubbingName) return null;

  const normalizedName =
    typeof dubbingName === "string"
      ? dubbingName.replace(/\s*\((субтитри|subtitles|subs)\)\s*$/i, "").trim()
      : dubbingName;

  const lowerDubbing = String(normalizedName).toLowerCase();

  for (const team of partnerStudios) {
    const lowerName = team.name?.toLowerCase() || "";

    if (lowerName === lowerDubbing) return team;

    if (Array.isArray(team.alt_names)) {
      if (
        team.alt_names.some((altName) => altName.toLowerCase() === lowerDubbing)
      ) {
        return team;
      }
    }
  }
  return null;
};

const playerTitles = {
  "Вбудований плеєр": "Вбудований плеєр",
  moon: "Плеєр Moon",
  ashdi: "Плеєр Ashdi",
};

const playersWithAds = ["ashdi"];

function PlayerContent({ playerType, dubbings, data, changeDubbing }) {
  const [selectedDubbing, setSelectedDubbing] = useState(data.watched.dubbing);
  const themeColors = useThemeColors();
  const { height } = useWindowDimensions();

  return (
    <>
      <Text
        style={[
          H3,
          {
            textAlign: "center",
          },
        ]}
      >
        {playerTitles[playerType] || playerType}
      </Text>
      {playersWithAds.includes(playerType) && (
        <Text
          style={[
            H5,
            {
              textAlign: "center",

              color: InActiveText(0.8),
            },
          ]}
        >
          може містити рекламу казино
        </Text>
      )}
      <FlatList
        showsVerticalScrollIndicator={false}
        bounces={true}
        data={
          dubbings ? sortDubbingsByPartnerStudios(Object.keys(dubbings)) : []
        }
        keyExtractor={(item) => item.name}
        contentContainerStyle={{ paddingVertical: 10 }}
        style={{ maxHeight: height * 0.5 }}
        renderItem={({ item }) => {
          const { name, team } = item;
          const episodesCount = dubbings[name]?.length || 0;

          return (
            <DubComponent
              logo={team?.logo}
              name={name}
              subtitle={`${episodesCount} серій`}
              isPartner={team?.is_verified}
              onBodyClick={() => {
                setSelectedDubbing(name);
                changeDubbing({
                  ...data,
                  watched: { ...data.watched, dubbing: name },
                });
              }}
              onButtonClick={() => {
                if (team?.telegram) {
                  Linking.openURL(team.telegram).catch((err) =>
                    Logger.error(
                      "DubbingBottomSheet",
                      "Failed to open URL",
                      err
                    )
                  );
                }
              }}
              style={{
                borderColor:
                  selectedDubbing === name
                    ? themeColors.primary
                    : themeColors.Primary(0),
                borderWidth: 1,
              }}
              icon={<Icon.TelegramLogo size={32} color={text} />}
            />
          );
        }}
      />
    </>
  );
}

export function getFullDubbersListOfQueues(episodesList) {
  if (!episodesList || typeof episodesList !== "object") {
    Logger.warn("DubbingBottomSheet", "episodesList is not valid", {
      episodesList,
    });
    return {};
  }

  const partnerStudios = Array.isArray(MainConfig?.partnerStudios) ? MainConfig.partnerStudios : [];

  const normalizeDubbingName = (name) => {
    if (!name || typeof name !== "string") return "";
    return name.replace(/\s*\((субтитри|subtitles|subs)\)\s*$/i, "").trim();
  };

  const isSubtitlesQueue = (dubbingName, episodes) => {
    const lower = String(dubbingName || "").toLowerCase();
    if (
      lower.includes("субт") ||
      lower.includes("subtitle") ||
      lower === "sub" ||
      lower.includes(" subs") ||
      lower.endsWith(" subs")
    ) {
      return true;
    }

    const firstEpisode = Array.isArray(episodes) ? episodes[0] : null;
    if (firstEpisode && typeof firstEpisode === "object") {
      const t = String(
        firstEpisode.translation_type ??
          firstEpisode.translationType ??
          firstEpisode.type ??
          ""
      ).toLowerCase();
      if (t === "sub" || t === "subs" || t === "subtitle") return true;
      if (typeof firstEpisode.is_sub === "boolean") return firstEpisode.is_sub;
      if (typeof firstEpisode.isSubtitle === "boolean")
        return firstEpisode.isSubtitle;
    }

    return false;
  };

  // Функція для отримання канонічного імені команди
  const getCanonicalName = (dubbingName) => {
    const normalized = normalizeDubbingName(dubbingName);
    const lowerDubbing = normalized.toLowerCase();

    for (const team of partnerStudios) {
      const lowerName = team.name?.toLowerCase() || "";
      const altNames = team.alt_names?.map((alt) => alt.toLowerCase()) || [];

      if (
        lowerName.includes(lowerDubbing) ||
        lowerDubbing.includes(lowerName) ||
        altNames.some(
          (alt) => alt.includes(lowerDubbing) || lowerDubbing.includes(alt)
        )
      ) {
        return team.name; // Повертаємо офіційне ім'я команди
      }
    }
    return normalized || dubbingName; // Якщо не знайдено - повертаємо оригінальне ім'я
  };

  var players = Object.keys(episodesList);
  var dubbersList = {};

  for (const player of players) {
    const playerEpisodes = episodesList[player];
    if (!playerEpisodes || typeof playerEpisodes !== "object") {
      Logger.warn(
        "DubbingBottomSheet",
        `Player ${player} episodes is not valid`,
        { playerEpisodes }
      );
      continue;
    }

    var dubbers = Object.keys(playerEpisodes);
    for (const dubber of dubbers) {
      const dubberEpisodes = playerEpisodes[dubber];
      if (!Array.isArray(dubberEpisodes)) {
        Logger.warn(
          "DubbingBottomSheet",
          `Dubber ${dubber} episodes is not an array`,
          { dubberEpisodes }
        );
        continue;
      }

      // Отримуємо канонічне ім'я (team.name якщо знайдено, інакше оригінальне)
      const canonicalName = getCanonicalName(dubber);
      const finalName = isSubtitlesQueue(dubber, dubberEpisodes)
        ? `${canonicalName} (субтитри)`
        : canonicalName;

      if (dubbersList.hasOwnProperty(finalName)) {
        // Якщо дублер вже існує, перевіряємо чи новий список епізодів довший
        if (dubbersList[finalName].length < dubberEpisodes.length) {
          dubbersList[finalName] = dubberEpisodes;
        }
      } else {
        // Якщо дублер не існує, додаємо його
        dubbersList[finalName] = dubberEpisodes;
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
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(null);
  const [info, setInfo] = useState(storage_data);
  const themeColors = useThemeColors();

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

      // Спочатку перевіряємо, чи є player в info?.watched і чи він присутній в episodesList
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
      backgroundStyle={{ backgroundColor: themeColors.background }}
      handleIndicatorStyle={{ backgroundColor: themeColors.inActiveIcon }}
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
      <BottomSheetView
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.contentContainer}>
          {activeTab && episodesList[activeTab] && (
            <PlayerContent
              playerType={activeTab}
              dubbings={episodesList[activeTab]}
              data={info}
              changeDubbing={changeDubbing}
            />
          )}
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
                      watched: { ...info?.watched, player: name },
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
    borderColor: InActiveText(0.5),
    borderWidth: 1,
    justifyContent: "center",
    width: 45,
    height: 45,
  },
  activeTabButton: {
    borderColor: Primary(),
    borderWidth: 1,
  },
  tabText: {
    color: "text",
    marginLeft: 8,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  contentContainer: {
    paddingHorizontal: 10,
    width: "100%",
    height: "75%",
  },
});
