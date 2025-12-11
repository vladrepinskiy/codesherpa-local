import { styled } from "goober";
import type { ImportStats } from "../../types/db.types";

type RepoStatsProps = {
  stats: ImportStats;
};

export const RepoStats = ({ stats }: RepoStatsProps) => {
  return (
    <StatsSection>
      <StatsTitle>Import Statistics</StatsTitle>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.filesCount}</StatValue>
          <StatLabel>Files</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.issuesCount}</StatValue>
          <StatLabel>Issues</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.pullRequestsCount}</StatValue>
          <StatLabel>Pull Requests</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.commentsCount}</StatValue>
          <StatLabel>Comments</StatLabel>
        </StatCard>
      </StatsGrid>
    </StatsSection>
  );
};

const StatsSection = styled("div")`
  margin-bottom: 2rem;
`;

const StatsTitle = styled("h2")`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${(props) => props.theme.palette.text};
`;

const StatsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatCard = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled("div")`
  font-size: 2rem;
  font-weight: 600;
  color: ${(props) => props.theme.palette.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled("div")`
  font-size: 0.875rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
