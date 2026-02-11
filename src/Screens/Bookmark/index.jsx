import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import BookmarkPhone from "./BookmarkPhone";
import BookmarkTablet from "./BookmarkTablet";
import BookmarkTV from "./BookmarkTV";

export default function BookmarkScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
      return <BookmarkTV {...props} />;
    case "tablet":
      return <BookmarkTablet {...props} />;
    default:
      return <BookmarkPhone {...props} />;
  }
}
