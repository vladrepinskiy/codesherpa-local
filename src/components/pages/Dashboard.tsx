import { useEffect, useState } from "react";
import { styled } from "goober";
import { useLocation } from "wouter";
import { Page } from "../core/Page";
import { ImportModal } from "../import/ImportModal";
import { initDatabase } from "../../util/db.util";
import { getRepositories } from "../../util/db.util";
import { importDemoRepository } from "../../util/demo.util";
import { toShortId } from "../../util/id.util";
import { REPOSITORY_IMPORT_STATUS } from "../../constants/import.constants";
import type { Repository } from "../../types/db.types";

export const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
        await initDatabase();
        await importDemoRepository();
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
        <Title>Repositories</Title>
        <RepositoriesGrid>
          {repositories.map((repo) => (
            <RepositoryCard key={repo.id} onClick={() => handleRepoClick(repo)}>
              <RepositoryName>{repo.full_name}</RepositoryName>
              {repo.description && (
                <RepositoryDescription>
                  {repo.description}
                </RepositoryDescription>
              )}
              <RepositoryMeta>
                <MetaItem>Owner: {repo.owner}</MetaItem>
                {repo.default_branch && (
                  <MetaItem>Branch: {repo.default_branch}</MetaItem>
                )}
                <MetaItem>
                  Status:{" "}
                  <StatusBadge $status={repo.status}>{repo.status}</StatusBadge>
                </MetaItem>
                <MetaItem>
                  Imported: {new Date(repo.imported_at).toLocaleDateString()}
                </MetaItem>
              </RepositoryMeta>
            </RepositoryCard>
          ))}
          <ImportCard onClick={handleImportClick}>
            <ImportIcon>+</ImportIcon>
            <ImportText>Import Repository</ImportText>
          </ImportCard>
        </RepositoriesGrid>
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

const RepositoriesGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

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

const ImportCard = styled("div")`
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

const LoadingText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
