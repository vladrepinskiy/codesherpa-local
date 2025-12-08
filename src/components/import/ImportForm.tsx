import { useState } from "react";
import { styled } from "goober";
import type { ImportFormProps } from "../../types/component.types";

export const ImportForm = ({ onImport, isImporting }: ImportFormProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onImport(repoUrl.trim(), token.trim() || undefined);
    }
  };

  return (
    <Container>
      <Title>GitHub Repository Importer</Title>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="repo-url">Repository URL</Label>
          <Input
            id="repo-url"
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            disabled={isImporting}
          />
          <HelpText>Enter the URL of a public GitHub repository</HelpText>
        </FormGroup>

        <FormGroup>
          <ToggleButton
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            disabled={isImporting}
          >
            {showTokenInput ? "− Hide" : "+ Add"} GitHub Personal Access Token
            (optional)
          </ToggleButton>

          {showTokenInput && (
            <TokenInputGroup>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                disabled={isImporting}
              />
              <TokenHelpText>
                Optional: Provide a token to increase rate limits (60 → 5000
                requests/hour). The token is only used in your browser and never
                sent anywhere else.
                <br />
                <TokenLink
                  href="https://github.com/settings/tokens/new?scopes=public_repo&description=CodeSherpa%20Local"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a token
                </TokenLink>
              </TokenHelpText>
            </TokenInputGroup>
          )}
        </FormGroup>

        <SubmitButton
          type="submit"
          disabled={isImporting || !repoUrl.trim()}
          $disabled={isImporting || !repoUrl.trim()}
        >
          {isImporting ? "Importing..." : "Import Repository"}
        </SubmitButton>
      </Form>

      <InfoBox>
        <InfoTitle>What will be imported?</InfoTitle>
        <InfoList>
          <li>Repository metadata (name, owner, description)</li>
          <li>All files in the repository (paths and metadata)</li>
          <li>Issues and Pull Requests</li>
          <li>Comments on issues and PRs</li>
        </InfoList>
        <InfoText>
          Data is stored locally in your browser's IndexedDB and persists across
          sessions.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled("h1")`
  margin-bottom: 20px;
  font-size: 2rem;
`;

const Form = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled("div")`
  /* Container for form groups */
`;

const Label = styled("label")`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled("input")`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const HelpText = styled("p")`
  font-size: 14px;
  color: #666;
  margin-top: 5px;
`;

const ToggleButton = styled("button")`
  background: none;
  border: none;
  color: #0969da;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  text-decoration: underline;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TokenInputGroup = styled("div")`
  margin-top: 10px;
`;

const TokenHelpText = styled("p")`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const TokenLink = styled("a")`
  color: #0969da;
`;

const SubmitButton = styled("button")<{ $disabled: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: ${(props) => (props.$disabled ? "#94d3a2" : "#2da44e")};
  border: none;
  border-radius: 6px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  margin-top: 10px;
`;

const InfoBox = styled("div")`
  margin-top: 30px;
  padding: 15px;
  background-color: #f6f8fa;
  border-radius: 6px;
`;

const InfoTitle = styled("h3")`
  margin-top: 0;
  font-size: 16px;
`;

const InfoList = styled("ul")`
  margin: 10px 0;
  padding-left: 20px;
  font-size: 14px;
`;

const InfoText = styled("p")`
  font-size: 14px;
  color: #666;
  margin: 10px 0 0 0;
`;
