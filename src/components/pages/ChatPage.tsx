import { ChatProvider } from "../../context/chat.provider";
import { Chat } from "../core/Chat";

export const ChatPage = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};
