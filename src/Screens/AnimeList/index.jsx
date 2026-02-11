import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import AnimeListPhone from "./AnimeListPhone";
import AnimeListTablet from "./AnimeListTablet";
import AnimeListTV from "./AnimeListTV";

export default function AnimeListScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <AnimeListTV {...props} />;
    case "tablet":
      return <AnimeListTablet {...props} />;
    default:
      return <AnimeListPhone {...props} />;
  }
}
