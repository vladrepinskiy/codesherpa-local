import { styled } from "goober";
import { RepoMeta } from "./RepoMeta";
import type { Repository } from "../../types/db.types";

type RepoInfoProps = {
  repository: Repository;
};

export const RepoInfo = ({ repository }: RepoInfoProps) => {
  return (
    <InfoContainer>
      {repository.description && (
        <Description>{repository.description}</Description>
      )}
      <RepoMeta repository={repository} />
    </InfoContainer>
  );
};

const InfoContainer = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const Description = styled("p")`
  font-size: 1rem;
  line-height: 1.5;
  color: ${(props) => props.theme.palette.text};
  margin: 0 0 1rem 0;
`;
