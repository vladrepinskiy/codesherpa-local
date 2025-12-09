import { createContext, useState, type ReactNode } from "react";
import {
  DEFAULT_THEME,
  THEMES,
  type ThemeKey,
} from "../constants/theme.constants";
import type { Theme } from "../types/theme.types";
import { setToLocalStorage } from "../util/localstorage.util";
import { getInitialTheme } from "../util/theme.util";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  const toggleTheme = () => {
    const themeEntries = Object.entries(THEMES) as [ThemeKey, Theme][];
    const currentIndex = themeEntries.findIndex(([, t]) => t === theme);
    const nextIndex = (currentIndex + 1) % themeEntries.length;
    const nextEntry = themeEntries[nextIndex];

    if (nextEntry) {
      const [, newTheme] = nextEntry;
      setTheme(newTheme);
      setToLocalStorage("theme", newTheme.key);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
