import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";

export default function TVDubbingSelector({
  episodesList,
  currentPlayer,
  currentDubbing,
  onSelect,
}) {
  const modalRef = useRef(null);
  const themeColors = useThemeColors();

  const players = Object.keys(episodesList || {});

  const open = () => modalRef.current?.present();

  return (
    <>
      <TVButton
        style={[styles.triggerButton, { backgroundColor: themeColors.subtle }]}
        onPress={open}
      >
        <Text style={[styles.triggerText, { color: themeColors.primary }]}>
          {currentDubbing || "Вибрати дубляж"}
        </Text>
      </TVButton>

      <TVModal ref={modalRef} title="Оберіть озвучення">
        {players.map((player) => {
          const dubbings = Object.keys(episodesList[player] || {});
          return (
            <View key={player} style={styles.playerSection}>
              <Text
                style={[
                  styles.playerTitle,
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
                      styles.dubbingItem,
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
                        styles.dubbingText,
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

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: TV.button.borderRadius,
    minHeight: TV.button.minHeight,
  },
  triggerText: {
    fontFamily: "Nunito-SemiBold",
  },
  playerSection: {
    marginBottom: 16,
  },
  playerTitle: {
    fontFamily: "Nunito-SemiBold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  dubbingItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 4,
    minHeight: TV.button.minHeight,
    justifyContent: "center",
  },
  dubbingText: {
    fontFamily: "Nunito-Medium",
  },
});
