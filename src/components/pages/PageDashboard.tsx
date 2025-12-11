import { useEffect, useState } from "react";
import { styled } from "goober";
import { useLocation } from "wouter";
import { Page } from "../core/Page";
import { ImportModal } from "../import/ImportModal";
import { DashboardCard } from "../dashboard/DashboardCard";
import { DashboardGrid } from "../dashboard/DashboardGrid";
import { DashboardImportCard } from "../dashboard/DashboardImportCard";
import { getRepositories } from "../../util/db.util";
import { toShortId } from "../../util/id.util";
import type { Repository } from "../../types/db.types";

export const PageDashboard = () => {
  const [_location, setLocation] = useLocation();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // todo: new data flow with live queries from providers to components
  const loadRepositories = async () => {
    const { repositoriesRepository } = getRepositories();
    const repos = await repositoriesRepository.getAllRepositories();
    setRepositories(repos);
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = async () => {
    await loadRepositories();
  };

  const handleModalClose = () => {
    setIsImportModalOpen(false);
    loadRepositories();
  };

  const handleRepoClick = (repo: Repository) => {
    setLocation(`/repo/${toShortId(repo.id)}`);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadRepositories();
      } catch (error) {
        console.error("Failed to load repositories:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <Page>
        <LoadingText>Loading repositories...</LoadingText>
      </Page>
    );
  }

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
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={handleModalClose}
        onImportSuccess={handleImportSuccess}
      />
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

const LoadingText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
