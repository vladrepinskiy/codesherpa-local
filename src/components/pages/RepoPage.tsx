import { useEffect, useState } from "react";
import { styled } from "goober";
import { useLocation, useParams } from "wouter";
import { Page } from "../core/Page";
import { Button } from "../core/Button";
import { getRepositories } from "../../util/db.util";
import { toShortId } from "../../util/id.util";
import type { Repository, Chat, ImportStats } from "../../types/db.types";

export const RepoPage = () => {
  const params = useParams<{ repoShortId: string }>();
  const [, setLocation] = useLocation();
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
        <Header>
          <BackButton onClick={() => setLocation("/")}>← Back</BackButton>
          <Title>{repository.full_name}</Title>
        </Header>

        <RepoInfo>
          {repository.description && (
            <Description>{repository.description}</Description>
          )}
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
        </RepoInfo>

        {stats && (
          <StatsSection>
            <StatsTitle>Import Statistics</StatsTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{stats.filesCount}</StatValue>
                <StatLabel>Files</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.issuesCount}</StatValue>
                <StatLabel>Issues</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.pullRequestsCount}</StatValue>
                <StatLabel>Pull Requests</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{stats.commentsCount}</StatValue>
                <StatLabel>Comments</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>
        )}

        <ChatsSection>
          <ChatsHeader>
            <ChatsTitle>Chats</ChatsTitle>
            <Button onClick={handleNewChat}>New Chat</Button>
          </ChatsHeader>
          {chats.length === 0 ? (
            <EmptyState>
              <EmptyText>No chats yet</EmptyText>
              <Button onClick={handleNewChat}>Start a new chat</Button>
            </EmptyState>
          ) : (
            <ChatsList>
              {chats.map((chat) => (
                <ChatCard key={chat.id} onClick={() => handleChatClick(chat)}>
                  <ChatTitle>
                    {chat.title || `Chat ${toShortId(chat.id)}`}
                  </ChatTitle>
                  <ChatMeta>
                    Updated: {new Date(chat.updated_at).toLocaleString()}
                  </ChatMeta>
                </ChatCard>
              ))}
            </ChatsList>
          )}
        </ChatsSection>
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

const Header = styled("div")`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled(Button)`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
`;

const Title = styled("h1")`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.palette.text};
`;

const RepoInfo = styled("div")`
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

const StatsSection = styled("div")`
  margin-bottom: 2rem;
`;

const StatsTitle = styled("h2")`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: ${(props) => props.theme.palette.text};
`;

const StatsGrid = styled("div")`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const StatCard = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled("div")`
  font-size: 2rem;
  font-weight: 600;
  color: ${(props) => props.theme.palette.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled("div")`
  font-size: 0.875rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const ChatsSection = styled("div")`
  margin-bottom: 2rem;
`;

const ChatsHeader = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChatsTitle = styled("h2")`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${(props) => props.theme.palette.text};
`;

const ChatsList = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatCard = styled("div")`
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.palette.accent};
    transform: translateY(-2px);
  }
`;

const ChatTitle = styled("h3")`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: ${(props) => props.theme.palette.text};
`;

const ChatMeta = styled("div")`
  font-size: 0.875rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const EmptyState = styled("div")`
  text-align: center;
  padding: 3rem;
  background-color: ${(props) => props.theme.palette.bg};
  border: 1px solid ${(props) => props.theme.palette.textMuted};
  border-radius: 0.75rem;
`;

const EmptyText = styled("p")`
  font-size: 1rem;
  color: ${(props) => props.theme.palette.textMuted};
  margin: 0 0 1rem 0;
`;

const LoadingText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;

const ErrorText = styled("div")`
  font-size: 1.125rem;
  color: ${(props) => props.theme.palette.textMuted};
`;
