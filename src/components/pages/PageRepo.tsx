import { styled } from "goober";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useChats } from "../../hooks/useChats";
import { useRepo } from "../../hooks/useRepo";
import type { Chat, ImportStats } from "../../types/db.types";
import { getRepositories } from "../../util/db.util";
import { toShortId } from "../../util/id.util";
import { Page } from "../core/Page";
import { RepoChats } from "../repo/RepoChats";
import { RepoInfo } from "../repo/RepoInfo";
import { RepoStats } from "../repo/RepoStats";

export const PageRepo = () => {
  const params = useParams<{ repoShortId: string }>();
  const [_location, setLocation] = useLocation();
  const { getRepositoryByShortId } = useRepo();
  const { getChatsByRepoId } = useChats();

  const [stats, setStats] = useState<ImportStats | null>(null);

  const repository = params.repoShortId
    ? getRepositoryByShortId(params.repoShortId)
    : undefined;

  const chats = repository ? getChatsByRepoId(repository.id) : [];

  // todo: put stats on the repo object and load directly
  useEffect(() => {
    const loadStats = async () => {
      if (!repository) return;

      const { repositoriesRepository } = getRepositories();
      const repoStats = await repositoriesRepository.getImportStats(
        repository.id
      );
      setStats(repoStats);
    };

    loadStats();
  }, [repository?.id]);

  const handleNewChat = () => {
    if (repository) {
      setLocation(`/repo/${params.repoShortId}/chat`);
    }
  };

  const handleChatClick = (chat: Chat) => {
    if (repository && chat.id) {
      setLocation(`/repo/${params.repoShortId}/chat/${toShortId(chat.id)}`);
    }
  };

  if (!repository) {
    return (
      <Page>
        <ErrorText>Repository not found</ErrorText>
      </Page>
    );
  }

  return (
    <Page>
      <RepoContainer>
        <Title>Repo Details</Title>

        <RepoInfo repository={repository} />

        {stats && <RepoStats stats={stats} />}

        <RepoChats
          chats={chats}
          onNewChat={handleNewChat}
          onChatClick={handleChatClick}
        />
      </RepoContainer>
    </Page>
  );
};

const RepoContainer = styled("div")`
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

const ErrorText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
