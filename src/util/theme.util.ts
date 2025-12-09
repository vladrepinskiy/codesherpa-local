import { DEFAULT_THEME, THEMES } from "../constants/theme.constants";
import type { Theme } from "../types/theme.types";
import { getFromLocalStorage } from "./localstorage.util";

export const getInitialTheme = (): Theme => {
  const storedKey = getFromLocalStorage<string>("theme");

  if (storedKey) {
    const theme = Object.values(THEMES).find(
      (theme) => theme.key === storedKey
    );
    if (theme) {
      return theme;
    }
  }

  // Check browser's theme preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return THEMES.DARK;
  }

  return DEFAULT_THEME;
};
