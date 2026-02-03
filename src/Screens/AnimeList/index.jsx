import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import AnimeListPhone from "./AnimeListPhone";
import AnimeListTablet from "./AnimeListTablet";

export default function AnimeListScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
    case "tablet":
      return <AnimeListTablet {...props} />;
    default:
      return <AnimeListPhone {...props} />;
  }
}
