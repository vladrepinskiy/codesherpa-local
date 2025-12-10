import { styled } from "goober";
import type { Message } from "../../types/db.types";
import { ChatMessage } from "./ChatMessage";

type ChatMessageListProps = {
  messages: Message[];
};

export const ChatMessageList = ({ messages }: ChatMessageListProps) => {
  return (
    <Container>
      {messages.length === 0 ? (
        <EmptyState>
          <EmptyText>Start a conversation...</EmptyText>
        </EmptyState>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id || Math.random()} message={message} />
        ))
      )}
    </Container>
  );
};

const Container = styled("div")`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled("div")`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const EmptyText = styled("p")`
  font-size: ${(props) => props.theme.fontSizes.md};
  color: ${(props) => props.theme.palette.textMuted};
  margin: 0;
`;
