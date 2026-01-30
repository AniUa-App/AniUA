import { View, Text } from "react-native";
import React from "react";
import DefaultScreenWidget from "./../Widgets/DefaultScreenWidget";

export default function BookmarkTabsScreen({ tabType }) {
  return (
    <DefaultScreenWidget>
      <Text selectable={true}>BookmarkTabsScreen</Text>
    </DefaultScreenWidget>
  );
}
