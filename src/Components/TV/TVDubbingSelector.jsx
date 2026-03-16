import React, { useRef } from "react";
import { View } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";
import { useTVDubbingSelectorStyles } from "../../Styles/components/TV/TVDubbingSelectorStyles";

export default function TVDubbingSelector({
  episodesList,
  currentPlayer,
  currentDubbing,
  onSelect,
}) {
  const modalRef = useRef(null);
  const themeColors = useThemeColors();
  const s = useTVDubbingSelectorStyles();

  const players = Object.keys(episodesList || {});

  const open = () => modalRef.current?.present();

  return (
    <>
      <TVButton
        style={[s.triggerButton, { backgroundColor: themeColors.subtle }]}
        onPress={open}
      >
        <Text style={[s.triggerText, { color: themeColors.primary }]}>
          {currentDubbing || "Вибрати дубляж"}
        </Text>
      </TVButton>

      <TVModal ref={modalRef} title="Оберіть озвучення">
        {players.map((player) => {
          const dubbings = Object.keys(episodesList[player] || {});
          return (
            <View key={player} style={s.playerSection}>
              <Text
                style={[
                  s.playerTitle,
                  { color: themeColors.inActiveText },
                ]}
              >
                {player}
              </Text>
              {dubbings.map((dubbing) => {
                const isActive =
                  currentPlayer === player && currentDubbing === dubbing;
                return (
                  <TVButton
                    key={`${player}-${dubbing}`}
                    style={[
                      s.dubbingItem,
                      {
                        backgroundColor: isActive
                          ? themeColors.Primary(0.2)
                          : "transparent",
                      },
                    ]}
                    onPress={() => {
                      onSelect?.(player, dubbing);
                      modalRef.current?.dismiss();
                    }}
                    hasTVPreferredFocus={isActive}
                  >
                    <Text
                      style={[
                        s.dubbingText,
                        {
                          color: isActive
                            ? themeColors.primary
                            : themeColors.text,
                        },
                      ]}
                    >
                      {dubbing}
                    </Text>
                  </TVButton>
                );
              })}
            </View>
          );
        })}
      </TVModal>
    </>
  );
}

