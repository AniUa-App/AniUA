import React, { useRef } from "react";
import { View } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";
import { useTVEpisodesSelectorStyles } from "../../Styles/components/TV/TVEpisodesSelectorStyles";

export default function TVEpisodesSelector({
  episodes,
  onSelectEpisode,
  checkForStyle,
  title = "Оберіть серію",
}) {
  const modalRef = useRef(null);
  const themeColors = useThemeColors();
  const s = useTVEpisodesSelectorStyles();

  const open = () => modalRef.current?.present();

  return (
    <>
      <TVButton
        style={[s.triggerButton, { backgroundColor: themeColors.subtle }]}
        onPress={open}
      >
        <Text style={[s.triggerText, { color: themeColors.text }]}>
          Серії
        </Text>
      </TVButton>

      <TVModal ref={modalRef} title={title}>
        <View style={s.episodesGrid}>
          {(Array.isArray(episodes) ? episodes : []).map((episode) => {
            const isWatched = checkForStyle?.(episode);
            return (
              <TVButton
                key={episode.episode}
                style={[
                  s.episodeItem,
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
                    s.episodeText,
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

