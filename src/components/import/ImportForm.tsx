import { useState } from "react";
import { styled } from "goober";
import { Button } from "../core/Button";
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

        <Button type="submit" disabled={isImporting || !repoUrl.trim()}>
          {isImporting ? "Importing..." : "Import Repository"}
        </Button>
      </Form>
    </Container>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: ${(props) => props.theme.palette.bg};
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
  color: ${(props) => props.theme.palette.text};
`;

const Input = styled("input")`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid ${(props) => props.theme.palette.text};
  border-radius: 4px;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.palette.bg};
  color: ${(props) => props.theme.palette.text};
`;

const HelpText = styled("p")`
  font-size: 14px;
  color: ${(props) => props.theme.palette.textMuted};
  margin-top: 5px;
`;

const ToggleButton = styled("button")`
  background: none;
  border: none;
  color: ${(props) => props.theme.palette.accent};
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
  color: ${(props) => props.theme.palette.textMuted};
  margin-top: 5px;
`;

const TokenLink = styled("a")`
  color: ${(props) => props.theme.palette.accent};
`;
