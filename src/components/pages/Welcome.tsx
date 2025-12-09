import { styled } from "goober";
import { useLocation } from "wouter";
import { Page } from "../core/Page";

export const Welcome = () => {
  const [, setLocation] = useLocation();

  const handleGoToImport = () => {
    setLocation("/import");
  };

  const handleGoToChat = () => {
    setLocation("/chat");
  };

  return (
    <Page>
      <WelcomeContainer>
        <Title>Welcome to CodeSherpa Local</Title>
        <Description>
          CodeSherpa Local is a client-side GitHub repository importer that
          fetches repository data (files, issues, PRs, comments) via GitHub API
          and stores it in a PGLite database persisted to IndexedDB. Explore
          your repository data locally with our interactive SQL terminal.
        </Description>
        <ButtonContainer>
          <Button onClick={handleGoToImport}>Import Repository</Button>
          <Button onClick={handleGoToChat}>Go to Chat</Button>
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
`;

const Description = styled("p")`
  font-size: 1.125rem;
  line-height: 1.75;
  color: #4b5563;
  text-align: center;
  max-width: 600px;
  margin: 0;
`;

const ButtonContainer = styled("div")`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled("button")`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:active {
    background-color: #1d4ed8;
  }
`;
