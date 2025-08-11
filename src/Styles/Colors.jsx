import SettingsStorage from "../Storage/SettingsStorage";
import Color from "color";

const defaultColors = {
  black: "rgb(24, 28, 20)",
  black_1: "rgb(33, 37, 29)",
  white: "rgb(251, 252, 251)",
  appColor: "rgb(44, 124, 116)",
  loaderColor: "rgb(41, 91, 80)",
  yellow: "rgb(238, 201, 0)",
  gray: "rgb(96, 96, 96)",
};

const USER_CONFIG = SettingsStorage.getParameter("userConfig") || {};
const isCustomisation = USER_CONFIG?.colors?.isCustomisation || false;
// Мерджимо користувацькі кольори з дефолтними, щоб уникнути undefined
const userColors = USER_CONFIG?.colors || {};
const mergedColors = { ...defaultColors, ...userColors };
const colors = isCustomisation ? mergedColors : defaultColors;

export const black = colors.black ?? defaultColors.black;
export const black_1 = colors.black_1 ?? defaultColors.black_1;
export const appColor = colors.appColor ?? defaultColors.appColor;
export const white = colors.white ?? defaultColors.white;
export const loaderColor = colors.loaderColor ?? defaultColors.loaderColor;
export const yellow = colors.yellow ?? defaultColors.yellow;
export const gray = colors.gray ?? defaultColors.gray;

const _black = Color(black);
const _black_1 = Color(black_1);
const _white = Color(white);
const _appColor = Color(appColor);
const _loaderColor = Color(loaderColor);
const _yellow = Color(yellow);
const _gray = Color(gray);

export function Black(opacity = 1) {
  return `rgba(${_black.red()}, ${_black.green()}, ${_black.blue()}, ${opacity})`;
}

export function Black_1(opacity = 1) {
  return `rgba(${_black_1.red()}, ${_black_1.green()}, ${_black_1.blue()}, ${opacity})`;
}

export function White(opacity = 1) {
  return `rgba(${_white.red()}, ${_white.green()}, ${_white.blue()}, ${opacity})`;
}

export function AppColor(opacity = 1) {
  return `rgba(${_appColor.red()}, ${_appColor.green()}, ${_appColor.blue()}, ${opacity})`;
}

export function Gray(opacity = 1) {
  return `rgba(${_gray.red()}, ${_gray.green()}, ${_gray.blue()}, ${opacity})`;
}

defaultColors.Black = Black;
defaultColors.Black_1 = Black_1;
defaultColors.White = White;
defaultColors.AppColor = AppColor;
defaultColors.Gray = Gray;
