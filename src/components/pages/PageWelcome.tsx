import { styled } from "goober";
import { useLocation } from "wouter";
import { Button } from "../core/Button";
import { Page } from "../core/Page";

export const PageWelcome = () => {
  const [_location, setLocation] = useLocation();

  const handleGoToDashboard = () => {
    setLocation("/");
  };

  return (
    <Page>
      <WelcomeContainer>
        <Title>Welcome to CodeSherpa Local</Title>
        <Description>
          CodeSherpa Local is a client-side GitHub repository importer that
          fetches repository data (files, issues, PRs, comments) via GitHub API
          and stores it in a PGLite database persisted to IndexedDB.
        </Description>
        <Description>Proper walkthrough TBA soon 🚀</Description>
        <ButtonContainer>
          <Button onClick={handleGoToDashboard}>Continue to Dashboard</Button>
        </ButtonContainer>
      </WelcomeContainer>
    </Page>
  );
};

const WelcomeContainer = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const Title = styled("h1")`
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  color: ${(props) => props.theme.palette.text};
`;

const Description = styled("p")`
  font-size: 1.125rem;
  line-height: 1.75;
  color: ${(props) => props.theme.palette.textMuted};
  text-align: center;
  max-width: 600px;
  margin: 0;
`;

const ButtonContainer = styled("div")`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;
