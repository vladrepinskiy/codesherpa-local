import { styled } from "goober";
import { Button } from "../core/Button";
import { RepoChatCard } from "./RepoChatCard";
import type { Chat } from "../../types/db.types";

type RepoChatsProps = {
  chats: Chat[];
  onNewChat: () => void;
  onChatClick: (chat: Chat) => void;
};

export const RepoChats = ({
  chats,
  onNewChat,
  onChatClick,
}: RepoChatsProps) => {
  return (
    <ChatsSection>
      <ChatsHeader>
        <ChatsTitle>Chats</ChatsTitle>
        <Button onClick={onNewChat}>New Chat</Button>
      </ChatsHeader>
      {chats.length === 0 ? (
        <EmptyState>
          <EmptyText>No chats yet</EmptyText>
          <Button onClick={onNewChat}>Start a new chat</Button>
        </EmptyState>
      ) : (
        <ChatsList>
          {chats.map((chat) => (
            <RepoChatCard
              key={chat.id}
              chat={chat}
              onClick={() => onChatClick(chat)}
            />
          ))}
        </ChatsList>
      )}
    </ChatsSection>
  );
};

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
