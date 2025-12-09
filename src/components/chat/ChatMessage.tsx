import { styled } from "goober";
import type { ChatMessage as ChatMessageType } from "../../types/llm.types";

type ChatMessageProps = {
  message: ChatMessageType;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <MessageContainer $role={message.role}>
      <MessageContent $role={message.role}>{message.content}</MessageContent>
    </MessageContainer>
  );
};

const MessageContainer = styled("div")<{ $role: "user" | "assistant" }>`
  display: flex;
  justify-content: ${(props) => (props.$role === "user" ? "flex-end" : "flex-start")};
  margin-bottom: 1rem;
`;

const MessageContent = styled("div")<{ $role: "user" | "assistant" }>`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background-color: ${(props) =>
    props.$role === "user"
      ? props.theme.palette.accent
      : props.theme.palette.button.bg};
  color: ${(props) =>
    props.$role === "user"
      ? "#ffffff"
      : props.theme.palette.text};
  font-size: ${(props) => props.theme.fontSizes.md};
  line-height: 1.5;
  word-wrap: break-word;
`;
