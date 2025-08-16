import SettingsStorage from "../Storage/SettingsStorage";
import Color from "color";
import { EventBus } from "../Global/EventBus";

export const defaultColors = {
  black: "rgb(24, 28, 20)",
  black_1: "rgb(33, 37, 29)",
  white: "rgb(251, 252, 251)",
  appColor: "rgb(44, 124, 116)",
  loaderColor: "rgb(41, 91, 80)",
  yellow: "rgb(238, 201, 0)",
  gray: "rgb(96, 96, 96)",
  red: "rgb(124, 44, 44)",
};

function resolveColorsFromStorage() {
  const userConfig = SettingsStorage.getParameter("userConfig") || {};
  const isCustom = Boolean(userConfig?.colors?.isCustomisation);
  const userColors = userConfig?.colors || {};
  const merged = { ...defaultColors, ...userColors };
  return isCustom ? merged : defaultColors;
}

let current = resolveColorsFromStorage();

export let black = current.black ?? defaultColors.black;
export let black_1 = current.black_1 ?? defaultColors.black_1;
export let appColor = current.appColor ?? defaultColors.appColor;
export let white = current.white ?? defaultColors.white;
export let loaderColor = current.loaderColor ?? defaultColors.loaderColor;
export let yellow = current.yellow ?? defaultColors.yellow;
export let gray = current.gray ?? defaultColors.gray;
export let red = current.red ?? defaultColors.red;

function refreshExportedColors() {
  current = resolveColorsFromStorage();
  black = current.black ?? defaultColors.black;
  black_1 = current.black_1 ?? defaultColors.black_1;
  appColor = current.appColor ?? defaultColors.appColor;
  white = current.white ?? defaultColors.white;
  loaderColor = current.loaderColor ?? defaultColors.loaderColor;
  yellow = current.yellow ?? defaultColors.yellow;
  gray = current.gray ?? defaultColors.gray;
  red = current.red ?? defaultColors.red;
}

// Підписуємось на зміни конфігурації, щоб оновлювати експортовані значення на льоту
EventBus.on("userConfig", refreshExportedColors);

function toRgbaString(hexOrRgb, opacity) {
  const c = Color(hexOrRgb);
  return `rgba(${c.red()}, ${c.green()}, ${c.blue()}, ${opacity})`;
}

export function Black(opacity = 1) {
  return toRgbaString(black, opacity);
}

export function Black_1(opacity = 1) {
  return toRgbaString(black_1, opacity);
}

export function White(opacity = 1) {
  return toRgbaString(white, opacity);
}

export function AppColor(opacity = 1) {
  return toRgbaString(appColor, opacity);
}

export function Gray(opacity = 1) {
  return toRgbaString(gray, opacity);
}

defaultColors.Black = Black;
defaultColors.Black_1 = Black_1;
defaultColors.White = White;
defaultColors.AppColor = AppColor;
defaultColors.Gray = Gray;
