import React from "react";
import Icon from "../../Styles/Icons";
import { MoonIcon, AshdiIcon } from "../../Styles/Icons";
import { Player } from "./types";

export const getPlayerInfo = (playerName: string, themeColors: any): Player => {
  switch (playerName) {
    case "moon":
      return {
        name: playerName,
        icon: <MoonIcon styles={{ width: 24, height: 24 }} />,
      };
    case "ashdi":
      return {
        name: playerName,
        icon: <AshdiIcon styles={{ width: 24, height: 24 }} />,
      };
    default:
      return {
        name: playerName,
        icon: <Icon.MonitorPlay size={24} color={themeColors.text} />,
      };
  }
};
