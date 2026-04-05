import React, { useMemo } from "react";
import { Text, ScrollView } from "react-native";
import { TouchableOpacity } from "../../Widgets/Button";
import { H5 } from "../../Styles/Fonts";
import Icon from "../../Styles/Icons";
import { MoonIcon, AshdiIcon } from "../../Styles/Icons";
import FastImage from "react-native-fast-image";
import { useThemeColors } from "../../Global/useTheme";
import { PlayerTabsProps } from "./types";
import { styles } from "../../Styles/components/BottomSheetContentStyles";

export const PlayerTabs = React.memo(
  ({
    availablePlayers,
    activePlayer,
    onPlayerSelect,
    hasTVPreferredFocus,
    nextFocusUp,
    firstTabInnerRef,
    providers = [],
  }: PlayerTabsProps) => {
    const themeColors = useThemeColors();

    const providerMap = useMemo(() => {
      const map = new Map<string, any>();
      providers?.forEach((p: any) => {
        if (p?.slug) map.set(p.slug, p);
        if (p?.name) map.set(p.name, p);
      });
      return map;
    }, [providers]);

    const getPlayerIcon = (player: string, isActive: boolean) => {
      const color = isActive ? themeColors.background : themeColors.text;
      const provider = providerMap.get(player);
      if (provider?.logo_url) {
        return (
          <FastImage
            source={{ uri: provider.logo_url }}
            style={{ width: 24, height: 24, borderRadius: 8 }}
            resizeMode={FastImage.resizeMode.cover}
          />
        );
      }
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
      const provider = providerMap.get(player);
      if (provider?.name) return provider.name;
      switch (player) {
        case "moon":
          return "Moon";
        case "ashdi":
          return "Ashdi";
        default:
          return player;
      }
    };

    const sortedPlayers = useMemo(() => [...availablePlayers], [availablePlayers]);

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
  },
);

PlayerTabs.displayName = "PlayerTabs";
