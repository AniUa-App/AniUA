import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

export const Tab = createBottomTabNavigator();
export const HiddenStackNav = createNativeStackNavigator();
export const RootStack = createNativeStackNavigator();
export const TabBookmark = createMaterialTopTabNavigator();
export const BottomSheetNav = createNativeStackNavigator();
