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
    loadingContainer: { padding: layout.spacing.xlg, borderRadius: layout.radius.lg },
    errorContainer: { alignItems: "center", paddingHorizontal: layout.spacing.xxl, gap: layout.spacing.md },
    errorIcon: { fontSize: 36 },
    errorText: { color: "#fff", fontSize: 15, textAlign: "center", opacity: 0.9 },
    seekIndicator: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", zIndex: 999 },
    seekIndicatorLeft: { left: layout.spacing.xl3 },
    seekIndicatorRight: { right: layout.spacing.xl3 },
    seekIndicatorContent: { flexDirection: "row", alignItems: "center", paddingVertical: layout.spacing.md, paddingHorizontal: layout.spacing.xlg, borderRadius: layout.radius.lg },
    header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
    headerGradient: { paddingTop: layout.spacing.xl3, paddingBottom: layout.spacing.lg },
    headerContent: { flexDirection: "row", alignItems: "center", paddingHorizontal: layout.s(25) },
    headerButton: { width: layout.sizing.touch, height: layout.sizing.touch, padding: layout.spacing.sm, alignItems: "center", justifyContent: "center", borderRadius: layout.s(22) },
    titleContainer: { flex: 1, marginHorizontal: layout.spacing.lg },
    headerButtons: { flexDirection: "row", alignItems: "center" },
    controlsContainer: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
    controlsGradient: { paddingHorizontal: layout.s(25), paddingTop: layout.s(30) },
    progressContainer: { flexDirection: "row", alignItems: "center" },
    progressBarContainer: { flex: 1, marginHorizontal: layout.spacing.sm, height: layout.sizing.sm, justifyContent: "center" },
    progressBarBackground: { height: 4, borderRadius: 2, position: "relative" },
    progressBarFill: { height: "100%", borderRadius: 2, position: "absolute" },
    mainControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: layout.spacing.lg },
    leftControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", flex: 1 },
    rightControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", flex: 1 },
    controlButton: { padding: layout.spacing.md, marginHorizontal: layout.spacing.xs, paddingHorizontal: layout.spacing.lg, paddingVertical: layout.spacing.xsm, borderRadius: layout.radius.lg },
    playControlGroup: { flexDirection: "row", alignItems: "center", justifyContent: "center", flex: 2 },
    seekButton: { alignItems: "center", justifyContent: "center", padding: layout.spacing.sm, marginHorizontal: layout.spacing.sm, minWidth: layout.s(40) },
    skipButton: { padding: layout.spacing.md, marginHorizontal: layout.spacing.lg },
    playButtonContainer: { marginHorizontal: layout.spacing.xlg },
    playButton: { width: layout.sizing.md, height: layout.sizing.md, borderRadius: layout.s(32), justifyContent: "center", alignItems: "center" },
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
      paddingVertical: layout.spacing.lg,
      paddingTop: layout.spacing.xl5,
      borderBottomWidth: 1,
    },
    episodesBackButton: { padding: layout.spacing.sm },
    episodeCount: { borderRadius: layout.radius.sm, paddingHorizontal: layout.spacing.sm, paddingVertical: layout.spacing.xs, borderWidth: 1 },
    episodesList: { flex: 1, paddingHorizontal: layout.spacing.lg },
    episodesOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
  };
};
