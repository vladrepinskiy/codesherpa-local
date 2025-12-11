import { styled } from "goober";
import { useLocation } from "wouter";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "./Button";
import { ThemeToggle } from "./ThemeToggle";

export const Topbar = () => {
  const [location, setLocation] = useLocation();

  const handleBack = () => {
    if (location === "/") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };

  const showBackButton = location !== "/" && location !== "/welcome";

  return (
    <TopbarContainer>
      <BackButtonContainer>
        {showBackButton && <BackButton onClick={handleBack}>← Back</BackButton>}
      </BackButtonContainer>
      <Breadcrumbs />
      <ThemeToggleWrapper>
        <ThemeToggle />
      </ThemeToggleWrapper>
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
  padding: 0 1rem;
  background-color: ${(props) => props.theme.palette.bg};
  border-bottom: 1px solid ${(props) => props.theme.palette.textMuted};
  z-index: 1000;
`;

const BackButtonContainer = styled("div")`
  flex-shrink: 0;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
`;

const BackButton = styled(Button)`
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  width: fit-content;
  height: fit-content;
  min-height: unset;
  flex-shrink: 0;
  line-height: 1.2;
`;

const ThemeToggleWrapper = styled("div")`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
