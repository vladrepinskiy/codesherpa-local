import { styled } from "goober";
import { REPOSITORY_IMPORT_STATUS } from "../../constants/import.constants";
import type { Repository } from "../../types/db.types";

type DashboardCardProps = {
  repository: Repository;
  onClick: () => void;
};

export const DashboardCard = ({ repository, onClick }: DashboardCardProps) => {
  return (
    <RepositoryCard onClick={onClick}>
      <RepositoryName>{repository.full_name}</RepositoryName>
      {repository.description && (
        <RepositoryDescription>{repository.description}</RepositoryDescription>
      )}
      <RepositoryMeta>
        <MetaItem>Owner: {repository.owner}</MetaItem>
        {repository.default_branch && (
          <MetaItem>Branch: {repository.default_branch}</MetaItem>
        )}
        <MetaItem>
          Status:{" "}
          <StatusBadge $status={repository.status}>
            {repository.status}
          </StatusBadge>
        </MetaItem>
        <MetaItem>
          Imported: {new Date(repository.imported_at).toLocaleDateString()}
        </MetaItem>
      </RepositoryMeta>
    </RepositoryCard>
  );
};

const RepositoryCard = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: 0.9;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.palette.accent};
    transform: translateY(-2px);
    opacity: 1;
  }
`;

const RepositoryName = styled("h2")`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.palette.text};
`;

const RepositoryDescription = styled("p")`
  font-size: 0.875rem;
  line-height: 1.5;
  color: ${(props) => props.theme.palette.textMuted};
  margin: 0;
  flex: 1;
`;

const RepositoryMeta = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const MetaItem = styled("span")`
  display: block;
`;

const StatusBadge = styled("span")<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${(props) => {
    switch (props.$status) {
      case REPOSITORY_IMPORT_STATUS.COMPLETE:
        return props.theme.palette.accent + "20";
      case REPOSITORY_IMPORT_STATUS.IMPORTING:
        return "#fbbf24" + "20";
      case REPOSITORY_IMPORT_STATUS.ERROR:
        return "#ef4444" + "20";
      default:
        return props.theme.palette.textMuted + "20";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case REPOSITORY_IMPORT_STATUS.COMPLETE:
        return props.theme.palette.accent;
      case REPOSITORY_IMPORT_STATUS.IMPORTING:
        return "#fbbf24";
      case REPOSITORY_IMPORT_STATUS.ERROR:
        return "#ef4444";
      default:
        return props.theme.palette.textMuted;
    }
  }};
`;
