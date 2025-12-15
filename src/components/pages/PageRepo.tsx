import { styled } from "goober";
import { useLocation, useParams } from "wouter";
import { useChats } from "../../hooks/useChats";
import { useRepo } from "../../hooks/useRepo";
import type { Chat } from "../../types/db.types";
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

  const repository = params.repoShortId
    ? getRepositoryByShortId(params.repoShortId)
    : undefined;

  const chats = repository ? getChatsByRepoId(repository.id) : [];

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

        {repository.stats && <RepoStats stats={repository.stats} />}

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
