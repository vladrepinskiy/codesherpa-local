import { styled } from "goober";
import { Breadcrumbs } from "./Breadcrumbs";
import { ThemeToggle } from "./ThemeToggle";

export const Topbar = () => {
  return (
    <TopbarContainer>
      <TopbarContent>
        <Breadcrumbs />
        <ThemeToggleWrapper>
          <ThemeToggle />
        </ThemeToggleWrapper>
      </TopbarContent>
    </TopbarContainer>
  );
};

const TopbarContainer = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0;
  background-color: ${(props) => props.theme.palette.bg};
  border-bottom: 1px solid ${(props) => props.theme.palette.textMuted};
  z-index: 1000;
`;

const TopbarContent = styled("div")`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 2rem;
  height: 100%;
`;

const ThemeToggleWrapper = styled("div")`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
