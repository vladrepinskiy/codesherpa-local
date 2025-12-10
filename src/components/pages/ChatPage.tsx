import { ChatProvider } from "../../context/chat.provider";
import { Chat } from "../core/Chat";
import { Page } from "../core/Page";

export const ChatPage = () => {
  return (
    <ChatProvider>
      <Page>
        <Chat />
      </Page>
    </ChatProvider>
  );
};
