import { useAnimeListHStyles } from "./components/AnimeListHStyles";
import { useAnimeCardStyles } from "./components/AnimeCardStyles";
import { useAppRootStyles } from "./components/AppRootStyles";
import { useHomeStyles } from "./components/HomeStyles";
import { useTopNavigationStyles } from "./components/TopNavigationStyles";
import { useBigBannerStyles } from "./components/BigBannerStyles";

export const useAppStyles = () => ({
  animeListHorizontal: useAnimeListHStyles(),
  animeCard: useAnimeCardStyles(),
  app: useAppRootStyles(),
  home: useHomeStyles(),
  topNavigation: useTopNavigationStyles(),
  bigBanner: useBigBannerStyles(),
});
