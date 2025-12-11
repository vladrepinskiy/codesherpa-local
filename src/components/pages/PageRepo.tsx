import { useEffect, useState } from "react";
import { styled } from "goober";
import { useLocation, useParams } from "wouter";
import { Page } from "../core/Page";
import { RepoInfo } from "../repo/RepoInfo";
import { RepoStats } from "../repo/RepoStats";
import { RepoChats } from "../repo/RepoChats";
import { getRepositories } from "../../util/db.util";
import { toShortId } from "../../util/id.util";
import type { Repository, Chat, ImportStats } from "../../types/db.types";

export const PageRepo = () => {
  const params = useParams<{ repoShortId: string }>();
  const [_location, setLocation] = useLocation();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRepoData = async () => {
      try {
        const { repositoriesRepository, chatsRepository } = getRepositories();

        if (!params.repoShortId) {
          setLoading(false);
          return;
        }

        const repo = await repositoriesRepository.readByShortId(
          params.repoShortId
        );

        if (!repo) {
          setLoading(false);
          return;
        }

        setRepository(repo);

        const [repoChats, repoStats] = await Promise.all([
          chatsRepository.getChatsByRepoId(repo.id),
          repositoriesRepository.getImportStats(repo.id),
        ]);

        setChats(repoChats);
        setStats(repoStats);
      } catch (error) {
        console.error("Failed to load repository data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRepoData();
  }, [params.repoShortId]);

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

  if (loading) {
    return (
      <Page>
        <LoadingText>Loading repository...</LoadingText>
      </Page>
    );
  }

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

const LoadingText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const ErrorText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
