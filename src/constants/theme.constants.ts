import type { Theme } from "../types/theme.types";

const FONT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  xxl: "2rem",
};

export const LIGHT_THEME: Theme = {
  key: "light",
  icon: "🌞",
  palette: {
    bg: "#ffffff",
    text: "#1a1a1a",
    textMuted: "#808080",
    accent: "#f5a623",
    button: {
      bg: "#e5e5e5",
      hover: "#d0d0d0",
      active: "#b8b8b8",
      disabled: "#f0f0f0",
      text: "#1a1a1a",
      disabledText: "#a0a0a0",
    },
  },
  fontSizes: FONT_SIZES,
};

export const DARK_THEME: Theme = {
  key: "dark",
  icon: "🌙",
  palette: {
    bg: "#1a1a1a",
    text: "#f5f5f5",
    textMuted: "#999999",
    accent: "#ffbf69",
    button: {
      bg: "#2d2d2d",
      hover: "#3a3a3a",
      active: "#4a4a4a",
      disabled: "#252525",
      text: "#f5f5f5",
      disabledText: "#666666",
    },
  },
  fontSizes: FONT_SIZES,
};

export const THEMES = {
  LIGHT: LIGHT_THEME,
  DARK: DARK_THEME,
} as const;

export const DEFAULT_THEME: Theme = LIGHT_THEME;

export type ThemeKey = keyof typeof THEMES;
