import { useLayout } from "../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type CharacterDetailBottomSheetStyles = {
  /** Зовнішній контейнер скролу */
  container: ViewStyle;
  /** contentContainerStyle (центрування елементів) */
  contentContainer: ViewStyle;
  /** Контейнер зображення персонажа */
  imageContainer: ViewStyle;
  /** Зображення персонажа */
  characterImage: ViewStyle;
  /** Градієнт нижньої частини зображення */
  imageGradient: ViewStyle;
  /** Таблетка з ім'ям персонажа */
  namePill: ViewStyle;
  /** Текст імені персонажа */
  nameText: TextStyle;
  /** Контейнер опису */
  descriptionContainer: ViewStyle;
  /** Заголовок секції аніме */
  sectionHeader: ViewStyle;
  /** Контейнер індикатора завантаження */
  loadingContainer: ViewStyle;
  /** Контейнер пустого стану */
  emptyContainer: ViewStyle;
};

export const useCharacterDetailBottomSheetStyles =
  (): CharacterDetailBottomSheetStyles => {
    const layout = useLayout();

    return {
      container: {
        flex: 1,
      },
      contentContainer: {
        alignItems: "center",
      },
      imageContainer: {
        overflow: "hidden",
        borderRadius: layout.s(16),
      },
      characterImage: {
        borderRadius: layout.s(16),
      },
      imageGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: layout.s(60),
      },
      namePill: {
        paddingHorizontal: "10%",
        paddingVertical: layout.s(10),
        borderRadius: layout.s(16),
        marginTop: layout.s(20),
        zIndex: 1,
        minWidth: layout.s(120),
        alignItems: "center",
      },
      nameText: {
        fontFamily: "Nunito-SemiBold",
        textAlign: "center",
      },
      descriptionContainer: {
        marginTop: layout.s(20),
        paddingHorizontal: layout.s(20),
        width: "100%",
      },
      sectionHeader: {
        width: "100%",
        paddingHorizontal: layout.s(20),
        marginTop: layout.s(24),
        marginBottom: layout.s(8),
      },
      loadingContainer: {
        height: layout.s(200),
        justifyContent: "center",
        alignItems: "center",
      },
      emptyContainer: {
        height: layout.s(100),
        justifyContent: "center",
        alignItems: "center",
      },
    };
  };
