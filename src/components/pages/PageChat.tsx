import { ChatProvider } from "../../context/chat.provider";
import { Chat } from "../chat/Chat";
import { Page } from "../core/Page";

export const PageChat = () => {
  return (
    <ChatProvider>
      <Page>
        <Chat />
      </Page>
    </ChatProvider>
  );
};
