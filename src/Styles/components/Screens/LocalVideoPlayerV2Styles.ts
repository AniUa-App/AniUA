import { useLayout } from "../../Layout";
import type { ViewStyle, TextStyle } from "react-native";

type LocalVideoPlayerV2Styles = {
  /** Головний контейнер плеєра */
  container: ViewStyle;
  /** Зона дотику для показу/приховання контролів */
  videoTouchArea: ViewStyle;
  /** Компонент відео */
  video: ViewStyle;
  /** Накладання при завантаженні */
  loadingOverlay: ViewStyle;
  /** Контейнер індикатора завантаження */
  loadingContainer: ViewStyle;
  /** Контейнер помилки */
  errorContainer: ViewStyle;
  /** Іконка помилки */
  errorIcon: TextStyle;
  /** Текст помилки */
  errorText: TextStyle;
  /** Індикатор перемотування */
  seekIndicator: ViewStyle;
  /** Індикатор перемотування ліворуч */
  seekIndicatorLeft: ViewStyle;
  /** Індикатор перемотування праворуч */
  seekIndicatorRight: ViewStyle;
  /** Вміст індикатора перемотування */
  seekIndicatorContent: ViewStyle;
  /** Заголовок плеєра */
  header: ViewStyle;
  /** Градієнт заголовку */
  headerGradient: ViewStyle;
  /** Вміст заголовку */
  headerContent: ViewStyle;
  /** Кнопка в заголовку */
  headerButton: ViewStyle;
  /** Контейнер заголовку відео */
  titleContainer: ViewStyle;
  /** Кнопки заголовку */
  headerButtons: ViewStyle;
  /** Контейнер елементів керування */
  controlsContainer: ViewStyle;
  /** Градієнт елементів керування */
  controlsGradient: ViewStyle;
  /** Контейнер прогрес-бару */
  progressContainer: ViewStyle;
  /** Контейнер слайдера прогресу */
  progressBarContainer: ViewStyle;
  /** Фон прогрес-бару */
  progressBarBackground: ViewStyle;
  /** Заповнення прогрес-бару */
  progressBarFill: ViewStyle;
  /** Основні елементи керування */
  mainControls: ViewStyle;
  /** Ліва група кнопок */
  leftControlGroup: ViewStyle;
  /** Права група кнопок */
  rightControlGroup: ViewStyle;
  /** Кнопка керування */
  controlButton: ViewStyle;
  /** Група кнопок відтворення */
  playControlGroup: ViewStyle;
  /** Кнопка перемотування */
  seekButton: ViewStyle;
  /** Кнопка пропуску */
  skipButton: ViewStyle;
  /** Контейнер кнопки відтворення */
  playButtonContainer: ViewStyle;
  /** Кнопка відтворення */
  playButton: ViewStyle;
  /** Контейнер кнопки завантаження */
  downloadButtonContainer: ViewStyle;
  /** Додаткові елементи керування */
  secondaryControls: ViewStyle;
  /** Центральна інформація */
  centerInfo: ViewStyle;
  /** Текст якості */
  qualityText: TextStyle;
  /** Панель епізодів */
  episodesPanel: ViewStyle;
  /** Вміст панелі епізодів */
  episodesPanelContent: ViewStyle;
  /** Заголовок панелі епізодів */
  episodesPanelHeader: ViewStyle;
  /** Кнопка "назад" в панелі епізодів */
  episodesBackButton: ViewStyle;
  /** Лічильник епізодів */
  episodeCount: ViewStyle;
  /** Список епізодів */
  episodesList: ViewStyle;
  /** Накладання закрити панель */
  episodesOverlay: ViewStyle;
};

export const useLocalVideoPlayerV2Styles = (): LocalVideoPlayerV2Styles => {
  const layout = useLayout();

  return {
    container: { flex: 1 },
    videoTouchArea: { flex: 1 },
    video: { flex: 1, width: "100%" },
    loadingOverlay: { position: "absolute", top: 0, left: 0, bottom: 0, right: 0, justifyContent: "center", alignItems: "center", zIndex: 1000 },
    loadingContainer: { padding: layout.s(20), borderRadius: layout.s(16) },
    errorContainer: { alignItems: "center", paddingHorizontal: layout.s(32), gap: layout.s(12) },
    errorIcon: { fontSize: 36 },
    errorText: { color: "#fff", fontSize: 15, textAlign: "center", opacity: 0.9 },
    seekIndicator: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", zIndex: 999 },
    seekIndicatorLeft: { left: layout.s(40) },
    seekIndicatorRight: { right: layout.s(40) },
    seekIndicatorContent: { flexDirection: "row", alignItems: "center", paddingVertical: layout.s(12), paddingHorizontal: layout.s(20), borderRadius: layout.s(16) },
    header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
    headerGradient: { paddingTop: layout.s(40), paddingBottom: layout.s(16) },
    headerContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: layout.s(25) },
    headerButton: { width: layout.s(44), height: layout.s(44), padding: layout.s(8), alignItems: "center", justifyContent: "center", borderRadius: layout.s(22) },
    titleContainer: { flex: 1, marginHorizontal: layout.s(16) },
    headerButtons: { flexDirection: "row", alignItems: "center" },
    controlsContainer: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    controlsGradient: { paddingHorizontal: layout.s(25), paddingTop: layout.s(30) },
    progressContainer: { flexDirection: "row", alignItems: "center" },
    progressBarContainer: { flex: 1, marginHorizontal: layout.s(8), height: layout.s(60), justifyContent: "center" },
    progressBarBackground: { height: 4, borderRadius: 2, position: "relative" },
    progressBarFill: { height: "100%", borderRadius: 2, position: "absolute" },
    mainControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: layout.s(16) },
    leftControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", flex: 1 },
    rightControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", flex: 1 },
    controlButton: { padding: layout.s(12), marginHorizontal: layout.s(4), paddingHorizontal: layout.s(16), paddingVertical: layout.s(6), borderRadius: layout.s(16) },
    playControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 2 },
    seekButton: { alignItems: "center", justifyContent: "center", padding: layout.s(8), marginHorizontal: layout.s(8), minWidth: layout.s(40) },
    skipButton: { padding: layout.s(12), marginHorizontal: layout.s(16) },
    playButtonContainer: { marginHorizontal: layout.s(20) },
    playButton: { width: layout.s(64), height: layout.s(64), borderRadius: layout.s(32), justifyContent: "center", alignItems: "center" },
    downloadButtonContainer: { alignItems: "center", justifyContent: "center" },
    secondaryControls: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 0 },
    centerInfo: { flex: 1, alignItems: "center" },
    qualityText: {},
    episodesPanel: { position: "absolute", top: 0, right: 0, bottom: 0, width: layout.s(300), zIndex: 11 },
    episodesPanelContent: { flex: 1 },
    episodesPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: layout.s(25),
      paddingVertical: layout.s(16),
      paddingTop: layout.s(50),
      borderBottomWidth: 1,
    },
    episodesBackButton: { padding: layout.s(8) },
    episodeCount: { borderRadius: layout.s(8), paddingHorizontal: layout.s(8), paddingVertical: layout.s(4), borderWidth: 1 },
    episodesList: { flex: 1, paddingHorizontal: layout.s(16) },
    episodesOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  };
};
