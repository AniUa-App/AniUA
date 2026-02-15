import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import ProfileScreenPhone from "./ProfileScreenPhone";
import ProfileScreenTablet from "./ProfileScreenTablet";
import ProfileScreenTV from "./ProfileScreenTV";

export default function ProfileScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <ProfileScreenTV {...props} />;
    case "tabletLandscape":
      return <ProfileScreenTablet {...props} />;
    case "tablet":
      return <ProfileScreenPhone {...props} />;
    default:
      return <ProfileScreenPhone {...props} />;
  }
}
