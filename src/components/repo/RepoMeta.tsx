import { styled } from "goober";
import type { Repository } from "../../types/db.types";

type RepoMetaProps = {
  repository: Repository;
};

export const RepoMeta = ({ repository }: RepoMetaProps) => {
  return (
    <MetaInfo>
      <MetaItem>Owner: {repository.owner}</MetaItem>
      {repository.default_branch && (
        <MetaItem>Branch: {repository.default_branch}</MetaItem>
      )}
      <MetaItem>
        Imported: {new Date(repository.imported_at).toLocaleDateString()}
      </MetaItem>
      <MetaItem>
        <ExternalLink
          href={repository.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub →
        </ExternalLink>
      </MetaItem>
    </MetaInfo>
  );
};

const MetaInfo = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const MetaItem = styled("span")`
  display: block;
`;

const ExternalLink = styled("a")`
  color: ${(props) => props.theme.palette.accent};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
