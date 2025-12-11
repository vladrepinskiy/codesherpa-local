import { styled } from "goober";

type DashboardImportCardProps = {
  onClick: () => void;
};

export const DashboardImportCard = ({ onClick }: DashboardImportCardProps) => {
  return (
    <Card onClick={onClick}>
      <ImportIcon>+</ImportIcon>
      <ImportText>Import Repository</ImportText>
    </Card>
  );
};

const Card = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 2px dashed ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 200px;
  opacity: 0.7;

  &:hover {
    border-color: ${(props) => props.theme.palette.accent};
    opacity: 1;
  }
`;

const ImportIcon = styled("div")`
  font-size: 3rem;
  font-weight: 300;
  color: ${(props) => props.theme.palette.textMuted};
`;

const ImportText = styled("span")`
  font-size: 1rem;
  font-weight: 500;
  color: ${(props) => props.theme.palette.text};
`;
