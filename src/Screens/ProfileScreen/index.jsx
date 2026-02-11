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
    case "tablet":
      return <ProfileScreenTablet {...props} />;
    default:
      return <ProfileScreenPhone {...props} />;
  }
}
