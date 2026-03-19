import React, { useMemo } from "react";
import { Text, ScrollView } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H5 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { MoonIcon, AshdiIcon } from "../../Styles/Icons";
import { useThemeColors } from "../../Global/useTheme";
import { PlayerTabsProps } from "./types";
import { PLAYER_ORDER } from "./constants";
import { styles } from "../../Styles/components/BottomSheetEpisodesStyles";

export const PlayerTabs = React.memo(
  ({ availablePlayers, activePlayer, onPlayerSelect, hasTVPreferredFocus, nextFocusUp, firstTabInnerRef }: PlayerTabsProps) => {
    const themeColors = useThemeColors();

    const getPlayerIcon = (player: string, isActive: boolean) => {
      const color = isActive ? themeColors.background : themeColors.text;
      switch (player) {
        case "moon":
          return <MoonIcon styles={{ width: 24, height: 24 }} />;
        case "ashdi":
          return <AshdiIcon styles={{ width: 24, height: 24 }} />;
        default:
          return <Icon.MonitorPlay size={24} color={color} />;
      }
    };

    const getPlayerLabel = (player: string) => {
      switch (player) {
        case "moon":
          return "Moon";
        case "ashdi":
          return "Ashdi";
        default:
          return player;
      }
    };

    const sortedPlayers = useMemo(() => {
      return [...availablePlayers].sort((a, b) => {
        const indexA = PLAYER_ORDER.indexOf(a);
        const indexB = PLAYER_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }, [availablePlayers]);

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 44 }}
        contentContainerStyle={styles.playerTabsContainer}
      >
        {sortedPlayers.map((player, index) => {
          const isActive = activePlayer.name === player;
          const isFirst = index === 0;
          return (
            <TouchableOpacity
              key={player}
              innerRef={isFirst ? firstTabInnerRef : undefined}
              nextFocusUp={nextFocusUp}
              style={[
                styles.playerTab,
                {
                  backgroundColor: themeColors.subtle,
                  borderBottomRightRadius: isActive ? 0 : 16,
                  borderBottomLeftRadius: isActive ? 0 : 16,
                  height: isActive ? 44 : 42,
                },
              ]}
              onPress={() => onPlayerSelect(player)}
              hasTVPreferredFocus={isActive && hasTVPreferredFocus}
            >
              {getPlayerIcon(player, isActive)}
              <Text
                selectable={true}
                style={[
                  H5,
                  {
                    color: isActive ? themeColors.primary : themeColors.text,
                    marginLeft: 8,
                  },
                ]}
              >
                {getPlayerLabel(player)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }
);

PlayerTabs.displayName = "PlayerTabs";
