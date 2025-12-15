import { useState } from "react";
import { styled } from "goober";
import { useLocation } from "wouter";
import { Page } from "../core/Page";
import { ImportModal } from "../import/ImportModal";
import { DashboardCard } from "../dashboard/DashboardCard";
import { DashboardGrid } from "../dashboard/DashboardGrid";
import { DashboardImportCard } from "../dashboard/DashboardImportCard";
import { useRepo } from "../../hooks/useRepo";
import { toShortId } from "../../util/id.util";
import type { Repository } from "../../types/db.types";

export const PageDashboard = () => {
  const [_location, setLocation] = useLocation();
  const { repositories } = useRepo();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleModalClose = () => {
    setIsImportModalOpen(false);
  };

  const handleRepoClick = (repo: Repository) => {
    setLocation(`/repo/${toShortId(repo.id)}`);
  };

  return (
    <Page>
      <DashboardContainer>
        <Title>Explore</Title>
        <DashboardGrid>
          {repositories.map((repo) => (
            <DashboardCard
              key={repo.id}
              repository={repo}
              onClick={() => handleRepoClick(repo)}
            />
          ))}
          <DashboardImportCard onClick={handleImportClick} />
        </DashboardGrid>
      </DashboardContainer>
      <ImportModal isOpen={isImportModalOpen} onClose={handleModalClose} />
    </Page>
  );
};

const DashboardContainer = styled("div")`
  width: 100%;
  max-width: 1200px;
  padding: 2rem;
  overflow-y: auto;
`;

const Title = styled("h1")`
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  color: ${(props) => props.theme.palette.text};
`;
