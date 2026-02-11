import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";

export default function TVEpisodesSelector({
  episodes,
  onSelectEpisode,
  checkForStyle,
  title = "Оберіть серію",
}) {
  const modalRef = useRef(null);
  const themeColors = useThemeColors();

  const open = () => modalRef.current?.present();

  return (
    <>
      <TVButton
        style={[styles.triggerButton, { backgroundColor: themeColors.subtle }]}
        onPress={open}
      >
        <Text style={[styles.triggerText, { color: themeColors.text }]}>
          Серії
        </Text>
      </TVButton>

      <TVModal ref={modalRef} title={title}>
        <View style={styles.episodesGrid}>
          {(Array.isArray(episodes) ? episodes : []).map((episode) => {
            const isWatched = checkForStyle?.(episode);
            return (
              <TVButton
                key={episode.episode}
                style={[
                  styles.episodeItem,
                  {
                    backgroundColor: isWatched
                      ? themeColors.Primary(0.2)
                      : themeColors.subtle,
                  },
                ]}
                onPress={() => {
                  onSelectEpisode?.(episode);
                  modalRef.current?.dismiss();
                }}
              >
                <Text
                  style={[
                    styles.episodeText,
                    {
                      color: isWatched ? themeColors.primary : themeColors.text,
                    },
                  ]}
                >
                  {episode.episode}
                </Text>
              </TVButton>
            );
          })}
        </View>
      </TVModal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: TV.button.borderRadius,
    minHeight: TV.button.minHeight,
  },
  triggerText: {
    fontFamily: "Nunito-SemiBold",
  },
  episodesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  episodeItem: {
    minWidth: 64,
    minHeight: TV.button.minHeight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeText: {
    fontFamily: "Nunito-SemiBold",
  },
});
