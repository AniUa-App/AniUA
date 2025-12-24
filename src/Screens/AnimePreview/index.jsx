import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import AnimePreviewPhone from "./AnimePreviewPhone";
import AnimePreviewTablet from "./AnimePreviewTablet";
import AnimePreviewTV from "./AnimePreviewTV";

export default function AnimePreviewScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case 'tv':
      return <AnimePreviewTV {...props} />;
    case 'tablet':
      return <AnimePreviewTablet {...props} />;
    default:
      return <AnimePreviewPhone {...props} />;
  }
}
