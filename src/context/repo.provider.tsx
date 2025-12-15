import { createContext, type ReactNode } from "react";
import { useLiveQuery } from "@electric-sql/pglite-react";
import type { Repository, InsertRepository } from "../types/db.types";
import { REPOSITORIES_QUERY } from "../lib/db/repositories/repo.repository";
import { getRepositories } from "../util/db.util";

type RepoContextType = {
  repositories: Repository[];
  getRepositoryById: (id: string) => Repository | undefined;
  getRepositoryByShortId: (shortId: string) => Repository | undefined;
  addRepository: (data: InsertRepository) => Promise<void>;
  deleteRepository: (id: string) => Promise<void>;
  updateRepositoryStatus: (id: string, status: string) => Promise<void>;
};

const defaultRepoContext: RepoContextType = {
  repositories: [],
  getRepositoryById: () => undefined,
  getRepositoryByShortId: () => undefined,
  addRepository: async () => {},
  deleteRepository: async () => {},
  updateRepositoryStatus: async () => {},
};

export const RepoContext = createContext<RepoContextType>(defaultRepoContext);

export const RepoProvider = ({ children }: { children: ReactNode }) => {
  const result = useLiveQuery<Repository>(REPOSITORIES_QUERY);

  const repositories = (result?.rows as Repository[]) ?? [];

  const getRepositoryById = (id: string) => {
    return repositories.find((repo) => repo.id === id);
  };

  const getRepositoryByShortId = (shortId: string) => {
    return repositories.find((repo) => repo.id.startsWith(shortId));
  };

  const addRepository = async (data: InsertRepository) => {
    const { repositoriesRepository } = getRepositories();
    await repositoriesRepository.insertRepository(data);
  };

  const deleteRepository = async (id: string) => {
    const { repositoriesRepository } = getRepositories();
    await repositoriesRepository.deleteById(id);
  };

  const updateRepositoryStatus = async (id: string, status: string) => {
    const { repositoriesRepository } = getRepositories();
    await repositoriesRepository.updateStatus(id, status);
  };

  return (
    <RepoContext.Provider
      value={{
        repositories,
        getRepositoryById,
        getRepositoryByShortId,
        addRepository,
        deleteRepository,
        updateRepositoryStatus,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};
