import React from "react";
import { useDeviceType } from "../../Styles/Responsive";
import BookmarkPhone from "./BookmarkPhone";
import BookmarkTablet from "./BookmarkTablet";

export default function BookmarkScreen(props) {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case "tv":
    case "tablet":
      return <BookmarkTablet {...props} />;
    default:
      return <BookmarkPhone {...props} />;
  }
}
