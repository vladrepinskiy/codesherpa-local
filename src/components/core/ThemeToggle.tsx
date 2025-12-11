import { styled } from "goober";
import { useTheme } from "../../hooks/useTheme";
import { useToggleTheme } from "../../hooks/useToggleTheme";

export const ThemeToggle = () => {
  const theme = useTheme();
  const toggleTheme = useToggleTheme();

  return (
    <ToggleButton onClick={toggleTheme} type="button" aria-label="Toggle theme">
      {theme.icon}
    </ToggleButton>
  );
};

const ToggleButton = styled("button")`
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: blur(2px);
  }
`;
