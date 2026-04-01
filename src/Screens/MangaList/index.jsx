import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import MangaListPhone from "./MangaListPhone";

export default function MangaListScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <MangaListPhone {...props} />;
    case "tablet":
      return <MangaListPhone {...props} />;
    case "tabletLandscape":
      return <MangaListPhone {...props} />;
    default:
      return <MangaListPhone {...props} />;
  }
}
