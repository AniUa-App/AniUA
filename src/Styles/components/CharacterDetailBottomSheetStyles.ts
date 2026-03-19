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
        borderRadius: layout.radius.lg,
      },
      characterImage: {
        borderRadius: layout.radius.lg,
      },
      imageGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: layout.sizing.sm,
      },
      namePill: {
        paddingHorizontal: "10%",
        paddingVertical: layout.spacing.xmd,
        borderRadius: layout.radius.lg,
        marginTop: layout.spacing.xlg,
        zIndex: 1,
        minWidth: layout.s(120),
        alignItems: "center",
      },
      nameText: {
        fontFamily: "Nunito-SemiBold",
        textAlign: "center",
      },
      descriptionContainer: {
        marginTop: layout.spacing.xlg,
        paddingHorizontal: layout.spacing.xlg,
        width: "100%",
      },
      sectionHeader: {
        width: "100%",
        paddingHorizontal: layout.spacing.xlg,
        marginTop: layout.spacing.xl,
        marginBottom: layout.spacing.sm,
      },
      loadingContainer: {
        height: layout.sizing.img,
        justifyContent: "center",
        alignItems: "center",
      },
      emptyContainer: {
        height: layout.sizing.xl,
        justifyContent: "center",
        alignItems: "center",
      },
    };
  };
