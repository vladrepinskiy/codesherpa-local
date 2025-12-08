import { styled } from "goober";
import type { ImportStatsProps } from "../../types/component.types";

export const ImportStats = ({ stats, repoName, onReset }: ImportStatsProps) => {
  return (
    <Container>
      <Header>
        <SuccessIcon>✓</SuccessIcon>
        <SuccessTitle>Import Successful!</SuccessTitle>
        {repoName && (
          <RepoName>
            Repository: <strong>{repoName}</strong>
          </RepoName>
        )}
      </Header>

      <StatsGrid>
        <StatCard
          label="Files"
          value={stats.filesCount}
          icon="📄"
          color="#0969da"
        />
        <StatCard
          label="Issues"
          value={stats.issuesCount}
          icon="🐛"
          color="#d73a4a"
        />
        <StatCard
          label="Pull Requests"
          value={stats.pullRequestsCount}
          icon="🔀"
          color="#8250df"
        />
        <StatCard
          label="Comments"
          value={stats.commentsCount}
          icon="💬"
          color="#59636e"
        />
      </StatsGrid>

      <SuccessBox>
        <SuccessText>
          <strong>✓ Data saved locally</strong>
          <br />
          Your repository data is stored in your browser's IndexedDB and will
          persist across sessions.
        </SuccessText>
      </SuccessBox>

      <ResetButton onClick={onReset}>Import Another Repository</ResetButton>
    </Container>
  );
};

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) => {
  return (
    <StatCardContainer>
      <StatIcon>{icon}</StatIcon>
      <StatValue $color={color}>{value.toLocaleString()}</StatValue>
      <StatLabel>{label}</StatLabel>
    </StatCardContainer>
  );
};

const Container = styled("div")`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
`;

const Header = styled("div")`
  text-align: center;
  margin-bottom: 30px;
`;

const SuccessIcon = styled("div")`
  font-size: 48px;
  margin-bottom: 10px;
`;

const SuccessTitle = styled("h2")`
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #2da44e;
`;

const RepoName = styled("p")`
  margin: 0;
  font-size: 16px;
  color: #666;
`;

const StatsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCardContainer = styled("div")`
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #d0d7de;
`;

const StatIcon = styled("div")`
  font-size: 24px;
  margin-bottom: 8px;
`;

const StatValue = styled("div")<{ $color: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.$color};
  margin-bottom: 4px;
`;

const StatLabel = styled("div")`
  font-size: 14px;
  color: #59636e;
`;

const SuccessBox = styled("div")`
  padding: 15px;
  background-color: #dff6dd;
  border: 1px solid #2da44e;
  border-radius: 6px;
  margin-bottom: 20px;
`;

const SuccessText = styled("p")`
  margin: 0;
  font-size: 14px;
  color: #0f5323;
`;

const ResetButton = styled("button")`
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #24292f;
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  cursor: pointer;
`;
