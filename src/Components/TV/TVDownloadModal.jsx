import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "../../Styles/Fonts";
import { useThemeColors } from "../../Global/useTheme";
import TVButton from "./TVButton";
import TVModal from "./TVModal";
import { TV } from "../../Styles/TVStyles";
import Icons from "../../Styles/Icons";

export default function TVDownloadModal({
  episodes,
  onSelectEpisode,
  checkForDownloaded,
  title = "Завантажити серію",
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
        <Icons.DownloadSimple size={32} color={themeColors.text} />
      </TVButton>

      <TVModal ref={modalRef} title={title}>
        <View style={styles.episodesGrid}>
          {(Array.isArray(episodes) ? episodes : []).map((episode) => {
            const isDownloaded = checkForDownloaded?.(episode);
            return (
              <TVButton
                key={episode.episode}
                style={[
                  styles.episodeItem,
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
                    styles.episodeText,
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

const styles = StyleSheet.create({
  triggerButton: {
    alignItems: "center",
    justifyContent: "center",
    width: TV.button.minWidth,
    height: TV.button.minHeight,
    borderRadius: TV.button.borderRadius,
  },
  episodesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  episodeItem: {
    flexDirection: "row",
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
