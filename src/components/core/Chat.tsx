import { styled } from "goober";
import { useLLM } from "../../hooks/useLLM";
import { useChat } from "../../hooks/useChat";
import { ChatInput } from "../chat/ChatInput";
import { ChatLoadingSpinner } from "../chat/ChatLoadingSpinner";
import { ChatMessageList } from "../chat/ChatMessageList";

export const Chat = () => {
  const { isInitialized } = useLLM();
  const { messages, input, setInput, isLoading, isDbReady, sendMessage } =
    useChat();

  if (!isInitialized || !isDbReady) {
    return <ChatLoadingSpinner />;
  }

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isInitialized || !isDbReady || !input.trim() || isLoading) {
      return;
    }

    await sendMessage(input);
  };

  return (
    <ChatContainer>
      <ChatMessageList messages={messages} />
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </ChatContainer>
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
