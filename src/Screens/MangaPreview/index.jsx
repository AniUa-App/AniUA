import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import MangaPreviewPhone from "./MangaPreviewPhone";

export default function MangaPreviewScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <MangaPreviewPhone {...props} />;
    case "tablet":
      return <MangaPreviewPhone {...props} />;
    case "tabletLandscape":
      return <MangaPreviewPhone {...props} />;
    default:
      return <MangaPreviewPhone {...props} />;
  }
}
