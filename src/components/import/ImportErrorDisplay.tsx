import { ErrorDisplay } from "../core/ErrorDisplay";
import { styled } from "goober";
import type { ImportErrorDisplayProps } from "../../types/component.types";

export const ImportErrorDisplay = ({
  error,
  onReset,
}: ImportErrorDisplayProps) => {
  return (
    <ErrorDisplay
      title="Import Failed"
      icon="⚠️"
      actionLabel="Try Again"
      onAction={onReset}
    >
      <ErrorText>
        <strong>Error:</strong>
        <br />
        {error}
      </ErrorText>

      <HelpBox>
        <HelpTitle>Common issues:</HelpTitle>
        <HelpList>
          <li>Repository doesn't exist or is private</li>
          <li>Invalid repository URL format</li>
          <li>GitHub API rate limit exceeded (try adding a token)</li>
          <li>Network connection issues</li>
        </HelpList>
      </HelpBox>
    </ErrorDisplay>
  );
};

const ErrorText = styled("p")`
  margin: 0;
  font-size: 14px;
  color: #86181d;
`;

const HelpBox = styled("div")`
  padding: 15px;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  margin-top: 15px;
`;

const HelpTitle = styled("p")`
  margin: 0 0 10px 0;
  font-weight: 500;
`;

const HelpList = styled("ul")`
  margin: 0;
  padding-left: 20px;
`;
