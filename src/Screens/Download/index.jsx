import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import DownloadPhone from "./DownloadPhone";
import DownloadTablet from "./DownloadTablet";
import DownloadTV from "./DownloadTV";

export default function DownloadScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <DownloadTV {...props} />;
    case "tablet":
      return <DownloadTablet {...props} />;
    default:
      return <DownloadPhone {...props} />;
  }
}
