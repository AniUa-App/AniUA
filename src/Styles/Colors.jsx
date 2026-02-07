import SettingsStorage from "../Storage/SettingsStorage";
import Color from "color";
import { EventBus } from "../Global/EventBus";

export const orange_whiteThemeColors = {
  background: "#F4F2EF",
  primary: "#C55E53",
  subtle: "#D9D9D9",
  accent: "#FFFFFF",
  text: "#000000",
  icon: "#000000",
  yellow: "rgb(238, 201, 0)",
  inActiveText: "rgb(96, 96, 96)",
  activeIcon: "#C55E53",
  inActiveIcon: "rgb(96, 96, 96)",
  withoutBookmark: "rgb(124, 44, 44)",
  redBookmark: "rgb(124, 44, 44)",
  orangeBookmark: "rgb(179, 81, 7)",
  yellowBookmark: "rgb(199, 167, 91)",
  blueBookmark: "rgb(70, 130, 180)",
};
export const orange_darkThemeColors = {
  background: "#181818",
  primary: "#C55E53",
  subtle: "#252525",
  accent: "#252525",
  text: "#FFFFFF",
  icon: "#FFFFFF",
  yellow: "rgb(238, 201, 0)",
  inActiveText: "rgb(96, 96, 96)",
  activeIcon: "#C55E53",
  inActiveIcon: "#252525",
  withoutBookmark: "rgb(124, 44, 44)",
  redBookmark: "rgb(124, 44, 44)",
  orangeBookmark: "rgb(179, 81, 7)",
  yellowBookmark: "rgb(199, 167, 91)",
  blueBookmark: "rgb(70, 130, 180)",
  pinkBookmark: "rgb(199, 91, 138)",
};

export const greenApple_blackThemeColors = {
  background: "rgb(24, 28, 20)",
  primary: "rgb(44, 124, 116)",
  subtle: "rgb(33, 37, 29)",
  accent: "rgb(33, 37, 29)",
  text: "#FFFFFF",
  icon: "#FFFFFF",
  yellow: "rgb(238, 201, 0)",
  inActiveText: "rgb(96, 96, 96)",
  activeIcon: "rgb(44, 124, 116)",
  inActiveIcon: "rgb(33, 37, 29)",
  withoutBookmark: "rgb(96, 96, 96)",
  redBookmark: "rgb(124, 44, 44)",
  orangeBookmark: "rgb(179, 81, 7)",
  yellowBookmark: "rgb(199, 167, 91)",
  blueBookmark: "rgb(70, 130, 180)",
  pinkBookmark: "rgb(199, 91, 138)",
};

export const themes = {
  greenApple: greenApple_blackThemeColors,
  orange_white: orange_whiteThemeColors,
  orange_dark: orange_darkThemeColors,
};

// defaultColors тепер є alias на greenApple тему
export const defaultColors = greenApple_blackThemeColors;

function resolveColorsFromStorage() {
  try {
    const userConfig = SettingsStorage.getParameter("userConfig") || {};
    const isCustom = Boolean(userConfig?.colors?.isCustomisation);
    const userColors = userConfig?.colors || {};
    const merged = { ...defaultColors, ...userColors };
    return isCustom ? merged : defaultColors;
  } catch (e) {
    // Fallback to defaults if storage not ready
    return defaultColors;
  }
}

// Ініціалізуємо з defaultColors щоб уникнути проблем з циклічними залежностями
export let background = defaultColors.background;
export let subtle = defaultColors.subtle;
export let accent = defaultColors.accent;
export let primary = defaultColors.primary;
export let text = defaultColors.text;
export let yellow = defaultColors.yellow;
export let inActiveText = defaultColors.inActiveText;
export let inActiveIcon = defaultColors.inActiveIcon;
export let activeIcon = defaultColors.activeIcon;
export let withoutBookmark = defaultColors.withoutBookmark;
export let redBookmark = defaultColors.redBookmark;
export let orangeBookmark = defaultColors.orangeBookmark;
export let yellowBookmark = defaultColors.yellowBookmark;
export let blueBookmark = defaultColors.blueBookmark;
export let pinkBookmark = defaultColors.pinkBookmark;

// Відкладаємо завантаження з storage після ініціалізації модуля
setTimeout(() => {
  const current = resolveColorsFromStorage();
  if (current) {
    background = current.background ?? defaultColors.background;
    subtle = current.subtle ?? defaultColors.subtle;
    accent = current.accent ?? defaultColors.accent;
    primary = current.primary ?? defaultColors.primary;
    text = current.text ?? defaultColors.text;
    yellow = current.yellow ?? defaultColors.yellow;
    inActiveText = current.inActiveText ?? defaultColors.inActiveText;
    inActiveIcon = current.inActiveIcon ?? defaultColors.inActiveIcon;
    activeIcon = current.activeIcon ?? defaultColors.activeIcon;
    redBookmark = current.redBookmark ?? defaultColors.redBookmark;
    orangeBookmark = current.orangeBookmark ?? defaultColors.orangeBookmark;
    yellowBookmark = current.yellowBookmark ?? defaultColors.yellowBookmark;
    blueBookmark = current.blueBookmark ?? defaultColors.blueBookmark;
    pinkBookmark = current.pinkBookmark ?? defaultColors.pinkBookmark;
  }
}, 0);

function refreshExportedColors() {
  const current = resolveColorsFromStorage();
  background = current.background ?? defaultColors.background;
  subtle = current.subtle ?? defaultColors.subtle;
  accent = current.accent ?? defaultColors.accent;
  primary = current.primary ?? defaultColors.primary;
  text = current.text ?? defaultColors.text;
  yellow = current.yellow ?? defaultColors.yellow;
  inActiveText = current.inActiveText ?? defaultColors.inActiveText;
  inActiveIcon = current.inActiveIcon ?? defaultColors.inActiveIcon;
  activeIcon = current.activeIcon ?? defaultColors.activeIcon;
  withoutBookmark = current.withoutBookmark ?? defaultColors.withoutBookmark;
  redBookmark = current.redBookmark ?? defaultColors.redBookmark;
  orangeBookmark = current.orangeBookmark ?? defaultColors.orangeBookmark;
  yellowBookmark = current.yellowBookmark ?? defaultColors.yellowBookmark;
  blueBookmark = current.blueBookmark ?? defaultColors.blueBookmark;
  pinkBookmark = current.pinkBookmark ?? defaultColors.pinkBookmark;
}

// Підписуємось на зміни конфігурації, щоб оновлювати експортовані значення на льоту
// Відкладаємо підписку щоб уникнути проблем з циклічними залежностями при ініціалізації
setTimeout(() => {
  EventBus.on("userConfig", refreshExportedColors);
}, 0);

function toRgbaString(hexOrRgb, opacity) {
  const c = Color(hexOrRgb);
  return `rgba(${c.red()}, ${c.green()}, ${c.blue()}, ${opacity})`;
}

export function Background(opacity = 1) {
  return toRgbaString(background, opacity);
}

export function Subtle(opacity = 1) {
  return toRgbaString(subtle, opacity);
}

export function Text(opacity = 1) {
  return toRgbaString(text, opacity);
}

export function Icon(opacity = 1) {
  return toRgbaString(icon, opacity);
}

export function Primary(opacity = 1) {
  return toRgbaString(primary, opacity);
}
export function Accent(opacity = 1) {
  return toRgbaString(accent, opacity);
}

export function InActiveText(opacity = 1) {
  return toRgbaString(inActiveText, opacity);
}
