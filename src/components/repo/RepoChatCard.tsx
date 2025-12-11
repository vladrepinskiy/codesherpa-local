import { styled } from "goober";
import { toShortId } from "../../util/id.util";
import type { Chat } from "../../types/db.types";

type RepoChatCardProps = {
  chat: Chat;
  onClick: () => void;
};

export const RepoChatCard = ({ chat, onClick }: RepoChatCardProps) => {
  return (
    <ChatCard onClick={onClick}>
      <ChatTitle>{chat.title || `Chat ${toShortId(chat.id)}`}</ChatTitle>
      <ChatMeta>Updated: {new Date(chat.updated_at).toLocaleString()}</ChatMeta>
    </ChatCard>
  );
};

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
