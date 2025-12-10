import { styled } from "goober";
import { ChatInput } from "../chat/ChatInput";
import { ChatLoadingSpinner } from "../chat/ChatLoadingSpinner";
import { ChatMessageList } from "../chat/ChatMessageList";
import { useChat } from "../../hooks/useChat";
import { useLLM } from "../../hooks/useLLM";
import { Page } from "./Page";

export const Chat = () => {
  const { isInitialized } = useLLM();
  const {
    messages,
    input,
    isLoading,
    isDbReady,
    handleInputChange,
    handleSubmit,
  } = useChat();

  if (!isInitialized || !isDbReady) {
    return (
      <Page>
        <ChatLoadingSpinner />
      </Page>
    );
  }

  return (
    <Page>
      <ChatContainer>
        <ChatMessageList messages={messages} />
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </ChatContainer>
    </Page>
  );
};

const ChatContainer = styled("div")`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.palette.bg};
  border-radius: 0.5rem;
  overflow: hidden;
`;

