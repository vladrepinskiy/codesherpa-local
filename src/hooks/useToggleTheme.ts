import { useContext } from "react";
import { ThemeContext } from "../context/theme.provider";

export const useToggleTheme = () => {
  const { toggleTheme } = useContext(ThemeContext);

  if (!toggleTheme) {
    throw new Error("useToggleTheme must be used within a ThemeProvider");
  }

  return toggleTheme;
};
