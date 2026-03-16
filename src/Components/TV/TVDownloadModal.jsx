import React, { useRef } from "react";
import { View } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";
import { useTVDownloadModalStyles } from "../../Styles/components/TV/TVDownloadModalStyles";

export default function TVDownloadModal({
  episodes,
  onSelectEpisode,
  checkForDownloaded,
  title = "Завантажити серію",
}) {
  const modalRef = useRef(null);
  const themeColors = useThemeColors();
  const s = useTVDownloadModalStyles();

  const open = () => modalRef.current?.present();

  return (
    <>
      <TVButton
        style={[s.triggerButton, { backgroundColor: themeColors.subtle }]}
        onPress={open}
      >
        <Icons.DownloadSimple size={32} color={themeColors.text} />
      </TVButton>

      <TVModal ref={modalRef} title={title}>
        <View style={s.episodesGrid}>
          {(Array.isArray(episodes) ? episodes : []).map((episode) => {
            const isDownloaded = checkForDownloaded?.(episode);
            return (
              <TVButton
                key={episode.episode}
                style={[
                  s.episodeItem,
                  {
                    backgroundColor: isDownloaded
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
                      color: isDownloaded
                        ? themeColors.primary
                        : themeColors.text,
                    },
                  ]}
                >
                  {episode.episode}
                </Text>
                {isDownloaded && (
                  <Icons.Check
                    size={16}
                    color={themeColors.primary}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </TVButton>
            );
          })}
        </View>
      </TVModal>
    </>
  );
}

