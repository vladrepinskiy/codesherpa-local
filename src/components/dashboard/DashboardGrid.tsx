import { styled } from "goober";
import type { ReactNode } from "react";

type DashboardGridProps = {
  children: ReactNode;
};

export const DashboardGrid = ({ children }: DashboardGridProps) => {
  return <RepositoriesGrid>{children}</RepositoriesGrid>;
};

const RepositoriesGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;
